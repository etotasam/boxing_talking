<?php

namespace App\Repository;

use App\Models\TitleMatch;

class TitleMatchRepository
{

  public static function get(int $matchId): TitleMatch
  {
    return TitleMatch::where('match_id', $matchId)->get();
  }

  public static function store(int $match_id, int $organization_id): TitleMatch
  {
    return TitleMatch::create(compact('match_id', 'organization_id'));
  }

  public static function delete(int $matchId): void
  {
    TitleMatch::where('match_id', $matchId)->delete();
  }
}
