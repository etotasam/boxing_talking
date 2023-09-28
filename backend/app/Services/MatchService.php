<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Response;
use App\Models\Organization;
use App\Models\TitleMatch;
use App\Models\Boxer;
use App\Models\BoxingMatch;

class MatchService
{

  public function __construct(
    BoxingMatch $match,
    Boxer $boxer,
    Organization $organization,
    TitleMatch $titleMatch
  ) {
    $this->match = $match;
    $this->boxer = $boxer;
    $this->organization = $organization;
    $this->titleMatch = $titleMatch;
  }

  /**
   * @param string range
   * @return array
   */
  public function getMatches($range)
  {
    if ($range == "all") {
      if (Auth::user()->administrator) {
        $matches = $this->match->orderBy('match_date')->get();
      } else {
        return response()->json(["success" => false, "message" => "Cannot get all matches without auth administrator"], 401);
      }
    } else if ($range == "past") {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = $this->match->where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
    } else {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = $this->match->where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
    }

    return $matches;
  }

  /**
   * @param int matchID
   * @return array matchData
   */
  public function getSingleMatch($matchID)
  {
    $match = $this->match->find($matchID);
    if (!$match) {
      throw new Exception("Match is not exists", 404);
    }
    return $match;
  }

  /**
   *
   * @param array matches
   * @return array
   */
  public function formatMatches($matches)
  {
    $formattedMatches = $matches->map(function ($item) {
      $redBoxer = $this->boxer->getBoxerSingleByID($item->red_boxer_id);
      $blueBoxer = $this->boxer->getBoxerSingleByID($item->blue_boxer_id);
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
   *
   * @param object match
   * @return array
   */
  public function formatTitles($match)
  {
    $organizations = $match->organization;
    if (!empty($organizations)) {
      $organizationsArray = $organizations->map(function ($organization) use ($match) {
        $title = ["organization" => $organization->name, 'weightDivision' => $match->weight];
        return $title;
      });
      return $organizationsArray;
    } else {
      $organizationsArray = [];
    }
    return $organizationsArray;
  }

  /**
   * @param array organizationsArray
   * @param int matchID
   * @return void
   */
  public function createTitleOfMatch($organizationsArray, $matchID)
  {
    if (!empty($organizationsArray)) {
      foreach ($organizationsArray as $organizationName) {
        $organization = $this->organization->where('name', $organizationName)->first();
        if (!$organization) {
          throw new Exception("Not get organization name", Response::HTTP_METHOD_NOT_ALLOWED);
        }
        $this->titleMatch->create([
          'match_id' => $matchID,
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
      if (!$titles->isEmpty()) {
        return $titles;
      } else {
        return collect();
      }
    }
  }

  /**
   * @param array match
   * @return void
   */
  public function getOrganizationsArray($match)
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
  public function deleteMatch($matchID)
  {
    $match = $this->match->find($matchID);
    if (!isset($match)) {
      throw new Exception("not exit match");
    }
    $match->delete();
  }
  /**
   * @param int matchID
   * @return void
   */
  public function deleteTitleMatch($matchID)
  {
    $titles = $this->titleMatch->where('match_id', $matchID)->get();
    if (!$titles->isEmpty()) {
      $idsToDelete = $titles->pluck('match_id')->toArray();
      $this->titleMatch->whereIn('match_id', $idsToDelete)->delete();
    }
  }
}
