<?php

namespace App\Services;

use Exception;
use App\Models\Organization;
use App\Models\WeightDivision;
use App\Models\Title;

class BoxerService
{

  public function __construct(Organization $organization, WeightDivision $weightDivision, Title $title)
  {
    $this->organization = $organization;
    $this->weightDivision = $weightDivision;
    $this->title = $title;
  }

  /**
   * update titles
   *
   * @param int boxerID string
   * @param object titles
   * @return void
   */
  public function setTitle($boxerID, $titles)
  {
    Title::where('boxer_id', $boxerID)->delete();
    if (!empty($titles)) {
      foreach ($titles as $title) {
        $organizationName = $title["organization"];
        $organization = $this->organization->where("name", $organizationName)->first();
        if (!$organization) {
          throw new Exception("organization is not exists");
        }
        $weightDivisionWeight = $title["weight"];
        $weightDivision = $this->weightDivision->where("weight", $weightDivisionWeight)->first();
        if (!$weightDivision) {
          throw new Exception("weight_division is not exists");
        }
        $this->title->create([
          "boxer_id" => $boxerID,
          "organization_id" => $organization["id"],
          "weight_division_id" => $weightDivision["id"]
        ]);
      }
    }
  }
}
