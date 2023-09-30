<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Collection;
use Illuminate\Http\Response;
use App\Models\Organization;
use App\Models\TitleMatch;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Repository\MatchRepository;
use App\Repository\CommentRepository;
use App\Repository\PredictionRepository;
use App\Repository\TitleRepository;
// Services
use App\Services\BoxerService;

class MatchService
{

  public function __construct(
    BoxingMatch $match,
    Boxer $boxer,
    Organization $organization,
    TitleMatch $titleMatch,
    BoxerService $boxerService
  ) {
    $this->match = $match;
    $this->boxer = $boxer;
    $this->organization = $organization;
    $this->titleMatch = $titleMatch;
    $this->boxerService = $boxerService;
  }


  /**
   * @param int matchID
   * @return BoxingMatch match
   */
  public function getSingleMatchOrThrowExceptionWhenNotExists($matchID): BoxingMatch
  {
    $match = $this->match->find($matchID);
    if (!$match) {
      throw new Exception("Match is not exists", 404);
    }
    return $match;
  }

  /**
   * @param string range
   * @return Collection
   */
  public function getAndFormatMatches($range): Collection
  {
    $matches = MatchRepository::getMatches($range);
    $formattedMatches = $matches->map(function ($item) {
      $redBoxer = $this->boxerService->getBoxerSingleByID($item->red_boxer_id);
      $blueBoxer = $this->boxerService->getBoxerSingleByID($item->blue_boxer_id);
      $titles = $this->formatTitles($item);

      return  [
        "id" => $item->id,
        "red_boxer" => $redBoxer,
        "blue_boxer" => $blueBoxer,
        "country" => $item->country,
        "venue" => $item->venue,
        "grade" => $item->grade,
        "titles" => $titles,
        "weight" => $item->weight,
        "match_date" => $item->match_date,
        "count_red" => $item->count_red,
        "count_blue" => $item->count_blue
      ];
    });

    return $formattedMatches;
  }

  // formatMatches()内で使用
  public function formatTitles($match)
  {
    $organizations = $match->organization;
    $organizationsArray = !empty($organizations) ? $this->formatTitlesInCaseExists($organizations, $match) : [];
    return $organizationsArray;
  }

  private function formatTitlesInCaseExists($organizations, $match)
  {
    $organizationsArray =  $organizations->map(function ($organization) use ($match) {
      $title = ["organization" => $organization->name, 'weightDivision' => $match->weight];
      return $title;
    });
    return $organizationsArray;
  }


  /**
   * @param array organizationsArray
   * @param array match
   * @return void
   */
  public function createMatchWithTitles($organizationsArray, $match)
  {
    $createdMatch = MatchRepository::createMatch($match);
    if (!empty($organizationsArray)) {
      foreach ($organizationsArray as $organizationName) {
        $organization = $this->organization->where('name', $organizationName)->first();
        if (!$organization) {
          throw new Exception("Not get organization name", Response::HTTP_METHOD_NOT_ALLOWED);
        }
        $this->titleMatch->create([
          'match_id' => $createdMatch['id'],
          'organization_id' => $organization['id']
        ]);
      }
    }
  }


  /**
   * @param int matchID
   * @return \Illuminate\Support\Collection
   */
  public function getTitleOfMatch($matchID)
  {
    if (!empty($matchID)) {
      $titles = $this->titleMatch->where('match_id', $matchID)->get();
      return !$titles->isEmpty() ? $titles : collect();
    }
  }

  /**
   * @param array match
   * @return  array
   */
  public function getOrganizationsArray($match): array
  {
    if (array_key_exists('titles', $match)) {
      $organizationsArray = $match['titles'];
    } else {
      throw new Exception("titles(organizations) is not exists in match data", Response::HTTP_NOT_ACCEPTABLE);
    }
    return $organizationsArray;
  }

  /**
   * @param int matchID
   * @return void
   */
  public function deleteMatchAndRelatedData($matchID): void
  {
    $match = MatchRepository::getMatch($matchID);
    if (!isset($match)) {
      throw new Exception("not exit match");
    }
    $match->delete();
    CommentRepository::deleteCommentByMatchId($matchID);
    PredictionRepository::deletePredictionByMatchId($matchID);
    TitleRepository::deleteTitleByBoxerId($matchID);
  }

  /**
   * @param int matchID
   * @return void
   */
  public function deleteTitleMatch($matchID): void
  {
    $titles = $this->titleMatch->where('match_id', $matchID)->get();
    if (!$titles->isEmpty()) {
      $idsToDelete = $titles->pluck('match_id')->toArray();
      $this->titleMatch->whereIn('match_id', $idsToDelete)->delete();
    }
  }
}
