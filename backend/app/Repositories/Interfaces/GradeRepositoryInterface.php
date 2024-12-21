<?php

namespace App\Repositories\Interfaces;

use App\Models\Grade;

interface GradeRepositoryInterface
{
  /**
   * @param string $gradeName
   * @return int
   */
  public static function getGradeId(string $gradeName);
}
