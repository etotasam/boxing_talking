<?php

namespace App\Repositories\Interfaces;


interface OrganizationRepositoryInterface
{


  /**
   * @param string organizationName
   * @return int organization_id
   */
  public function getOrganizationId($organizationName);

  /**
   * @param int $organizationId
   * @return string
   */
  public function getOrganizationName($organizationId);
}
