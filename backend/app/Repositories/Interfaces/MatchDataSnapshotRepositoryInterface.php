<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchResult;

interface MatchDataSnapshotRepositoryInterface
{
  /**
   * match_idで試合のスナップショットデータを取得
   * @param int $matchId
   * @return Collection
   */
  public function getMatchSnapshot(int $matchId);
}
