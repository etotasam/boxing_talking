<?php

namespace App\Repositories;

use App\Models\WeightDivision;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;

class WeightDivisionRepository implements WeightDivisionRepositoryInterface
{

  public static function getWeightId($weight)
  {
    return WeightDivision::where("weight", $weight)->first()->id;
  }
}
