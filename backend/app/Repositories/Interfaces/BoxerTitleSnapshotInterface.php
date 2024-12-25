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

  public function getTitleSnapshot(int $matchId);
}
