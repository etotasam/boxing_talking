<?php

namespace App\Repositories;

use Exception;
use App\Models\Organization;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;

class OrganizationRepository implements OrganizationRepositoryInterface
{

  public function getOrganizationId($organizationName)
  {
    return Organization::where("name", $organizationName)->first()->id;
  }

  /**
   * @param int $organizationId
   * @return string
   */
  public function getOrganizationName($organizationId)
  {
    $organization = Organization::find($organizationId);
    return $organization->name;
  }
}
