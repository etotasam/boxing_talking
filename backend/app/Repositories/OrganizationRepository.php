<?php

namespace App\Repositories;

use Exception;
use App\Models\Organization;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;

class OrganizationRepository implements OrganizationRepositoryInterface
{

  public static function getOrganizationId($organizationName)
  {
    return Organization::where("name", $organizationName)->first()->id;
  }
}
