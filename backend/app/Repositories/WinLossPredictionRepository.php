<?php

namespace App\Repositories;

use App\Models\WinLossPrediction;

class WinLossPredictionRepository
{


  /**
   * @param int matchId
   * @return void
   */
  public static function delete($matchId): void
  {
    WinLossPrediction::where("match_id", $matchId)->delete();
  }

  public static function store(string $userId, int $matchId, string $prediction): void
  {
    WinLossPrediction::create([
      "user_id" => $userId,
      "match_id" => $matchId,
      "prediction" => $prediction
    ]);
  }

  public static function isVoteMatchPrediction(string $userId, int $matchId): ?WinLossPrediction
  {
    return WinLossPrediction::where([["user_id", $userId], ["match_id", $matchId]])->first();
  }
}
