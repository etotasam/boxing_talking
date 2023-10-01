<?php

namespace App\Repository;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;

class MatchRepository
{


  /**
   * @param array match
   * @return BoxingMatch
   */
  public static function create($match): BoxingMatch
  {
    return BoxingMatch::create($match);
  }

  /**
   * @param int matchID
   * @return void
   */
  public static function delete($matchID): void
  {
    BoxingMatch::find($matchID)->delete();
  }

  /**
   * @param int matchID
   * @return BoxingMatch
   */
  public static function get($matchID): ?BoxingMatch
  {
    return BoxingMatch::find($matchID);
  }

  /**
   * @param int matchID
   * @return bool
   */
  public static function isMatchExists($matchID): bool
  {
    return BoxingMatch::find($matchID)->exists();
  }


  /**
   * @param int boxerID
   * @return bool
   */
  public static function haveMatchBoxer($boxerID): bool
  {
    return BoxingMatch::where("red_boxer_id", $boxerID)->orWhere("blue_boxer_id", $boxerID)->exists();
  }


  /**
   * @param string|null range
   * @return Collection
   */
  public static function getMatches(string $range = null): Collection
  {
    if ($range == "all") {
      if (Auth::user()->administrator) {
        $matches = BoxingMatch::orderBy('match_date')->get();
      } else {
        return response()->json(["success" => false, "message" => "Cannot get all matches without auth administrator"], 401);
      }
    } else if ($range == "past") {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
    } else {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = BoxingMatch::where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
    }

    return $matches;
  }
}
