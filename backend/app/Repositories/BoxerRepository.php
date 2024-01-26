<?php

namespace App\Repositories;

use App\Models\Boxer;
use App\Repositories\Interfaces\BoxerRepositoryInterface;

class BoxerRepository implements BoxerRepositoryInterface
{


  public function getBoxerById(int $boxerId)
  {
    return Boxer::findOrFail($boxerId);
  }

  public function isBoxerById(int $boxerId)
  {
    return Boxer::where('id', $boxerId)->exists();
  }

  public function getBoxerWithTitlesById(int $boxerId): ?Boxer
  {
    return Boxer::with(["titles.organization", "titles.weightDivision"])
      ->find($boxerId);
  }

  public function createBoxer(array $boxerData): Boxer
  {
    return Boxer::create($boxerData);
  }

  public function deleteBoxer(int $boxerId)
  {
    $res = Boxer::destroy($boxerId);
    return (bool) $res;
  }

  public function updateBoxer(array $updateBoxerData)
  {
    $boxer = Boxer::findOrFail($updateBoxerData['id']);
    $boxer->fill($updateBoxerData);
    return $boxer->save();
  }


  public function getBoxers(array $searchWordArray, ?int $reqPage, ?int $reqLimit): array
  {
    $limit = $reqLimit ?? 15;
    $page = $reqPage ?? 1;
    $under = ($page - 1) * $limit;

    [$getBoxerQuery, $getCountQuery] = $this->buildQueryForGetBoxers($searchWordArray, $under, $limit);
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
  protected function buildQueryForGetBoxers(array $searchWordArray, int $under, int $limit): array
  {
    $getBoxersNewQuery = Boxer::query();
    $getBoxersCountNewQuery = Boxer::query();

    if (empty($searchWordArray)) {
      $getBoxerQuery = $getBoxersNewQuery->offset($under)->limit($limit);
      $getCountQuery = $getBoxersCountNewQuery;
    } else {
      $whereClauseArray = $this->buildWhereClauseQueriesArray($searchWordArray);
      $getBoxerQuery = $getBoxersNewQuery->where($whereClauseArray)->offset($under)->limit($limit);
      $getCountQuery = $getBoxersCountNewQuery->where($whereClauseArray);
    }

    return [$getBoxerQuery, $getCountQuery];
  }

  protected function buildWhereClauseQueriesArray(array $arr_word): array
  {
    $createQuery = function ($key, $value) {
      if (isset($value)) {
        if ($key == 'name' || $key == "eng_name") {
          return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
        } else {
          return [$key, 'like', $value];
        }
      }
    };
    $arrayQueries = array_map(fn ($key, $value) => $createQuery($key, $value), array_keys($arr_word), array_values($arr_word));

    // $arrayQueries = array_filter($arrayQueries);

    return array_filter($arrayQueries);;
  }
}
