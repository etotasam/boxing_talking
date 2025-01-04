<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\BoxerTitleSnapshot;

interface BoxerTitleSnapshotInterface
{
  public function storeBoxerTitleSnapshot(array $titlesArray);

  /**
   * Update the state of a boxer's title snapshot.
   * @param BoxerTitleSnapshot $snapshot
   * @param string $state "new" | "still" | "fall"
   * @return bool $isSuccess
   */
  public function updateBoxerTitleSnapshot(BoxerTitleSnapshot $snapshot, string $state);

  /**
   * Update時にstateを一度全てnullにする為
   * @param int $matchId
   * @return bool $isUpdateFailed 失敗した場合がtrue
   */
  public function resetBoxerTitleSnapshot($matchId);

  /**
   * 試合時の選手の保持タイトルを取得
   * @param int $matchId
   * @return Collection
   */
  public function getTitleSnapshot(int $matchId);

  /**
   * スナップショットの削除
   * @param int $matchId
   * @param int $boxerId
   * @param int $organizationId
   * @param int $weightDivisionId
   * @return int 削除した件数
   */
  public function deleteBoxerTitleSnapshot(int $matchId, int $boxerId, int $organizationId, int $weightDivisionId);
}
