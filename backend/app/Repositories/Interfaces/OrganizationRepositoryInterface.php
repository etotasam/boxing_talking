<?php

namespace App\Repositories\Interfaces;


interface OrganizationRepositoryInterface
{


  /**
   * @param string organizationName
   * @return int organization_id
   */
  public static function getOrganizationId($organizationName);
}
