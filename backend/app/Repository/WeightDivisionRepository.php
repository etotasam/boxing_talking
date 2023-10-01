<?php

namespace App\Repository;

use App\Models\WeightDivision;

class WeightDivisionRepository
{


  /**
   * @param string weightName
   * @return WeightDivision
   */
  public static function get($weightName): WeightDivision
  {
    $weightDivision = WeightDivision::where("weight", $weightName)->first();
    if (!$weightDivision) {
      throw new Exception("weight_division is not exists");
    }
    return $weightDivision;
  }
}
