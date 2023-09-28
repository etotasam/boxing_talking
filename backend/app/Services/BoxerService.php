<?php

namespace App\Services;

use Exception;
use App\Models\Organization;
use App\Models\WeightDivision;
use App\Models\Title;
use App\Models\Boxer;
//Resource
use App\Http\Resources\BoxerResource;

class BoxerService
{

  public function __construct(Organization $organization, WeightDivision $weightDivision, Title $title, Boxer $boxer)
  {
    $this->organization = $organization;
    $this->weightDivision = $weightDivision;
    $this->title = $title;
    $this->boxer = $boxer;
  }

  /**
   * update titles
   *
   * @param int boxerID string
   * @param object titles
   * @return void
   */
  public function setTitle($boxerID, $titles)
  {
    Title::where('boxer_id', $boxerID)->delete();
    if (!empty($titles)) {
      foreach ($titles as $title) {
        $organizationName = $title["organization"];
        $organization = $this->organization->where("name", $organizationName)->first();
        if (!$organization) {
          throw new Exception("organization is not exists");
        }
        $weightDivisionWeight = $title["weight"];
        $weightDivision = $this->weightDivision->where("weight", $weightDivisionWeight)->first();
        if (!$weightDivision) {
          throw new Exception("weight_division is not exists");
        }
        $this->title->create([
          "boxer_id" => $boxerID,
          "organization_id" => $organization["id"],
          "weight_division_id" => $weightDivision["id"]
        ]);
      }
    }
  }


  /**
   *
   * @param string name
   * @param string country
   * @param int limit
   * @param int page
   *
   * @return array (key-value) boxers
   * @return int count
   */
  public function getBoxersAndCount($requestName, $country, $limit, $page)
  {
    try {
      if ($requestName) {
        if ($this->isEnglish($requestName)) {
          $eng_name = $requestName;
          $name = null;
        } else {
          $eng_name = null;
          $name = $requestName;
        }
      } else {
        $eng_name = null;
        $name = null;
      }
      $country = $country;
      $limit = 15;
      $page = $page;

      if (!isset($page)) $page = 1;
      $under = ($page - 1) * $limit;

      $searchWordArray = array_merge(compact("name"), compact("eng_name"), compact("country"));
      $formattedSearchWordArray = array_filter($searchWordArray, function ($value) {
        return $value !== null;
      });

      $newQuery = $this->boxer->newQuery();
      if (empty($formattedSearchWordArray)) {
        $query = $newQuery->offset($under)->limit($limit);
      } else {
        $whereClauseArray = $this->createWhereClauseArray($formattedSearchWordArray);
        $query = $newQuery->where($whereClauseArray)->offset($under)->limit($limit);
      }
      // \Log::error($whereClauseArray);
      $boxers = $query->with(["titles.organization", "titles.weightDivision"])->get();

      $formattedBoxers = $boxers->map(function ($boxer) {
        $formattedBoxer = new BoxerResource($boxer);
        return $formattedBoxer;
      });

      return response()->json($formattedBoxers, 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        throw new Exception($e->getMessage(), $e->getCode());
      }
      throw new Exception("Failed getBoxersWithNameAndCountry", 500);
    }
  }

  protected function createWhereClauseArray($arr_word): array
  {
    $arrayQuery = array_map(function ($key, $value) {
      if (isset($value)) {
        if ($key == 'name' || $key == "eng_name") {
          return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
        } else {
          return [$key, 'like', $value];
        }
      }
    }, array_keys($arr_word), array_values($arr_word));

    $arrayQueries = array_filter($arrayQuery, function ($el) {
      if (isset($el)) {
        return $el;
      }
    });

    return $arrayQueries;
  }

  protected function isEnglish($str)
  {
    $englishRanges = [
      ['start' => 0x0041, 'end' => 0x005A], // 大文字アルファベット (A-Z)
      ['start' => 0x0061, 'end' => 0x007A], // 小文字アルファベット (a-z)
    ];

    if (mb_strlen($str, 'UTF-8') > 0) {
      $firstChar = mb_substr($str, 0, 1, 'UTF-8');
      $unicodeValue = ord($firstChar);

      foreach ($englishRanges as $range) {
        if ($unicodeValue >= $range['start'] && $unicodeValue <= $range['end']) {
          return true;
        }
      }
    }

    return false;
  }
}
