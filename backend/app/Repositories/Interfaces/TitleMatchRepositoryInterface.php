<?php

namespace App\Repositories\Interfaces;

// use Illuminate\Support\Collection;
// use App\Models\TitleMatch;

interface TitleMatchRepositoryInterface
{

  /**
   * 試合のタイトルマッチ情報を削除
   *
   * @param int $titleMatchArray 例) [['match_id' => 1, "organization_id" => 1], ['match_id' => 1, "organization_id" => 3]]
   * @return bool
   */
  public function insertTitleMatch(array $titleMatchArray);

  /**
   * 試合のタイトルマッチ情報を削除
   *
   * @param int $matchId
   * @return int
   */
  public function deleteTitleMatch(int $matchId);
}
