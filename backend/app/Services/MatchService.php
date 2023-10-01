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
use App\Services\BoxerService;
use App\Services\TitleMatchService;

class MatchService
{

  public function __construct(
    TitleMatch $titleMatch,
    BoxerService $boxerService,
    TitleMatchService $titleMatchService
  ) {
    $this->titleMatch = $titleMatch;
    $this->boxerService = $boxerService;
    $this->titleMatchService = $titleMatchService;
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
      $formattedMatchesData = $this->formatMatchesDataWhenFetchMatches($matches);
      return response()->json($formattedMatchesData, 200);
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

  /**
   * コントローラーのupdate
   */
  public function updateMatch(int $matchId, array $updateMatchData): JsonResponse
  {
    try {
      $match = $this->getSingleMatch($matchId);
      DB::beginTransaction();
      if (isset($updateMatchData['titles'])) {
        $this->titleMatchService->updateTitleMatches($matchId, $updateMatchData['titles']);
        unset($updateMatchData['titles']);
      }
      $match->update($updateMatchData);
      DB::commit();
      return response()->json(["success" => true, "message" => "Success update match data"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getCode()) {
        return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["success" => false, "message" => "Failed update match"], 500);
    }
  }


  public function formatTitles(BoxingMatch $match): array
  {
    $organizations = $match->organization;
    $organizationsArray = !empty($organizations) ? $this->formatTitlesInCaseExists($organizations, $match)->toArray() : [];
    return $organizationsArray;
  }

  private function formatTitlesInCaseExists(Collection $organizations, BoxingMatch $match): Collection
  {
    $organizationsArray =  $organizations->map(function ($organization) use ($match) {
      $title = ["organization" => $organization->name, 'weightDivision' => $match->weight];
      return $title;
    });
    return $organizationsArray;
  }

  private function formatMatchesDataWhenFetchMatches(Collection $matches): Collection
  {
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


  /**
   * @param array organizationsArray
   * @param array match
   * @return void
   */
  public function storeMatchAndStoreTitleMatches(array $organizationsArray, array $match)
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
   * @param int matchId
   * @return \Illuminate\Support\Collection
   */
  public function getTitleOfMatch($matchId): Collection
  {
    if (!empty($matchId)) {
      $titles = $this->titleMatch->where('match_id', $matchId)->get();
      return !$titles->isEmpty() ? $titles : collect();
    }
  }

  public function getSingleMatch(int $matchId): BoxingMatch
  {
    $match = MatchRepository::get($matchId);
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
}
