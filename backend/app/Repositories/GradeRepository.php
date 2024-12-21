<?php

namespace App\Repositories;

use App\Models\Grade;
use App\Repositories\Interfaces\GradeRepositoryInterface;

class GradeRepository implements GradeRepositoryInterface
{

  public static function getGradeId($gradeName)
  {
    return Grade::where('grade', $gradeName)->first()->id;
  }
}
