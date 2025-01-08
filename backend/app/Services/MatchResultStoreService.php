<?php

namespace App\Services;

use Exception;
use App\Models\BoxingMatch;
use App\Models\BoxerTitleSnapshot;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use \Illuminate\Support\Collection;
use App\Services\BoxerTitleSnapshotService;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;




class MatchResultStoreService
{
  public function __construct(
    protected BoxerTitleSnapshotService $boxerTitleSnapshotService,
    protected MatchRepositoryInterface $matchRepository,
    protected BoxerRepositoryInterface $boxerRepository,
    protected TitleRepositoryInterface $titleRepository,
  ) {}


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
      $match = $this->matchRepository->getMatchById($matchId);

      //? 選手の戦歴を準備、作成
      [$redBoxerRecord, $blueBoxerRecord] = $this->prepareBoxerRecord($match);

      //? すでにmatch_resultが存在している場合はボクサーの戦歴を元に戻す
      if ($match->result) {
        [$rollbackRedBoxerRecord, $rollbackBlueBoxerRecord] = $this->rollbackBoxersRecord($match->result->toArray(), $redBoxerRecord, $blueBoxerRecord);
        $redBoxerRecord = $rollbackRedBoxerRecord; //! $redBoxerRecordの上書き
        $blueBoxerRecord = $rollbackBlueBoxerRecord; //! $blueBoxerRecordの上書き
      }

      //? 勝敗に応じてボクサーの戦績を変更する
      [$newRedBoxerRecord, $newBlueBoxerRecord] = $this->adjustBoxerRecordWithResult($matchResultArray, $redBoxerRecord, $blueBoxerRecord);

      $match = $this->matchRepository->getMatchById($matchId);
      //? この試合のBoxerTitleSnapshotの取得
      $titleSnapshot = $match->boxerTitleSnapshot;
      $matchTitles = $match->matchTitles;


      DB::beginTransaction();
      //? タイトルマッチの時のみ
      if (!$matchTitles->isEmpty()) {

        //? 試合結果の取得
        $result = $matchResultArray["match_result"];
        //? この試合に勝者がいるか
        $isWinner = $result === 'red' || $result === 'blue';

        //? BoxerTitleSnapshot(DB)のstateを更新
        //TODO refactor なんでパラメータで$matchを渡してるのにそこから得られるものも別途渡してるの？$match渡してるならそれだけでええやん
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($match, $result, $match->redBoxer->id, $match->blueBoxer->id);

        if ($isWinner) {
          //TODO adjustBoxerTitlesは試合の登録は完了(refactorは必須かも)してるが、負けた方のタイトルを削除する仕様はまだ実装していない
          $winnerBoxerId = $result === 'red' ? $match->red_boxer_id : $match->blue_boxer_id;
          $this->adjustBoxerTitles($matchTitles, $titleSnapshot, $match->weight_id, $winnerBoxerId);
        }
      }

      //? 試合結果に基づいてボクサーの戦歴を更新
      $this->boxerRepository->updateBoxer($newRedBoxerRecord);
      $this->boxerRepository->updateBoxer($newBlueBoxerRecord);


      //? 試合結果の登録 or 更新
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
   * タイトルマッチの試合結果によるタイトルの変動を管理
   * @param Collection $matchTitles
   * @param Collection $boxerTitleSnapshot
   * @param int $matchWeightId
   * @param int $winnerBoxerId
   * @return void
   */
  private function adjustBoxerTitles(Collection $matchTitles, Collection $boxerTitleSnapshot, int $matchWeightId, int $winnerBoxerId): void
  {
    //? 試合と同じ階級で試合時に保持していたタイトルを抽出
    $hasTitles = $boxerTitleSnapshot->map(function ($snapTitle) use ($winnerBoxerId, $matchWeightId) {
      if ($snapTitle['boxer_id'] === $winnerBoxerId && $matchWeightId === $snapTitle['weight_division_id']) {
        return $snapTitle;
      }
    })->filter()->values();

    //? 保持タイトルがある場合
    if (!$hasTitles->isEmpty()) {
      foreach ($matchTitles as $matchTitle) {
        foreach ($hasTitles as $hasTitle) {
          $hasOrganizationsTitle = $matchTitle['organization_id'] === $hasTitle['organization_id'];
          if (!$hasOrganizationsTitle) {
            $this->titleRepository->createTitlesHoldByTheBoxer($winnerBoxerId, $matchTitle['organization_id'], $matchWeightId);
          }
        }
      }
      //? 保持タイトルが皆無の場合
    } else {
      $registerTitles = $matchTitles->map(function ($title) use ($winnerBoxerId, $matchWeightId) {
        return ['boxer_id' => $winnerBoxerId, 'organization_id' => $title['organization_id'], 'weight_division_id' => $matchWeightId];
      });

      $isFailedStoreTitles = !$this->titleRepository->storeTitlesHoldByTheBoxer($registerTitles->toArray());
      if ($isFailedStoreTitles) {
        throw new Exception('Failed insert new boxer titles');
      }
    }
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

  /**
   * @param BoxingMatch $matchData (試合データ)
   * 
   * @return array (redBoxerRecord, blueBoxerRecord) - ["redBoxerRecord" => ["id" => , "win" => , "lose" => , "draw" => , "ko" => ]]
   */
  private function prepareBoxerRecord(BoxingMatch $matchData)
  {
    $redBoxer = $matchData->redBoxer;
    $blueBoxer = $matchData->blueBoxer;

    $redBoxerRecord = [
      "id" => $redBoxer->id,
      "win" => $redBoxer->win,
      "lose" => $redBoxer->lose,
      "draw" => $redBoxer->draw,
      "ko" => $redBoxer->ko
    ];
    $blueBoxerRecord = [
      "id" => $blueBoxer->id,
      "win" => $blueBoxer->win,
      "lose" => $blueBoxer->lose,
      "draw" => $blueBoxer->draw,
      "ko" => $blueBoxer->ko
    ];
    return [$redBoxerRecord, $blueBoxerRecord];
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
   * 試合結果に応じて両ボクサーの戦績を変更する
   * @param array $postResult (matchResultデータ)
   * @param array $redBoxerRecord (red boxer data)
   * @param array $blueBoxerRecord (blue boxer data)
   *
   * @return array [$newRedBoxerRecord, $newBlueBoxerRecord]
   */
  private function adjustBoxerRecordWithResult(array $postResult, array $redBoxerRecord, array $blueBoxerRecord)
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
}
