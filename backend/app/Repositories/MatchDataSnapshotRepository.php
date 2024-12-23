<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchDataSnapshot;
use App\Repositories\Interfaces\MatchDataSnapshotRepositoryInterface;

class MatchDataSnapshotRepository implements MatchDataSnapshotRepositoryInterface
{

  public function getMatchSnapshot(int $matchId)
  {
    $match = BoxingMatch::find($matchId);
    return $match ? $match->getSnapshot() :  null;
  }
}
