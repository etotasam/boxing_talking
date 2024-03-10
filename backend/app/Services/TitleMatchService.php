<?php

namespace App\Services;

// use App\Repositories\OrganizationRepository;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;


class TitleMatchService
{


  public function __construct(
    private TitleMatchRepositoryInterface $titleMatchRepository,
    private OrganizationRepositoryInterface $organizationRepository,
  ) {
  }


  /**
   * @param int $matchId
   * @param array $organizationNamesArray 例) ['WBA', 'WBC']
   */
  public function updateTitleMatchExecute(int $matchId, array $organizationsNameArray): void
  {
    $this->titleMatchRepository->deleteTitleMatch($matchId);

    $titleMatchesArray = $this->formatForStoreToTitleMatchTable($matchId, $organizationsNameArray);

    $this->titleMatchRepository->insertTitleMatch($titleMatchesArray);
  }

  /**
   * フロントから受け取るtitles配列からtitle_matchesテーブルに保存する形にフォーマットする
   *
   * @param int $matchId
   * @param array $organizationsNameArray 例) ['WBA', 'WBC']
   *
   * @return array 例) [["match_id" => 1, "organization_id" => 3]]
   */
  public function formatForStoreToTitleMatchTable(int $matchId, array $organizationsNameArray)
  {
    $createTitleMatchesArray = function ($organizationName) use ($matchId) {
      $organizationId = $this->organizationRepository->getOrganizationId($organizationName);
      return ["match_id" => $matchId, "organization_id" => $organizationId];
    };

    $titleMatchesArray = array_map(fn ($organizationName) => $createTitleMatchesArray($organizationName), $organizationsNameArray);

    return $titleMatchesArray;
  }
}
