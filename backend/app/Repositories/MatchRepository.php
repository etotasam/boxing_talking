<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Repositories\Interfaces\MatchRepositoryInterface;

class MatchRepository implements MatchRepositoryInterface
{

  /**
   * @return Collection
   */
  public function getAllMatches()
  {
    return BoxingMatch::orderBy('match_date')->get();
  }

  /**
   * @return Collection
   */
  public function getPastMatches()
  {
    $fetchRange = date('Y-m-d', strtotime('-1 week'));
    return BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
  }

  /**
   * @return Collection
   */
  public function getMatches()
  {
    $fetchRange = date('Y-m-d', strtotime('-1 week'));
    return BoxingMatch::where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
  }

  /**
   * @param int $matchId
   * @return bool
   */
  public function isMatch(int $matchId)
  {
    return BoxingMatch::where('id', $matchId)->exists();
  }


  /**
   * idで試合を取得
   *
   * @param int $matchId
   * @return BoxingMatch
   */
  public function getMatchById(int $matchId)
  {
    return BoxingMatch::find($matchId);
  }

  /**
   * @param array $matchData
   * @return BoxingMatch
   */
  public function createMatch(array $matchData)
  {
    return BoxingMatch::create($matchData);
  }

  /**
   * 試合の削除(1件)
   * @param int $matchId
   * @return bool
   */
  public function deleteMatch(int $matchId)
  {
    $res = BoxingMatch::destroy($matchId);
    return (bool) $res;
  }

  /**
   * @param int $matchId
   * @param array $updateMatchData
   *
   * @return bool
   */
  public function updateMatch(int $matchId, array $updateMatchData)
  {
    $targetMatch = BoxingMatch::find($matchId);
    $targetMatch->fill($updateMatchData);
    return $targetMatch->save();
  }

  /**
   * 指定のボクサーが試合が組まれているかをチェック
   * @param int $boxerId
   * @return bool
   */
  public function hasMatchBoxer(int $boxerId): bool
  {
    return BoxingMatch::where("red_boxer_id", $boxerId)->orWhere("blue_boxer_id", $boxerId)->exists();
  }
}
