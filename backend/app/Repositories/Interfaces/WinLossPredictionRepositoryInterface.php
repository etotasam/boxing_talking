<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\WinLossPrediction;

interface WinLossPredictionRepositoryInterface
{
  /**
   * ユーザーの勝敗予想投票をすべて取得
   * @return Collection|null
   */
  public function getPredictionByUser();

  /**
   * 試合への投票
   *
   * @param string $userId
   * @param int $matchId
   * @param string $prediction
   *
   * @return WinLossPrediction
   */
  public function storePrediction(string $userId, int $matchId, string $prediction);

  /**
   * 試合への勝敗予想をすべて削除
   * @param int $matchId
   * @return int
   */
  public function deletePredictionOnMatch($matchId);

  /**
   * ユーザーがその試合の勝敗予想を既に投票済みかどうかを取得
   * @param string $userId
   * @param int $matchId
   *
   * @return bool
   */
  public function isVotedPredictionToMatch(string $userId, int $matchId);
}
