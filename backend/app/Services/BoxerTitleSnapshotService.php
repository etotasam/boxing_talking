<?php

namespace App\Services;

use Exception;
use \Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\BoxerTitleSnapshot;
use App\Models\TitleMatch;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use Illuminate\Support\Arr;


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
   * @param int $redBoxerId
   * @param int $blueBoxerId
   * @return void
   */
  public function updateBoxerTitleSnapshotState(BoxingMatch $match, string $result, int $redBoxerId, int $blueBoxerId): void
  {
    //? 試合結果修正で勝者が変わる場合はボクサーのタイトルスナップショットのstateがnewのタイトルは削除する
    if ($match->result !== $result) {
      $match->boxerTitleSnapshot->each(function ($snapshot) {
        if ($snapshot->state === "new") {
          $this->boxerTitleSnapshotRepository->deleteBoxerTitleSnapshot($snapshot->id, $snapshot->boxer_id, $snapshot->organization_id, $snapshot->weight_division_id);
        }
      });
    }
    //? 一度snapshotのstateをnullに初期化
    $isFailedStateReset = $this->boxerTitleSnapshotRepository->resetBoxerTitleSnapshot($match->id);
    if ($isFailedStateReset) {
      throw new Exception('Failed reset boxer title snapshot state to null');
    }
    //? 勝者がいるかチェック
    $isWinner = $result === "red" || $result === "blue";

    //? 勝者がいなければ早期リターン
    if (!$isWinner) return;

    //? 勝者のid
    $winnerBoxerId = $result === "red" ? $redBoxerId : $blueBoxerId;

    //? ボクサーの試合時の保持タイトルを取得
    $boxerTitleSnapshot = $match->boxerTitleSnapshot;

    //? BoxerTitleSnapshotのstateの書き換え
    foreach ($match->matchTitles as $matchTitle) {

      //? ボクサーがタイトルを所持している場合のみそのタイトルのstateを変更
      if (!$boxerTitleSnapshot->isEmpty()) {
        foreach ($boxerTitleSnapshot as &$snapshot) {
          $this->updateBoxerTitleStateIfHeld($snapshot, $matchTitle, $match, $redBoxerId, $blueBoxerId, $result);
        }
      }

      //? 新しいタイトル（ベルト）を取得したら新しいスナップショットを作成しstateをnewにする
      $this->storeNewBoxerTitle($boxerTitleSnapshot, $matchTitle, $winnerBoxerId, $match->weight_id);
    }
  }



  /**
   * 試合に掛けられたタイトル(ベルト)で新たに取得したタイトルを判定し、新たなタイトルをスナップショットに保存してstateはnewにする
   * @param Collection $boxerTitleSnapshot
   * @param TitleMatch $matchTitle
   * @param int $winnerBoxerId
   * @param int $matchWeightId
   * @return void
   */
  private function storeNewBoxerTitle(Collection $boxerTitleSnapshot, TitleMatch $matchTitle, int $winnerBoxerId, int $matchWeightId): void
  {
    //? 試合に掛けらたタイトル(ベルト)で新たに取得したタイトルを判定
    $hasTitle = $boxerTitleSnapshot->contains(function ($item) use ($winnerBoxerId, $matchWeightId, $matchTitle) {
      $isWinnerBoxer = $item['boxer_id'] === $winnerBoxerId;
      $isSameWeight = $item['weight_division_id'] === $matchWeightId;
      $isSameOrganization = $item['organization_id'] === $matchTitle->organization_id;
      return $isWinnerBoxer && $isSameWeight && $isSameOrganization;
    });

    //? 取得した新たなタイトルをスナップショットに保存してstateはnewにする
    if (!$hasTitle) {
      $this->boxerTitleSnapshotRepository->storeBoxerTitleSnapshot([
        "match_id" => $matchTitle->match_id,
        "boxer_id" => $winnerBoxerId,
        "organization_id" => $matchTitle->organization_id,
        "weight_division_id" => $matchWeightId,
        "state" => "new"
      ]);
    }
  }

  /**
   * @param BoxerTitleSnapshot $snapshot
   * @param TitleMatch $matchTitle
   * @param BoxingMatch $match
   * @param int $redBoxerId
   * @param int $blueBoxerId
   * @param string $result "red" | "blue" | "draw"
   */
  private function updateBoxerTitleStateIfHeld(BoxerTitleSnapshot $snapshot, TitleMatch $matchTitle, BoxingMatch $match, int $redBoxerId, int $blueBoxerId, string $result): void
  {
    $isSameOrganization = $snapshot["organization_id"] === $matchTitle["organization_id"];
    $isSameWeight = $snapshot["weight_division_id"] === $match->weight_id;
    //? 試合にかけられたタイトルと選手の保持していたタイトルが同じ場合
    $isSameTitle = $isSameOrganization && $isSameWeight;
    //? redのsnapshot
    $isTargetRed = $redBoxerId === $snapshot["boxer_id"];
    //? blueのsnapshot
    $isTargetBlue = $blueBoxerId === $snapshot["boxer_id"];

    //? 勝者がred
    $isWinRed = $result === "red";
    //? 勝者がblue
    $isWinBlue = $result === "blue";

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
      $isFailedUpdateState = !$this->boxerTitleSnapshotRepository->updateBoxerTitleSnapshot($snapshot, $redState);
    };
    if ($isTargetBlue) {
      $isFailedUpdateState = !$this->boxerTitleSnapshotRepository->updateBoxerTitleSnapshot($snapshot, $blueState);
    };

    return $isFailedUpdateState;
  }
}
