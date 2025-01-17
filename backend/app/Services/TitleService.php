<?php

namespace App\Services;

use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;
use App\Exceptions\FailedTitleException;


class TitleService
{


  public function __construct(
    private TitleRepositoryInterface $titleRepository,
    private OrganizationRepositoryInterface $organizationRepository,
    private WeightDivisionRepositoryInterface $weightRepository,
  ) {}


  /**
   * titlesテーブルへ登録(初期化)
   * @param int $boxerId
   * @param array $titles [["organization" => "WBA", "weight" => "ミドル"], ...]
   */
  public function initializeTitle(int $boxerId, array $titles): void
  {
    $this->titleRepository->deleteTitlesHoldByTheBoxer($boxerId);

    if (!empty($titles)) {
      $formattedTitles = array_map(function ($title) use ($boxerId) {
        $organizationId = $this->organizationRepository->getOrganizationId($title["organization"]);
        $weightId = $this->weightRepository->getWeightId($title["weight"]);
        return ["boxer_id" => $boxerId, "organization_id" => $organizationId, "weight_division_id" => $weightId];
      }, $titles);

      $isSuccess = $this->titleRepository->storeTitlesHoldByTheBoxer($formattedTitles);
      if (!$isSuccess) {
        throw FailedTitleException::create();
      }
    }
  }

  /**
   * titlesテーブルへ登録(追加)
   * @param int $boxerId
   * @param int $organizationId
   * @param int $weightDivisionId
   */
  public function storeTitle(int $boxerId, int $organizationId, int $weightDivisionId): void
  {
    $isSuccess = $this->titleRepository->storeTitle($boxerId, $organizationId, $weightDivisionId);
    if (!$isSuccess) {
      throw FailedTitleException::create();
    }
  }
}
