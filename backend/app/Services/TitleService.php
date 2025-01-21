<?php

namespace App\Services;

use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Exceptions\FailedTitleException;


class TitleService
{


  public function __construct(
    private TitleRepositoryInterface $titleRepository,
    private OrganizationRepositoryInterface $organizationRepository,
    private WeightDivisionRepositoryInterface $weightRepository,
    private BoxerRepositoryInterface $boxerRepository,
  ) {}


  /**
   * titlesテーブルへ登録(初期化)
   * @param int $boxerId
   * @param array $titles [["organization" => "WBA", "weight" => "ミドル"], ...]
   */
  public function initializeTitle(int $boxerId, array $titles): void
  {
    //? 最初にボクサーが保持しているタイトルがあれば全て削除しておく
    $this->titleRepository->deleteTitlesHoldByTheBoxer($boxerId);

    //? 他のボクサーが所持しているタイトルの場合はエラーをthrow
    foreach ($titles as $title) {
      $organizationId = $this->organizationRepository->getOrganizationId($title["organization"]);
      $weightId = $this->weightRepository->getWeightId($title["weight"]);
      $hasBoxer = $this->titleRepository->hasOtherBoxerTitle($organizationId, $weightId);
      if ($hasBoxer) {
        $boxer = $this->boxerRepository->getBoxerById($hasBoxer->boxer_id);
        $organization = $this->organizationRepository->getOrganizationName($organizationId);
        $division = $this->weightRepository->getWeightName($weightId);
        throw FailedTitleException::titleAlreadyHasOtherBoxer($organization, $division, $boxer->name);
      }
    }

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
