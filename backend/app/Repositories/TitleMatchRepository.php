<?php

namespace App\Repositories;

use App\Models\TitleMatch;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;

class TitleMatchRepository implements TitleMatchRepositoryInterface
{

  /**
   * 試合のタイトルマッチ情報を削除
   *
   * @param int $titleMatchArray 例) [['match_id' => 1, "organization_id" => 1], ['match_id' => 1, "organization_id" => 3]]
   * @return bool
   */
  public function insertTitleMatch(array $titleMatchArray)
  {
    return TitleMatch::insert($titleMatchArray);
  }

  /**
   * 試合のタイトルマッチ情報を削除
   *
   * @param int $matchId
   * @return int
   */
  public function deleteTitleMatch(int $matchId)
  {
    return TitleMatch::where('match_id', $matchId)->delete();
  }
}
