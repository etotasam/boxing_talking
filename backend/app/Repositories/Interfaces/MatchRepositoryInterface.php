<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchResult;

interface MatchRepositoryInterface
{
  /**
   * 過去含めすべての試合を取得
   * @return Collection
   */
  public function getAllMatches();

  /**
   * 過去一週間以上過去の試合を取得
   * @return Collection
   */
  public function getPastMatches();

  /**
   * 過去一週間からこっちの試合を取得
   * @return Collection
   */
  public function getMatches();

  /**
   * idで試合を取得
   *
   * @param int $matchId
   * @return BoxingMatch
   */
  public function getMatchById(int $matchId);

  /**
   * 試合の存在を確認
   * @param int $matchId
   * @return bool
   */
  public function isMatch(int $matchId);

  /**
   * 指定のボクサーが試合が組まれているかをチェック
   * @param int $boxerId
   * @return bool
   */
  public function hasMatchBoxer(int $boxerId);

  /**
   * 試合の登録
   * @param array $matchData
   * @return BoxingMatch|false
   */
  public function createMatch(array $matchData);

  /**
   * 試合データの更新
   * @param int $matchId
   * @param array $updateMatchData
   *
   * @return bool
   */
  public function updateMatch(int $matchId, array $updateMatchData);

  /**
   * 試合データの削除
   * @param int $matchId
   * @param array $updateMatchData
   *
   * @return bool
   */
  public function deleteMatch(int $matchId);


  /**
   * 試合結果の存在確認
   * @param int $matchId
   *
   * @return bool
   */
  public function isMatchResult(int $matchId);

  /**
   * 試合結果の削除
   * @param int $matchId
   *
   * @return bool
   */
  public function deleteMatchResult(int $matchId);

  /**
   * 試合結果の登録
   * @param array $matchResultData
   *
   * @return MatchResult
   */
  public function storeMatchResult(array $matchResultData);

  /**
   * 試合結果の更新 or 登録
   * @param int $matchId
   * @param array $matchResultData
   *
   * @return void
   */
  public function updateOrCreateMatchResult(int $matchId, array $matchResultData);
}
