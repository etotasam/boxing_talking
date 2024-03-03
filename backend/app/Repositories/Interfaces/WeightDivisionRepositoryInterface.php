<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\WinLossPrediction;

interface WeightDivisionRepositoryInterface
{
  /**
   * @param string $weight
   * @return int
   */
  public static function getWeightId($weight);
}
