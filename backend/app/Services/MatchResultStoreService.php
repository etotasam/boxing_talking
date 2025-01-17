<?php

namespace App\Services;

use Exception;
use App\Models\BoxingMatch;
use App\Models\BoxerTitleSnapshot;
use App\Utilities\BoxersTitleSnapshotUtility;
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

      //? BoxerTitleSnapshotの取得
      $boxerTitleSnapshot = $match->boxerTitleSnapshot;

      //? 選手の戦歴を準備、作成(フォーマット)
      [$redBoxerRecord, $blueBoxerRecord] = $this->prepareBoxerRecord($match);

      //TODO resultのstateがfailのタイトルはadjustBoxerTitles関数によりtitlesテーブルからは削除されているはずなので、それを元に戻す処理もしないと不整合が生じる
      //? すでにmatch_resultが存在している場合はボクサーの戦歴を元に戻す
      $pastResult = $match->result;
      if ($pastResult) {
        [$rollbackRedBoxerRecord, $rollbackBlueBoxerRecord] = $this->rollbackBoxersRecord($pastResult->toArray(), $redBoxerRecord, $blueBoxerRecord, $boxerTitleSnapshot);
        $redBoxerRecord = $rollbackRedBoxerRecord; //! $redBoxerRecordの上書き
        $blueBoxerRecord = $rollbackBlueBoxerRecord; //! $blueBoxerRecordの上書き
      }

      //? 勝敗に応じてボクサーの戦績を変更する
      [$newRedBoxerRecord, $newBlueBoxerRecord] = $this->adjustBoxerRecordWithResult($matchResultArray, $redBoxerRecord, $blueBoxerRecord);

      $match = $this->matchRepository->getMatchById($matchId);
      //? この試合のBoxerTitleSnapshotの取得
      $matchTitles = $match->matchTitles;

      DB::beginTransaction();
      //? タイトルマッチの時のみ
      if (!$matchTitles->isEmpty()) {

        //? 試合結果の取得
        $newResult = $matchResultArray["match_result"];

        $isWinner = $newResult === 'red' || $newResult === 'blue';

        //? titlesテーブルを試合設定時の状態に戻す
        // $boxerTitleSnapshot = $match->boxerTitleSnapshot;
        // if ($boxerTitleSnapshot->isNotEmpty()) {
        //   $this->rollbackBoxerTitles($boxerTitleSnapshot);
        // }

        //? BoxerTitleSnapshot(DB)のstateを更新
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
   * @param BoxingMatch $match
   * @param int $winnerBoxerId
   * @param int $loserBoxerId
   * @return void
   */
  //TODO 多分ここで間違いが生じてる。titlesテーブルの更新時に
  private function adjustBoxerTitles(BoxingMatch $match, int $winnerBoxerId, int $loserBoxerId): void
  {

    $matchTitles = $match->matchTitles;
    $matchWeightId = $match->weight_id;

    //? 勝者のタイトルを保存
    $matchTitles->each(function ($title) use ($winnerBoxerId, $matchWeightId) {
      $this->titleRepository->storeTitle($winnerBoxerId, $title->organization_id, $matchWeightId);
    });

    //? 敗者のタイトルを削除
    $matchTitles->each(function ($title) use ($loserBoxerId, $matchWeightId) {
      $this->titleRepository->deleteTitle($loserBoxerId, $matchWeightId, $title->organization_id);
    });

    //? 勝者の試合時の保持タイトルで試合に掛けられたタイトルがあれば取得
    // $winnerBoxerTitlesAtMatch = BoxersTitleSnapshotUtility::extractHoldTitleSnapshot($match, $winnerBoxerId);

    //? 敗者の試合時の保持タイトルで試合に掛けられたタイトルがあればtitlesテーブルから削除
    // BoxersTitleSnapshotUtility::extractHoldTitleSnapshot($match, $loserBoxerId)
    //   ->each(function ($title) use ($loserBoxerId, $matchWeightId) {
    //     $this->titleRepository->deleteTitle($loserBoxerId, $title->organization_id, $matchWeightId);
    //   });

    //? 試合に掛けられたタイトルで、勝者が保持していないタイトルをtitlesテーブルに登録
    // BoxersTitleSnapshotUtility::extractUnHoldTitleSnapshot($winnerBoxerTitlesAtMatch, $matchTitles)
    //   ->each(function ($title) use ($winnerBoxerId, $matchWeightId) {
    //     $this->titleRepository->createTitlesHoldByTheBoxer($winnerBoxerId, $title->organization_id, $matchWeightId);
    //   });
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

    //TODO 以下はDBデータを操作している。ここでやるとトランザクション外で行われるため、不整合が生じる可能性がある


    return [$redBoxerRecord, $blueBoxerRecord];
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
