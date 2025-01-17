<?php

namespace App\Repositories;

use App\Models\BoxerTitleSnapshot;
use App\Models\BoxingMatch;
use Illuminate\Support\Collection;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;

class BoxerTitleSnapshotRepository implements BoxerTitleSnapshotInterface
{

  /**
   * 試合登録時の選手保有タイトルを(boxer_title_snapshotテーブル)保存(一括)
   * @param array $titlesArray [["match_id" => int, "boxer_id" => int, "organization_id" => int, "weight_division_id" => int, "state" => null | string], ...]
   * @return bool
   */
  public function storeBoxerTitleSnapshot(array $titlesArray): bool
  {
    return BoxerTitleSnapshot::insert($titlesArray);
  }

  /**
   * Update the state of a boxer's title snapshot.
   * @param Collection|array $snapshot
   * @param string $state "new" | "still" | "fall"
   * @return bool $isSuccess
   */
  public function updateBoxerTitleSnapshot($snapshot, $state)
  {
    // \Log::debug($snapshot["match_id"]);
    $isSuccess =  (bool) BoxerTitleSnapshot::where([
      ['match_id', '=', $snapshot["match_id"]],
      ['boxer_id', '=', $snapshot["boxer_id"]],
      ["organization_id", '=', $snapshot['organization_id']],
      ["weight_division_id", '=', $snapshot['weight_division_id']],
    ])->update(['state' => $state]);

    return $isSuccess;
  }

  /**
   * Update時にstateを一度全てnullにする為
   * @param int $matchId
   * @return bool $isUpdateFailed 失敗した場合がtrue
   */
  public function resetBoxerTitleSnapshot($matchId)
  {

    $isUpdateFailed = false;
    $hasTarget = BoxerTitleSnapshot::where('match_id', $matchId)
      ->where('state', '!=', null)
      ->exists();

    if ($hasTarget) {
      $isUpdateFailed = !(bool) BoxerTitleSnapshot::where('match_id', $matchId)
        ->update(['state' => null]);
    }

    return $isUpdateFailed;
  }

  /**
   * 試合時の選手の保持タイトルを取得
   * @param int $matchId
   * @return Collection
   */
  public function getTitleSnapshot($matchId)
  {
    $match = BoxingMatch::find($matchId);
    $redBoxerId = $match->red_boxer_id;
    $blueBoxerId = $match->blue_boxer_id;


    $redTitleSnapshot = BoxerTitleSnapshot::where("match_id", $matchId)->where("boxer_id", $redBoxerId)->get();
    $blueTitleSnapshot = BoxerTitleSnapshot::where("match_id", $matchId)->where("boxer_id", $blueBoxerId)->get();

    return collect([
      "red" => $redTitleSnapshot,
      "blue" => $blueTitleSnapshot,
    ]);
  }

  /**
   * スナップショットの削除
   * @param int $matchId
   * @param int $boxerId
   * @param int $organizationId
   * @param int $weightDivisionId
   * @return int 削除した件数
   */
  public function deleteBoxerTitleSnapshot($matchId, $boxerId, $organizationId, $weightDivisionId)
  {
    return BoxerTitleSnapshot::where([
      ['match_id', '=', $matchId],
      ['boxer_id', '=', $boxerId],
      ["organization_id", '=', $organizationId],
      ["weight_division_id", '=', $weightDivisionId],
    ])->delete();
  }
}
