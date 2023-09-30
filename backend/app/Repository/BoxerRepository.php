<?php

namespace App\Repository;

use App\Models\Boxer;

class BoxerRepository
{
  // public function __construct(Boxer $boxer)
  // {
  //   $this->boxer = $boxer;
  // }

  /**
   * @param Boxer
   * @return Boxer
   */
  public static function createBoxer($boxerModel): Boxer
  {
    return Boxer::create($boxerModel);
  }

  /**
   * @param int boxerID
   * @return Boxer
   */
  public static function getBoxer($boxerID): Boxer
  {
    return Boxer::find($boxerID);
  }

  /**
   * @param int boxerID
   * @return Boxer
   */
  public static function getBoxerFindOrFail($boxerID): Boxer
  {
    return Boxer::findOrFail($boxerID);
  }

  /**
   * @param int boxerID
   * @return Boxer
   */
  public static function getBoxerSingleWithTitles($boxerID): Boxer
  {
    return Boxer::with(["titles.organization", "titles.weightDivision"])
      ->find($boxerID);
  }


  /**
   * @param array searchWordArray
   * @param int under
   * @param int limit
   *
   * @return [Boxer, int] [boxers, boxersCount]
   */
  public function getBoxersWithTitlesAndCount($searchWordArray, $under, $limit)
  {
    list($getBoxerQuery, $getCountQuery) = $this->buildQuery($searchWordArray, $under, $limit);
    $boxers = $getBoxerQuery->with(["titles.organization", "titles.weightDivision"])->get();
    $boxersCount = $getCountQuery->count();

    return [$boxers, $boxersCount];
  }

  //getBoxersWithTitlesAndCount()内でクエリ作成関数
  private function buildQuery($searchWordArray, $under, $limit): array
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
}
