<?php

namespace App\Repository;

use App\Models\Boxer;

class BoxerRepository
{

  /**
   * @param array $boxerData
   * @return  \App\Models\Boxer
   */
  public static function create(array $boxerData): Boxer
  {
    return Boxer::create($boxerData);
  }

  /**
   * @param int $boxerId
   * @return \App\Models\Boxer|null
   */
  public static function get(int $boxerId): ?Boxer
  {
    return Boxer::find($boxerId);
  }

  /**
   * @param int $boxerId
   * @return \App\Models\Boxer
   */
  public static function getBoxerFindOrFail(int $boxerId): Boxer
  {
    return Boxer::findOrFail($boxerId);
  }

  /**
   * 保有タイトルを含むボクサーのデータを取得
   *
   * @param int $boxerId
   * @return \App\Models\Boxer|array|null
   */
  public static function getWithTitles(int $boxerId): ?Boxer
  {
    return Boxer::with(["titles.organization", "titles.weightDivision"])
      ->find($boxerId);
  }

  /**
   * @return array [array $boxersResource, int $boxersCount]
   */
  public function getBoxers(array $searchWordArray, int $under, int $limit): array
  {
    list($getBoxerQuery, $getCountQuery) = $this->buildQueryForGetBoxers($searchWordArray, $under, $limit);
    $boxers = $getBoxerQuery->with(["titles.organization", "titles.weightDivision"])->get();
    $boxersCount = (int) $getCountQuery->count();

    return [$boxers, $boxersCount];
  }

  /**
   * @param array $searchWordArray
   * @param int $under
   * @param int $limit
   * @return array [query, $getBoxerQuery] [query, $getCountQuery]
   */
  private function buildQueryForGetBoxers(array $searchWordArray, int $under, int $limit): array
  {
    $getBoxersNewQuery = Boxer::query();
    $getBoxersCountNewQuery = Boxer::query();

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

  private function createWhereClauseArray(array $arr_word): array
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
}
