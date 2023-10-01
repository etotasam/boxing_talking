<?php

namespace App\Services;

use Exception;
use App\Repository\TitleMatchRepository;
use App\Repository\OrganizationRepository;


class TitleMatchService
{
  public function __construct()
  {
  }

  /**
   * @return void
   */
  public function storeTitleMatches(int $matchId, array $titleMatchArray): void
  {
    foreach ($titleMatchArray as $titleOrganizationName) {
      $organization = OrganizationRepository::get($titleOrganizationName);
      TitleMatchRepository::store($matchId, $organization['id']);
    }
  }
}
