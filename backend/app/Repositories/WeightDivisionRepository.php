<?php

namespace App\Repositories;

use App\Models\WeightDivision;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;

class WeightDivisionRepository implements WeightDivisionRepositoryInterface
{

  public function getWeightId($weight)
  {
    return WeightDivision::where("weight", $weight)->first()->id;
  }

  public function getWeightName($weightId)
  {
    return WeightDivision::where("id", $weightId)->first()->weight;
  }
}
