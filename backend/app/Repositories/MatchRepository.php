<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchResult;
use App\Repositories\Interfaces\MatchRepositoryInterface;

class MatchRepository implements MatchRepositoryInterface
{

  public function getAllMatches()
  {
    return BoxingMatch::orderBy('match_date')->get();
  }

  public function getPastMatches()
  {
    $fetchRange = date('Y-m-d', strtotime('-1 week'));
    return BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date', 'desc')->get();
  }

  public function getMatches()
  {
    $fetchRange = date('Y-m-d', strtotime('-1 week'));
    return BoxingMatch::where('match_date', '>=', $fetchRange)->orderBy('match_date')->get();
  }

  public function isMatch(int $matchId)
  {
    return BoxingMatch::where('id', $matchId)->exists();
  }


  public function getMatchById(int $matchId)
  {
    return BoxingMatch::find($matchId);
  }

  public function createMatch(array $matchData)
  {
    return BoxingMatch::create($matchData);
  }


  public function deleteMatch(int $matchId)
  {
    $res = BoxingMatch::destroy($matchId);
    return (bool) $res;
  }

  public function updateMatch(int $matchId, array $updateMatchData)
  {
    $targetMatch = BoxingMatch::find($matchId);
    $targetMatch->fill($updateMatchData);
    return $targetMatch->save();
  }

  public function hasMatchBoxer(int $boxerId): bool
  {
    return BoxingMatch::where("red_boxer_id", $boxerId)->orWhere("blue_boxer_id", $boxerId)->exists();
  }

  public function isMatchResult(int $matchId)
  {
    return MatchResult::where('match_id', $matchId)->exists();
  }

  public function deleteMatchResult(int $matchId)
  {
    $res = MatchResult::where('match_id', $matchId)->delete();
    return (bool) $res;
  }

  public function storeMatchResult(array $matchResultData)
  {
    return MatchResult::create($matchResultData);
  }

  public function updateOrCreateMatchResult(int $matchId, array $matchResultData)
  {
    MatchResult::updateOrInsert(["match_id" => $matchId], $matchResultData);
  }
}
