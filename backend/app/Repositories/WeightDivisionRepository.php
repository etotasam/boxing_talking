<?php

namespace App\Repositories;

use App\Models\WeightDivision;

class WeightDivisionRepository
{

  /**
   * @param string $weight
   * @return WeightDivision
   */
  public static function getWeightDivision($weight)
  {
    return WeightDivision::where("weight", $weight)->first();
  }
}
