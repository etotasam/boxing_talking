<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Services\TitleMatchService;
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;
use Illuminate\Database\Events\QueryExecuted;

class MatchService
{

  public function __construct(
    protected TitleMatchService $titleMatchService,
    protected MatchRepositoryInterface $matchRepository,
    protected CommentRepositoryInterface $commentRepository,
    protected TitleMatchRepositoryInterface $titleMatchRepository,
    protected WinLossPredictionRepositoryInterface $predictionRepository,
    protected BoxerRepositoryInterface $boxerRepository,
  ) {
  }

  /**
   * 試合データの保存
   * errorCode 50 titleMatchesテーブルへの登録が失敗
   * errorCode 51 matchesテーブルへの登録が失敗
   * @param array $matchDataForStore
   *  [
   *    'match_date' => '2023-10-18',
   *    'red_boxer_id' => 45,
   *    'blue_boxer_id' => 43,
   *    'grade' => 'タイトルマッチ',
   *    'country' => 'Mexico',
   *    'venue' => '会場',
   *    'weight' => 'クルーザー',
   *    'titles' => [
   *        0 => 'WBC暫定',
   *        1 => 'WBO暫定',
   *     ],
   *  ]
   *
   * @return void
   */
  public function storeMatch(array $matchDataForStore)
  {
    $organizationsNameArray = $this->extractOrganizationsArray($matchDataForStore);
    unset($matchDataForStore['titles']);

    DB::beginTransaction();
    try {
      $createdMatch = $this->matchRepository->createMatch($matchDataForStore);
      if (!$createdMatch) {
        throw new Exception("Can not create match", 51);
      }

      $titleMatchesArray = $this->titleMatchService->formatForStoreToTitleMatchTable($createdMatch['id'], $organizationsNameArray);
      $isSuccessStoreTitleMatch = $this->titleMatchRepository->insertTitleMatch($titleMatchesArray);
      if (!$isSuccessStoreTitleMatch) {
        throw new Exception("Failed store title match", 50);
      }
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with create match or store title match data :" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage(), 500);
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception("Failed create match or store title match data :" . $e->getMessage(), 500);
    }

    DB::commit();
  }

  /**
   * 試合一覧の取得
   * errorCode 41 admin認証なし
   * @param string|null range
   * @return \Illuminate\Support\Collection $matches
   */
  public function getMatchesExecute(string|null $range)
  {

    if ($range == "all") {
      if (Auth::user()->administrator) {
        $matches = $this->matchRepository->getAllMatches();
      } else {
        throw NonAdministratorException::create();
      }
    } else if ($range == "past") {
      $matches = $this->matchRepository->getPastMatches();
    } else {
      $matches = $this->matchRepository->getMatches();
    }

    return $matches;
  }

  /**
   * 試合データの更新
   *
   * @param array $updateMatchData 更新データだけが連想配列で送られる 例)['name' => '変更名', 'titles' => ['WBA', 'WBC']]
   *
   * @return void
   */
  public function updateMatch(int $matchId, array $updateMatchData)
  {
    DB::beginTransaction();
    try {
      if (array_key_exists('titles', $updateMatchData)) {
        $this->titleMatchService->updateTitleMatchExecute($matchId, $updateMatchData['titles']);
        unset($updateMatchData['titles']);
      }
      if (!empty($updateMatchData)) {
        $this->matchRepository->updateMatch($matchId, $updateMatchData);
      }
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with update match :" .  $e->getMessage());
      throw new Exception("Unexpected error on database :" .  $e->getMessage());
    } catch (Exception $e) {
      throw new Exception("Failed update match");
    }

    DB::commit();
  }

  /**
   * @param array $matchDataForStore
   *  [
   *    'match_date' => '2023-10-18',
   *    'red_boxer_id' => 45,
   *    'blue_boxer_id' => 43,
   *    'grade' => 'タイトルマッチ',
   *    'country' => 'Mexico',
   *    'venue' => '会場',
   *    'weight' => 'クルーザー',
   *    'titles' => [
   *        0 => 'WBC暫定',
   *        1 => 'WBO暫定',
   *     ],
   *  ]
   *
   * @return  array organizationsNameArray
   */
  protected function extractOrganizationsArray(array $matchDataForStore): array
  {
    if (array_key_exists('titles', $matchDataForStore)) {
      $organizationsArray = $matchDataForStore['titles'];
    } else {
      \Log::error("Titles(organizations) is not exists in match data");
      throw new Exception("titles(organizations) is not exists in match data", 406);
    }
    return $organizationsArray;
  }


  /**
   * 試合データ削除の実行メソッド
   * @errorCode 44 targetの試合データがない
   * @param int $matchId
   * @return void
   */
  public function deleteMatchExecute(int $matchId): void
  {
    if (!$this->matchRepository->isMatch($matchId)) {
      throw new Exception("Can not found match to delete", 44);
    }
    DB::beginTransaction();
    try {
      $this->titleMatchRepository->deleteTitleMatch($matchId);
      $this->commentRepository->deleteAllCommentOnMatch($matchId);
      $this->predictionRepository->deletePredictionOnMatch($matchId);
      // WinLossPredictionRepository::delete($matchId);
      $this->matchRepository->deleteMatch($matchId);
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with delete match : " . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception("Failed delete match :" . $e->getMessage());
    }

    DB::commit();
  }

  public function isMatchDateTodayOrPast(int $matchId): bool
  {
    $match = $this->matchRepository->getMatchById($matchId);
    $matchDate = strtotime($match['match_date']);
    $nowDate = strtotime('now');

    return ($nowDate > $matchDate);
  }

  public function matchPredictionCountUpdate(int $matchId, string $prediction): void
  {
    $match = $this->matchRepository->getMatchById($matchId);
    if ($prediction == "red") {
      $match->increment("count_red");
    } else if ($prediction == "blue") {
      $match->increment("count_blue");
    }
    $match->save();
  }

  /**
   * @param array $matchResultArray [
   * "match_id" => number,
   * "match_result" => "red" | "blue" | "draw" | "no-contest",
   * "detail" => "ko" | "tko" | "ud" | "md" | "sd",
   * "round" => number
   * ]
   *
   * @return void
   */
  public function storeMatchResultExecute(array $matchResultArray)
  {
    try {
      // バリデーション。必須項目チェック
      $this->validateMatchResultArray($matchResultArray);

      $matchId = (int)$matchResultArray['match_id'];

      //? 試合情報の取得
      $matchData = $this->matchRepository->getMatchById($matchId);
      $redBoxer = $matchData->redBoxer;
      $blueBoxer = $matchData->blueBoxer;
      $pastResult = $matchData->result;

      $redBoxerRecord = [
        "id" => $redBoxer["id"],
        "win" => $redBoxer["win"],
        "lose" => $redBoxer["lose"],
        "draw" => $redBoxer["draw"],
        "ko" => $redBoxer["ko"]
      ];
      $blueBoxerRecord = [
        "id" => $blueBoxer["id"],
        "win" => $blueBoxer["win"],
        "lose" => $blueBoxer["lose"],
        "draw" => $blueBoxer["draw"],
        "ko" => $blueBoxer["ko"]
      ];

      //? すでにmatch_resultが存在しているかどうかをチェック
      $isMatchResult = $this->matchRepository->isMatchResult($matchId);
      if ($isMatchResult) {
        [$rollbackRedBoxerRecord, $rollbackBlueBoxerRecord] = $this->rollbackBoxersRecord($pastResult->toArray(), $redBoxerRecord, $blueBoxerRecord);
        $redBoxerRecord = $rollbackRedBoxerRecord; //! $redBoxerRecordの上書き
        $blueBoxerRecord = $rollbackBlueBoxerRecord; //! $blueBoxerRecordの上書き
      }

      [$newRedBoxerRecord, $newBlueBoxerRecord] = $this->updateBoxersRecord($matchResultArray, $redBoxerRecord, $blueBoxerRecord);

      DB::beginTransaction();
      $this->boxerRepository->updateBoxer($newRedBoxerRecord); //? red boxer のデータ更新
      $this->boxerRepository->updateBoxer($newBlueBoxerRecord); //? blue boxer のデータ更新

      //? 新しい試合結果を登録 of 更新
      $this->matchRepository->updateOrCreateMatchResult($matchId, $matchResultArray);

      DB::commit();
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with store match result :" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (\Exception $e) {
      DB::rollBack();
      throw new Exception($e->getMessage());
    }
  }


  /**
   * @param array $pastResult (既存のmatchResultデータ)
   * @param array $redBoxerRecord (red boxer data)
   * @param array $blueBoxerRecord (blue boxer data)
   *
   * @return array [$rollbackRedBoxerRecord, $rollbackBlueBoxerRecord]
   */
  private function rollbackBoxersRecord(array $pastResult, array $redBoxerRecord, array $blueBoxerRecord)
  {

    //? past resultが"無効試合"ならそこで終了
    if ($pastResult['match_result'] == "no-contest") {
      return [$redBoxerRecord, $blueBoxerRecord];
    }

    $isKo = $pastResult["detail"] == "ko" || $pastResult["detail"] == "tko";

    //? pastResult の勝者が red の場合
    if ($pastResult['match_result'] == "red") {
      $redBoxerRecord["win"] && --$redBoxerRecord["win"]; //! redのwin数を減
      $blueBoxerRecord["lose"] && --$blueBoxerRecord["lose"]; //! blueのlose数を減
      if ($isKo) {
        $redBoxerRecord["ko"] && --$redBoxerRecord["ko"]; //! redのko数を減
      }
    }
    //? pastResult の勝者が blue の場合
    if ($pastResult['match_result'] == "blue") {
      $redBoxerRecord["lose"] && --$redBoxerRecord["lose"]; //! redのlose数を減
      $blueBoxerRecord["win"] && --$blueBoxerRecord["win"]; //! blueのwin数を減
      if ($isKo) {
        $blueBoxerRecord["ko"] && --$blueBoxerRecord["ko"]; //! blueのko数を減
      }
    }

    //? past result が draw の場合
    if ($pastResult['match_result'] == "draw") {
      $redBoxerRecord["draw"] && --$redBoxerRecord["draw"]; //! redのdraw数を減
      $blueBoxerRecord["draw"] && --$blueBoxerRecord["draw"]; //! blueのdraw数を減
    }

    return [$redBoxerRecord, $blueBoxerRecord];
  }

  /**
   * @param array $postResult (matchResultデータ)
   * @param array $redBoxerRecord (red boxer data)
   * @param array $blueBoxerRecord (blue boxer data)
   *
   * @return array [$newRedBoxerRecord, $newBlueBoxerRecord]
   */
  private function updateBoxersRecord(array $postResult, array $redBoxerRecord, array $blueBoxerRecord)
  {
    //? past resultが"無効試合"ならそこで終了
    if ($postResult['match_result'] == "no-contest") {
      return [$redBoxerRecord, $blueBoxerRecord];
    }

    $isKo = $postResult["detail"] == "ko" || $postResult["detail"] == "tko";

    //? postResult の勝者が red の場合
    if ($postResult['match_result'] == "red") {
      ++$redBoxerRecord["win"]; //! redのwin数を+
      ++$blueBoxerRecord["lose"]; //! blueのlose数を+
      if ($isKo) {
        ++$redBoxerRecord["ko"]; //! redのko数を+
      }
    }
    //? postResult の勝者が blue の場合
    if ($postResult['match_result'] == "blue") {
      ++$redBoxerRecord["lose"]; //! redのlose数を+
      ++$blueBoxerRecord["win"]; //! blueのwin数を+
      if ($isKo) {
        ++$blueBoxerRecord["ko"]; //! blueのko数を+
      }
    }

    //? postResult が draw の場合
    if ($postResult['match_result'] == "draw") {
      ++$redBoxerRecord["draw"]; //! redのdraw数を+
      ++$blueBoxerRecord["draw"]; //! blueのdraw数を+
    }

    return [$redBoxerRecord, $blueBoxerRecord];
  }


  private function validateMatchResultArray(array $matchResultArray)
  {
    if (empty($matchResultArray['match_id'])) {
      throw new Exception("'match_id' is required");
    }

    if (empty($matchResultArray['match_result'])) {
      throw new Exception("'match_result' is empty");
    }

    $isWinner = $matchResultArray['match_result'] === "red" || $matchResultArray['match_result'] === "blue";

    if ($isWinner) {
      if (empty($matchResultArray["detail"])) {
        throw new Exception("'detail' is required when there is a winner");
      }
    }

    $isKo = $isWinner && $matchResultArray['detail'] === "ko" || $matchResultArray['detail'] === "tko";

    if ($isKo) {
      if (empty($matchResultArray["round"])) {
        throw new Exception("'round' is required when winner got KO");
      }
    }
  }
}
