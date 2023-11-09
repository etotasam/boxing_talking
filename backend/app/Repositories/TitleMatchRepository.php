<?php

namespace App\Repositories;

use App\Models\TitleMatch;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;

class TitleMatchRepository implements TitleMatchRepositoryInterface
{


  public function insertTitleMatch(array $titleMatchArray)
  {
    return TitleMatch::insert($titleMatchArray);
  }


  public function deleteTitleMatch(int $matchId)
  {
    return TitleMatch::where('match_id', $matchId)->delete();
  }
}
