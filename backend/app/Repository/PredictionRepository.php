<?php

namespace App\Repository;

use App\Models\WinLossPrediction;

class PredictionRepository
{


  /**
   * @param int matchId
   * @return void
   */
  public static function deletePredictionByMatchId($matchId): void
  {
    WinLossPrediction::where("match_id", $matchId)->delete();
  }
}
