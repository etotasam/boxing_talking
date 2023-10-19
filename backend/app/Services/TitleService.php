<?php

namespace App\Services;

use App\Repositories\OrganizationRepository;
use App\Repositories\WeightDivisionRepository;
use App\Repositories\Interfaces\TitleRepositoryInterface;


class TitleService
{

  protected $titleRepository;
  public function __construct(TitleRepositoryInterface $titleRepository)
  {
    $this->titleRepository = $titleRepository;
  }


  /**
   * @param int $boxerId
   * @param array $titles [["organization" => "WBA", "weight" => "ミドル"], ...]
   */
  public function storeTitle(int $boxerId, array $titles): void
  {
    $this->titleRepository->deleteTitlesHoldByTheBoxer($boxerId);

    if (!empty($titles)) {
      $formattedTitles = array_map(function ($title) use ($boxerId) {
        $organization = OrganizationRepository::getOrganization($title["organization"]);
        $weightDivision = WeightDivisionRepository::getWeightDivision($title["weight"]);
        $organizationId = $organization['id'];
        $weightDivisionId = $weightDivision['id'];
        return ["boxer_id" => $boxerId, "organization_id" => $organizationId, "weight_division_id" => $weightDivisionId];
      }, $titles);

      $isSuccess = $this->titleRepository->storeTitlesHoldByTheBoxer($formattedTitles);
      if (!$isSuccess) {
        throw new \Exception("Failed store title");
      }
    }
  }
}
