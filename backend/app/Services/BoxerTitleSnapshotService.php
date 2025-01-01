<?php

namespace App\Services;

use \Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\BoxerTitleSnapshot;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;



class BoxerTitleSnapshotService

{
  public function __construct(
    protected BoxerTitleSnapshotInterface $BoxerTitleSnapshotRepository,
  ) {}

  // TODO BoxerTitleSnapshotへのデータ登録のメソッドを作成するか、update, storeをそれぞれ別のserviceにするかを検討

  /**
   * Updates the title state of boxers based on the match result.
   *
   * @param BoxingMatch $match
   * @param Collection $titleSnapshot
   * @param string $result
   * @param int $redBoxerId
   * @param int $blueBoxerId
   * @return bool $isSuccessUpdateTitleSnapshot
   */
  public function updateBoxerTitleSnapshot(BoxingMatch $match, Collection $titleSnapshot, string $result, int $redBoxerId, int $blueBoxerId): void
  {
    //? 一度snapshotのstateをnullに初期化
    $isFailedStateReset = $this->BoxerTitleSnapshotRepository->resetBoxerTitleSnapshot($match->id);
    if ($isFailedStateReset) {
      throw new Exception('Failed reset boxer title snapshot state to null');
    }
    //? 勝者がいるかチェック
    $isWinner = $result === "red" || $result === "blue";

    //? 勝者がいなければ早期リターン
    if (!$isWinner) return;

    //? BoxerTitleSnapshotのstateの書き換え
    foreach ($match->matchTitles as $matchTitle) {
      foreach ($titleSnapshot as &$snapshot) {
        $isSameOrganization = $snapshot["organization_id"] === $matchTitle["organization_id"];
        $isSameWeight = $snapshot["weight_division_id"] === $match->weight_id;
        //? 試合にかけられたタイトルと選手の保持していたタイトルが同じ場合
        $isSameTitle = $isSameOrganization && $isSameWeight;
        //? 勝者がred
        $isWinRed = $result === "red";
        //? 勝者がblue
        $isWinBlue = $result === "blue";
        //? redのsnapshot
        $isTargetRed = $redBoxerId === $snapshot["boxer_id"];
        //? blueのsnapshot
        $isTargetBlue = $blueBoxerId === $snapshot["boxer_id"];

        $isTarget = $redBoxerId === $snapshot["boxer_id"] ? "red" : "blue";

        if ($isSameTitle) {
          $isFailedUpdateTitleState = false;
          if ($isWinRed) {
            $isFailedUpdateTitleState = $this->updateBoxerTitleState($snapshot, $isTargetRed, $isTargetBlue, "still", "fall");
          }
          if ($isWinBlue) {
            $isFailedUpdateTitleState =  $this->updateBoxerTitleState($snapshot, $isTargetRed, $isTargetBlue, "fall", "still");
          }
          if ($isFailedUpdateTitleState) {
            throw new Exception('Failed to update boxer title snapshot state');
          };
        }
      }
    }
  }


  /**
   * Updates the title state of a boxer based on the match result.
   *
   * @param BoxerTitleSnapshot $snapshot
   * @param bool $isTargetRed
   * @param bool $isTargetBlue
   * @param string $redState
   * @param string $blueState
   * 
   * @return bool $isFailedUpdateState 失敗したらtrue
   */
  private function updateBoxerTitleState(&$snapshot, $isTargetRed, $isTargetBlue, $redState, $blueState)
  {

    $isFailedUpdateState = false;
    if ($isTargetRed) {
      $isFailedUpdateState = !$this->BoxerTitleSnapshotRepository->updateBoxerTitleSnapshot($snapshot, $redState);
    };
    if ($isTargetBlue) {
      $isFailedUpdateState = !$this->BoxerTitleSnapshotRepository->updateBoxerTitleSnapshot($snapshot, $blueState);
    };

    return $isFailedUpdateState;
  }
}
