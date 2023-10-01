<?php

namespace App\Repository;

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
}
