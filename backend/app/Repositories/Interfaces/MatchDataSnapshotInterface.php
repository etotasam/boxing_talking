<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchDataSnapshot;

interface MatchDataSnapshotInterface
{
  /**
   * match_idで試合のスナップショットデータを取得
   * @param int $matchId
   * @return Collection
   */
  public function getMatchSnapshot(int $matchId);

  /**
   * 試合の登録
   * @param array $matchDataForSnapshot
   * [
   *    "match_id" => int,
   *    "red_boxer_id" => int,
   *    "red_style" => string,
   *    "red_ko" => int,
   *    "red_win" => int,
   *    "red_draw" => int,
   *    "red_lose" => int,
   *    "blue_boxer_id" => int,
   *    "blue_style" => string,
   *    "blue_ko" => int,
   *    "blue_win" => int,
   *    "blue_draw" => int,
   *    "blue_lose" => int,
   * ]
   * @return MatchDataSnapshot|false 成功時は登録したデータ、失敗時はfalse
   */
  public function createMatchSnapshot(array $matchDataForSnapshot);
}
