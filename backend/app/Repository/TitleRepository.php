<?php

namespace App\Repository;

use App\Models\Title;

class TitleRepository
{


  /**
   * @param int boxerId
   * @return Title
   */
  public static function get($boxerId): Title
  {
    return Title::where('boxer_id', $boxerId)->get();
  }

  /**
   * @param int boxerId
   * @param int organizationId
   * @param int weightDivisionId
   * @return Title
   */
  public static function create($boxerId, $organizationId, $weightDivisionId): Title
  {
    return Title::create([
      "boxer_id" => $boxerId,
      "organization_id" => $organizationId,
      "weight_division_id" => $weightDivisionId
    ]);
  }

  /**
   * @param int boxerId
   * @return void
   */
  public static function delete($boxerId)
  {
    Title::where('boxer_id', $boxerId)->delete();
  }
}
