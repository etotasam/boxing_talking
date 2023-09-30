<?php

namespace App\Services;

use Exception;
use App\Models\Boxer;
use App\Repository\BoxerRepository;
use App\Repository\OrganizationRepository;
use App\Repository\TitleRepository;
use App\Repository\MatchRepository;
use App\Http\Resources\BoxerResource;
use App\Repository\WeightDivisionRepository;

class BoxerService
{

  public function __construct()
  {
  }

  /**
   *
   * @param array boxer
   * @return array
   */
  public function createBoxerWithTitles($boxer): array
  {
    if (array_key_exists('titles', $boxer)) {
      $titlesArray = $boxer["titles"];
      unset($boxer["titles"]);
    } else {
      throw new Exception('titles is not exists in boxer data', 404);
    }
    $createdBoxer = BoxerRepository::createBoxer($boxer);
    return [$createdBoxer, $titlesArray];
  }

  /**
   * @param int boxerID
   *
   * @return Boxer
   */
  public function getBoxerOrThrowExceptionIfNotExists($boxerID): Boxer
  {
    try {
      $boxer = BoxerRepository::getBoxerFindOrFail($boxerID);
    } catch (Exception $e) {
      throw new Exception("No boxer with that ID exists", 404);
    };
    return $boxer;
  }


  /**
   * boxerを個別で取得
   * @param int boxerID
   *
   * @return array(key-value) boxerData
   */
  public function getBoxerSingleByID($boxerID)
  {
    $fetchedBoxer = BoxerRepository::getBoxerSingleWithTitles($boxerID);
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
   *
   * @param int boxerID string
   * @param object titles
   * @return void
   */
  public function setTitle($boxerID, $titles)
  {
    TitleRepository::deleteTitleByBoxerId($boxerID);
    if (!empty($titles)) {
      foreach ($titles as $title) {
        $organizationName = $title["organization"];
        $organization = OrganizationRepository::getOrganizationByOrganizationName($organizationName);
        $weightDivisionName = $title["weight"];
        $weightDivision = WeightDivisionRepository::getWeightDivisionByWeightName($weightDivisionName);
        TitleRepository::createTitle($boxerID, $organization["id"], $weightDivision["id"]);
      }
    }
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
    $boxerRepository = new BoxerRepository;
    try {
      list($eng_name, $name) = $this->parseRequestName($requestName);
      $country = $country ?? null;
      $limit = $limit ?? 15;
      $page = $page ?? 1;
      $under = ($page - 1) * $limit;  //取得を開始する位置を指定(2ページ目などもあるので…)

      $searchWordArray = array_filter(compact("name", "eng_name", "country"));

      list($boxers, $boxersCount) = $boxerRepository->getBoxersWithTitlesAndCount($searchWordArray, $under, $limit);

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
   * @param int boxerID
   *
   * @return void
   */
  public function throwErrorIfBoxerHaveMatch($boxerID): void
  {
    if (MatchRepository::haveMatchBoxer($boxerID)) {
      throw new Exception("Boxer has already setup match", 406);
    }
  }
}
