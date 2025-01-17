<?php

namespace App\Services;

use Exception;
use App\Models\BoxingMatch;
use App\Utilities\BoxersTitleSnapshotUtility;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;


class BoxerTitleSnapshotService

{
  public function __construct(
    protected BoxerTitleSnapshotInterface $boxerTitleSnapshotRepository,
  ) {}

  /**
   * Updates the title state of boxers based on the match result.
   *
   * @param BoxingMatch $match
   * @param string $result
   * @return void
   */
  public function updateBoxerTitleSnapshotState(BoxingMatch $match, string $result): void
  {
    //? 試合結果修正で勝者が変わる場合はボクサーのタイトルスナップショットのstateがnewのタイトルは削除する
    $this->deleteBoxerTitleSnapshotIfStateNew($match, $result);

    // \Log::debug("テスト : " . print_r($match->boxerTitleSnapshot->toArray(), true));
    //? 一度snapshotのstateをnullに初期化
    $isFailedStateReset = $this->boxerTitleSnapshotRepository->resetBoxerTitleSnapshot($match->id);
    if ($isFailedStateReset) {
      throw new Exception('Failed reset boxer title snapshot state to null');
    }

    //? 勝者がいなければ早期リターン
    $isWinner = $result === "red" || $result === "blue";
    if (!$isWinner) return;

    //? BoxerTitleSnapshotの更新と保存
    $this->storeOrUpdateBoxerTitleSnapshot($match, $result);
  }

  /**
   * 試合結果変更時に勝敗にも変更がある場合はstateがnewであるタイトルのスナップショットを削除
   *
   * @param BoxingMatch $match
   * @param string $newResult
   * @return void
   */
  private function deleteBoxerTitleSnapshotIfStateNew(BoxingMatch $match, string $newResult): void
  {
    if ($match->result && $match->result !== $newResult) {
      $match->boxerTitleSnapshot->each(function ($snapshot) {
        if ($snapshot->state === "new") {
          $this->boxerTitleSnapshotRepository->deleteBoxerTitleSnapshot($snapshot->match_id, $snapshot->boxer_id, $snapshot->organization_id, $snapshot->weight_division_id);
        }
      });
    }
  }

  /**
   * ? ボクサーのタイトルスナップショットを新たに保存また更新
   * @param BoxingMatch $match
   * @param string $result
   * @return void
   */
  public function storeOrUpdateBoxerTitleSnapshot(BoxingMatch $match, string $result): void
  {
    //? 赤青ボクサーのid
    $redBoxerId = $match->red_boxer_id;
    $blueBoxerId = $match->blue_boxer_id;

    //? 勝者のid
    $winnerBoxerId = $result === "red" ? $redBoxerId : $blueBoxerId;
    //? 敗者のid
    $loserBoxerId = $result === "red" ? $blueBoxerId : $redBoxerId;

    //? ボクサーの試合時の保持タイトルで試合に掛けられているタイトルを取得
    $winnerBoxerTitleSnapshot = BoxersTitleSnapshotUtility::extractHoldTitleSnapshot($match, $winnerBoxerId);
    $loserBoxerTitleSnapshot = BoxersTitleSnapshotUtility::extractHoldTitleSnapshot($match, $loserBoxerId);

    //? 勝者のタイトルスナップショットを更新(防衛タイトル)
    foreach ($winnerBoxerTitleSnapshot as $winnerTile) {
      $this->boxerTitleSnapshotRepository->updateBoxerTitleSnapshot($winnerTile, "still");
    }

    //? 敗者のタイトルスナップショットを更新(陥落タイトル)
    foreach ($loserBoxerTitleSnapshot as $loserTile) {
      $this->boxerTitleSnapshotRepository->updateBoxerTitleSnapshot($loserTile, "fall");
    }

    //? 勝者が新たに取得したタイトルを保存
    BoxersTitleSnapshotUtility::extractUnHoldTitleSnapshot($winnerBoxerTitleSnapshot, $match->matchTitles)
      ->each(function ($title) use ($match, $winnerBoxerId) {
        $this->boxerTitleSnapshotRepository->storeBoxerTitleSnapshot([
          "match_id" => $match->id,
          "boxer_id" => $winnerBoxerId,
          "organization_id" => $title->organization_id,
          "weight_division_id" => $match->weight_id,
          "state" => "new"
        ]);
      });
  }
}
