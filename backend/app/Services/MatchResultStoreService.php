<?php

namespace App\Services;

use Exception;
use App\Models\BoxingMatch;
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
   * "is_update_boxer_record_checked" => boolean,
   * "match_id" => number,
   * "match_result" => "red" | "blue" | "draw" | "no-contest",
   * "detail" => "ko" | "tko" | "ud" | "md" | "sd",
   * "round" => number
   * ]
   * @param $isUpdateBoxerRecordChecked boolean
   *
   * @return void
   */
  //TODO isUpdateBoxerRecordCheckedの値でボクサー戦績の更新の可否を実行
  public function storeMatchResultExecute(array $matchResultArray, bool $isUpdateBoxerRecordChecked)
  {
    try {
      //? バリデーション。必須項目チェック
      $this->validateMatchResultArray($matchResultArray);

      $matchId = (int)$matchResultArray['match_id'];

      //? 試合情報の取得
      $match = $this->matchRepository->getMatchById($matchId);

      //? 試合結果に応じてボクサーの戦績を更新する為のデータを準備、作成
      [$newRedBoxerRecord, $newBlueBoxerRecord] = $this->prepareBoxerRecord($match, $matchResultArray);

      DB::beginTransaction();
      //? タイトルマッチの時のみtitlesテーブルを更新
      if (!$match->matchTitles->isEmpty()) {
        $this->processTitlesAndTitleSnapshot($match, $matchResultArray);
      }

      //? 試合結果に基づいてボクサーの戦歴を更新
      $this->updateBoxerRecord($newRedBoxerRecord, $newBlueBoxerRecord);

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
   * ボクサーの戦歴を更新する為のデータを準備、作成
   * @param BoxingMatch $match
   * @param array $matchResultArray
   * @return array [$newRedBoxerRecord, $newBlueBoxerRecord]
   */
  private function prepareBoxerRecord(BoxingMatch $match, array $matchResultArray): array
  {
    //? 選手の戦歴を準備、作成(フォーマット)
    [$redBoxerRecord, $blueBoxerRecord] = $this->formatBoxerRecord($match);

    //? すでにmatch_resultが存在している場合はボクサーの戦歴を元に戻す
    $pastResult = $match->result;
    if ($pastResult) {
      [$redBoxerRecord, $blueBoxerRecord] = $this->rollbackBoxersRecord($pastResult->toArray(), $redBoxerRecord, $blueBoxerRecord, $match->boxerTitleSnapshot);
    }

    //? 勝敗に応じてボクサーの戦績を変更する
    [$newRedBoxerRecord, $newBlueBoxerRecord] = $this->adjustBoxerRecordWithResult($matchResultArray, $redBoxerRecord, $blueBoxerRecord);

    return [$newRedBoxerRecord, $newBlueBoxerRecord];
  }

  /**
   * boxerテーブルの更新(戦歴を更新)
   * @param array $newRedBoxerRecord
   * @param array $newBlueBoxerRecord
   * @return void
   */
  private function updateBoxerRecord(array $newRedBoxerRecord, array $newBlueBoxerRecord): void
  {
    $this->boxerRepository->updateBoxer($newRedBoxerRecord);
    $this->boxerRepository->updateBoxer($newBlueBoxerRecord);
  }


  /**
   * titlesテーブルとboxer_title_snapshotsテーブルの更新処理
   * @param BoxingMatch $match
   * @param array $matchResultArray
   * @return void
   */
  private function processTitlesAndTitleSnapshot(BoxingMatch $match, array $matchResultArray): void
  {

    $newResult = $matchResultArray["match_result"];
    $isWinner = $newResult === 'red' || $newResult === 'blue';

    //? boxer_title_snapshotsテーブルのstateを更新
    $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($match, $newResult);

    //? 勝者がいる場合はタイトルの変動を管理(titlesテーブルの更新)
    if ($isWinner) {
      $winnerBoxerId = $newResult === 'red' ? $match->red_boxer_id : $match->blue_boxer_id;
      $loserBoxerId = $newResult === 'red' ? $match->blue_boxer_id : $match->red_boxer_id;
      $this->adjustBoxerTitles($match, $winnerBoxerId, $loserBoxerId);
    } else {
      //? 引き分け or 無効試合の場合はtitlesテーブルを試合設定時の状態に戻す
      $boxerTitleSnapshot = $match->boxerTitleSnapshot;
      if ($boxerTitleSnapshot->isNotEmpty()) {
        $this->rollbackBoxerTitles($match);
      }
    }
  }



  /**
   * タイトルマッチの試合結果によるタイトルの変動を管理
   * @param BoxingMatch $match
   * @param int $winnerBoxerId
   * @param int $loserBoxerId
   * @return void
   */
  private function adjustBoxerTitles(BoxingMatch $match, int $winnerBoxerId, int $loserBoxerId): void
  {

    $matchTitles = $match->matchTitles;
    $matchWeightId = $match->weight_id;

    //? 勝者のタイトルを更新(追加)
    $matchTitles->each(function ($title) use ($winnerBoxerId, $matchWeightId) {
      $this->titleRepository->storeTitle($winnerBoxerId, $title->organization_id, $matchWeightId);
    });

    //? 敗者のタイトルを更新(削除)
    $matchTitles->each(function ($title) use ($loserBoxerId, $matchWeightId) {
      $this->titleRepository->deleteTitle($loserBoxerId, $matchWeightId, $title->organization_id);
    });
  }

  /**
   * 各ボクサーのtitlesテーブルデータを試合登録時の所持タイトルに戻す
   * @param BoxingMatch $match
   * @return void
   */
  private function rollbackBoxerTitles(BoxingMatch $match): void
  {
    $this->titleRepository->deleteTitlesHoldByTheBoxer($match->red_boxer_id);
    $this->titleRepository->deleteTitlesHoldByTheBoxer($match->blue_boxer_id);

    $match->boxerTitleSnapshot->each(function ($title) {
      if ($title->state !== "new") {
        $this->titleRepository->storeTitle($title->boxer_id, $title->organization_id, $title->weight_division_id);
      }
    });
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
   * 選手の戦績をフォーマット
   * @param BoxingMatch $matchData (試合データ)
   * 
   * @return array (redBoxerRecord, blueBoxerRecord) - ["redBoxerRecord" => ["id" => , "win" => , "lose" => , "draw" => , "ko" => ]]
   */
  private function formatBoxerRecord(BoxingMatch $matchData)
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
   * ボクサーの戦績を試合登録時の状態に戻す
   * @param array $pastResult (既存のmatchResultデータ)
   * @param array $redBoxerRecord (red boxer data)
   * @param array $blueBoxerRecord (blue boxer data)
   * @param Collection $boxerTitleSnapshot (BoxerTitleSnapshotデータ)
   *
   * @return array [$rollbackRedBoxerRecord, $rollbackBlueBoxerRecord]
   */
  private function rollbackBoxersRecord(array $pastResult, array $redBoxerRecord, array $blueBoxerRecord, Collection $boxerTitleSnapshot)
  {

    //? pastResultが"無効試合"ならそこで終了
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
