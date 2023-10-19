<?php

namespace App\Repositories;

use Exception;
use App\Models\Organization;

class OrganizationRepository
{


  /**
   * @param string organizationName
   * @return Organization
   */
  public static function getOrganization($organizationName)
  {
    return Organization::where("name", $organizationName)->first();
  }
}
