<?php

namespace App\Repository;

use App\Models\Organization;

class OrganizationRepository
{


  /**
   * @param string organizationName
   * @return Organization
   */
  public static function get($organizationName): Organization
  {
    $organization = Organization::where("name", $organizationName)->first();
    if (!$organization) {
      throw new Exception("organization is not exists");
    }
    return $organization;
  }
}
