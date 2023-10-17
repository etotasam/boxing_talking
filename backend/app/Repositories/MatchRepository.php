<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use Exception;

class MatchRepository
{



  public static function create(array $matchData): BoxingMatch
  {
    return BoxingMatch::create($matchData);
  }


  public static function delete(int $matchId): void
  {
    BoxingMatch::find($matchId)->delete();
  }


  public static function get(int $matchId): ?BoxingMatch
  {
    return BoxingMatch::find($matchId);
  }

  public static function isMatchExists(int $matchId): bool
  {
    return BoxingMatch::where('id', $matchId)->exists();
  }



  public static function haveMatchBoxer(int $boxerId): bool
  {
    return BoxingMatch::where("red_boxer_id", $boxerId)->orWhere("blue_boxer_id", $boxerId)->exists();
  }


  /**
   * @param string|null range
   * @return Collection
   */
  // public static function getMatches(string|null $range)
  // {
  //   if ($range == "all") {
  //     if (Auth::user()->administrator) {
  //       $matches = BoxingMatch::orderBy('match_date')->get();
  //     } else {
  //       throw new Exception("Cannot get all matches without auth administrator", 401);
  //     }
  //   } else if ($range == "past") {
  //     $fetchRange = date('Y-m-d', strtotime('-1 week'));
  //     $matches = BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
  //   } else {
  //     $fetchRange = date('Y-m-d', strtotime('-1 week'));
  //     $matches = BoxingMatch::where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
  //   }

  //   return $matches;
  // }

  public static function getMatchDate(int $matchId): ?BoxingMatch
  {
    return BoxingMatch::select('match_date')->where('id', $matchId)->first();
  }
}
