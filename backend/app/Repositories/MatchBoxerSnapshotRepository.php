<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
// use App\Models\MatchDataSnapshot;
use App\Models\MatchBoxerSnapshot;
use App\Repositories\Interfaces\MatchBoxerSnapshotInterface;

class MatchBoxerSnapshotRepository implements MatchBoxerSnapshotInterface
{

  public function hasMatchSnapshot(int $matchId)
  {
    return MatchBoxerSnapshot::where("match_id", $matchId)->exists();
  }

  /**
   * 指定された試合IDのボクサースナップショットを取得
   * @param int $matchId
   * @return Collection|false 成功時はスナップショットのコレクション ["red" => ..., "blue" => ...]、失敗時はfalse
   */
  public function getMatchBoxerSnapshot(int $matchId)
  {
    $match = BoxingMatch::find($matchId);
    $redBoxerId = $match->red_boxer_id;
    $blueBoxerId = $match->blue_boxer_id;

    $snapshot =  MatchBoxerSnapshot::where("match_id", $matchId)->whereIn("boxer_id", [$redBoxerId, $blueBoxerId])->get()->keyBy("boxer_id");

    return collect([
      "red" => $snapshot->get($redBoxerId),
      "blue" => $snapshot->get($blueBoxerId)
    ]);
  }


  public function createMatchBoxerSnapshot(array $matchDataForSnapshot)
  {
    return MatchBoxerSnapshot::insert($matchDataForSnapshot);
  }
}
