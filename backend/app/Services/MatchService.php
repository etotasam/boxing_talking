<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\Organization;
use App\Models\TitleMatch;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Repository\MatchRepository;
use App\Repository\OrganizationRepository;
use App\Repository\CommentRepository;
use App\Repository\TitleMatchRepository;
use App\Repository\WinLossPredictionRepository;
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
   * コントローラーのstore
   */
  public function storeMatch(array $matchDataForStore): JsonResponse
  {
    try {
      DB::beginTransaction();
      $organizationsArray = $this->extractOrganizationsArray($matchDataForStore);
      unset($matchDataForStore['titles']);
      $this->storeMatchAndStoreTitleMatches($organizationsArray, $matchDataForStore);
      DB::commit();
      return response()->json(["success" => true, "message" => "Success store match"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getCode()) {
        return response()->json(["message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["message" => "Failed store match"], 500);
    };
  }

  /**
   * コントローラーのfetch
   */
  public function fetchMatches(string $range = null): JsonResponse
  {
    try {
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
      return response()->json($formattedMatches, 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["success" => false, "message" => $e->getMessage()], 500);
    }
  }

  /**
   * コントローラーのdelete
   */
  public function deleteMatch(int $matchId): JsonResponse
  {
    try {
      DB::beginTransaction();
      $this->deleteMatchAndRelatedData($matchId);
      DB::commit();
      return response()->json(["message" => "Success match delete"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getMessage()) {
        return response()->json(["message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["message" => "Failed while match delete"], 500);
    }
  }


  public function formatTitles(BoxingMatch $match): array
  {
    $organizations = $match->organization;
    $organizationsArray = !empty($organizations) ? $this->formatTitlesInCaseExists($organizations, $match)->toArray() : [];
    return $organizationsArray;
  }

  private function formatTitlesInCaseExists(Collection $organizations, BoxingMatch $match)
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
  public function storeMatchAndStoreTitleMatches($organizationsArray, $match)
  {
    $createdMatch = MatchRepository::create($match);
    if (!empty($organizationsArray)) {
      foreach ($organizationsArray as $organizationName) {
        $organization = OrganizationRepository::get($organizationName);
        if (!$organization) {
          throw new Exception("Not get organization name", Response::HTTP_METHOD_NOT_ALLOWED);
        }
        TitleMatchRepository::store($createdMatch['id'], $organization['id']);
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

  public function getSingleMatch(int $matchID): BoxingMatch
  {
    $match = MatchRepository::get($matchID);
    if (!$match) {
      throw new Exception("Match is not exists", 404);
    }
    return $match;
  }

  /**
   * @return  array organizationsArray
   */
  public function extractOrganizationsArray(array $matchDataForStore): array
  {
    if (array_key_exists('titles', $matchDataForStore)) {
      $organizationsArray = $matchDataForStore['titles'];
    } else {
      throw new Exception("titles(organizations) is not exists in match data", Response::HTTP_NOT_ACCEPTABLE);
    }
    return $organizationsArray;
  }

  /**
   * @param int matchId
   * @return void
   */
  public function deleteMatchAndRelatedData(int $matchId): void
  {
    $match = MatchRepository::get($matchId);
    if (is_null($match)) {
      throw new Exception("Not exit the match", 403);
    }
    TitleMatchRepository::delete($matchId);
    CommentRepository::delete($matchId);
    WinLossPredictionRepository::delete($matchId);
    $match->delete();
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
