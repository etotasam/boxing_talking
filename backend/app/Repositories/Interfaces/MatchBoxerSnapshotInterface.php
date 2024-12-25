<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
// use App\Models\MatchDataSnapshot;

interface MatchBoxerSnapshotInterface
{
  /**
   * snapshotが存在するかチェック
   * @param int $matchId
   * @return bool
   */
  public function hasMatchSnapshot(int $matchId);


  /**
   * 指定された試合IDのボクサースナップショットを取得
   * @param int $matchId
   * @return Collection|false 成功時はスナップショットのコレクション、失敗時はfalse
   */
  public function getMatchBoxerSnapshot(int $matchId);


  /**
   * 試合の登録
   * @param array $matchDataForSnapshot 多重配列
   * [
   *    [
   *      "match_id" => int,
   *      "boxer_id" => int,
   *      "style" => string,
   *      "ko" => int,
   *      "win" => int,
   *      "draw" => int,
   *      "lose" => int,
   *    ]
   *  ...
   * ]
   * @return MatchDataSnapshot|false 成功時は登録したデータ、失敗時はfalse
   */
  public function createMatchBoxerSnapshot(array $matchDataForSnapshot);
}
