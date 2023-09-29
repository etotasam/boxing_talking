<?php

namespace App\Services;

use Exception;
use App\Models\Organization;
use App\Models\WeightDivision;
use App\Models\Title;
use App\Models\Boxer;
use App\Models\BoxingMatch;
//Resource
use App\Http\Resources\BoxerResource;

class BoxerService
{

  public function __construct(
    Organization $organization,
    WeightDivision $weightDivision,
    Title $title,
    Boxer $boxer,
    BoxingMatch $match
  ) {
    $this->organization = $organization;
    $this->weightDivision = $weightDivision;
    $this->title = $title;
    $this->boxer = $boxer;
    $this->match = $match;
  }

  /**
   *
   * @param array boxer
   * @return array
   */
  public function createBoxer($boxer): array
  {
    if (array_key_exists('titles', $boxer)) {
      $titlesArray = $boxer["titles"];
      unset($boxer["titles"]);
    } else {
      throw new Exception('titles is not exists in boxer data', 404);
    }
    $createdBoxer = $this->boxer->create($boxer);
    return [$createdBoxer, $titlesArray];
  }

  /**
   * @param int boxerID
   * @return collection boxer data
   */
  public function getBoxerFindOrFail($boxerID)
  {
    return $this->boxer->findOrFail($boxerID);
  }

  /**
   * boxerを個別で取得
   * @param int boxerID
   *
   * @return array(key-value) boxerData
   */
  public function getBoxerSingleByID($boxerID)
  {
    $fetchedBoxer = $this->boxer->with(["titles.organization", "titles.weightDivision"])
      ->find($boxerID);
    if (!$fetchedBoxer) {
      throw new Exception("no exist boxer", 500);
    }
    $titles = $fetchedBoxer->titles->map(function ($title) {
      $name = $title->organization->name;
      $weight = $title->weightDivision->weight;
      return ["organization" => $name, "weight" => $weight];
    });
    $formattedBoxer = $fetchedBoxer->toArray();
    $formattedBoxer["titles"] = $titles;
    return $formattedBoxer;
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
    $this->title->where('boxer_id', $boxerID)->delete();
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
   * @param ind boxerID
   * @return void
   */
  public function deleteBoxerTitles($boxerID): void
  {
    $this->title->where('boxer_id', $boxerID)->delete();
  }

  //getBoxersAndCount()内で検索ワードが英語名検索かどうか日本語名の方かを振り分ける
  public function parseRequestName($requestName): array
  {
    if (!$requestName) {
      return [null, null];
    }

    return $this->isEnglish($requestName) ? [$requestName, null] : [null, $requestName];
  }

  protected function isEnglish($str): bool
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

  //getBoxersAndCount()内でクエリ作成関数
  private function buildQuery($searchWordArray, $under, $limit): array
  {
    $getBoxersNewQuery = $this->boxer->query();
    $getBoxersCountNewQuery = $this->boxer->query();

    if (empty($searchWordArray)) {
      $getBoxerQuery = $getBoxersNewQuery->offset($under)->limit($limit);
      $getCountQuery = $getBoxersCountNewQuery;
    } else {
      $whereClauseArray = $this->createWhereClauseArray($searchWordArray);
      $getBoxerQuery = $getBoxersNewQuery->where($whereClauseArray)->offset($under)->limit($limit);
      $getCountQuery = $getBoxersCountNewQuery->where($whereClauseArray);
    }

    return [$getBoxerQuery, $getCountQuery];
  }

  //buildQuery()内でwhere句を作成
  private function createWhereClauseArray($arr_word): array
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

    $arrayQueries = array_filter($arrayQuery);

    return $arrayQueries;
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
      list($eng_name, $name) = $this->parseRequestName($requestName);
      $country = $country ?? null;
      $limit = $limit ?? 15;
      $page = $page ?? 1;
      $under = ($page - 1) * $limit;  //取得を開始する位置を指定(2ページ目などもあるので…)

      $searchWordArray = array_filter(compact("name", "eng_name", "country"));

      list($getBoxerQuery, $getCountQuery) = $this->buildQuery($searchWordArray, $under, $limit);
      $boxers = $getBoxerQuery->with(["titles.organization", "titles.weightDivision"])->get();
      $boxersCount = $getCountQuery->count();

      $formattedBoxers = $boxers->map(function ($boxer) {
        $formattedBoxer = new BoxerResource($boxer);
        return $formattedBoxer;
      });

      return response()->json(['boxers' => $formattedBoxers, 'count' => $boxersCount], 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        throw new Exception($e->getMessage(), $e->getCode());
      }
      throw new Exception("Failed getBoxersWithNameAndCountry", 500);
    }
  }

  /**
   * @param Model boxingMatchModel
   * @param int boxerID
   *
   * @return void
   */
  public function throwErrorIfBoxerHaveMatch($boxerID): void
  {
    $isBoxerHaveMatchQuery = $this->match->query();
    $isBoxerHaveMatchQuery->where("red_boxer_id", $boxerID)->orWhere("blue_boxer_id", $boxerID);
    if ($isBoxerHaveMatchQuery->exists()) {
      throw new Exception("Boxer has already setup match", 406);
    }
  }
}
