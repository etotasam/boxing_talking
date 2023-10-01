<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use App\Models\Boxer;
use App\Repository\BoxerRepository;
use App\Repository\OrganizationRepository;
use App\Repository\TitleRepository;
use App\Repository\MatchRepository;
use App\Repository\WeightDivisionRepository;
use App\Http\Resources\BoxerResource;

class BoxerService
{

  public function __construct()
  {
  }


  /**
   * @param array boxerData
   * @return JsonResponse
   */
  public function createBoxer($boxerData): JsonResponse
  {
    try {
      DB::beginTransaction();
      list($storedBoxer, $titles) = $this->storeBoxerAndExtractTitles($boxerData);
      $this->storeTitle($storedBoxer['id'], $titles);
      DB::commit();
      return response()->json(["message" => "Success created boxer"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getCode()) {
        return response()->json(["message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["message" => "Failed boxer register"], 500);
    }
  }

  /**
   * @param array boxerData
   * @return array [storedBoxerData, tittlesArray]
   */
  private function storeBoxerAndExtractTitles($boxerData): array
  {
    if (array_key_exists('titles', $boxerData)) {
      $titlesArray = $boxerData["titles"];
      unset($boxerData["titles"]);
    } else {
      throw new Exception('Titles property is not exists in boxer data', 404);
    }
    $createdBoxer = BoxerRepository::create($boxerData);
    return [$createdBoxer, $titlesArray];
  }

  /**
   * @param int boxerID
   *
   * @return Boxer
   */
  public function getBoxer($boxerID): Boxer
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
    $fetchedBoxer = BoxerRepository::getWithTitles($boxerID);
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
   * @param int boxerId string
   * @param object titles
   * @return void
   */
  public function storeTitle($boxerId, $titles): void
  {
    TitleRepository::delete($boxerId);
    if (!empty($titles)) {
      foreach ($titles as $title) {
        $organizationName = $title["organization"];
        $organization = OrganizationRepository::get($organizationName);
        $weightDivisionName = $title["weight"];
        $weightDivision = WeightDivisionRepository::get($weightDivisionName);
        TitleRepository::create($boxerId, $organization["id"], $weightDivision["id"]);
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
   * @return JsonResponse
   */
  public function getBoxersAndCount($requestName, $country, $limit, $page): JsonResponse
  {
    $boxerRepository = new BoxerRepository;
    try {
      list($eng_name, $name) = $this->parseRequestName($requestName);
      $country = $country ?? null;
      $limit = $limit ?? 15;
      $page = $page ?? 1;
      $under = ($page - 1) * $limit;  //取得を開始する位置を指定(2ページ目などもあるので…)

      $searchWordArray = array_filter(compact("name", "eng_name", "country"));

      list($boxers, $boxersCount) = $boxerRepository->getBoxers($searchWordArray, $under, $limit);

      $formattedBoxers = $boxers->map(function ($boxer) {
        $formattedBoxer = new BoxerResource($boxer);
        return $formattedBoxer;
      });

      return response()->json(["success" => true, 'boxers' => $formattedBoxers, 'count' => $boxersCount], 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["success" => false, "message" => "Failed getBoxersAndCount"], 500);
    }
  }

  /**
   * @param int boxerId
   *
   * @return void
   */
  public function throwExceptionIfBoxerHaveMatch($boxerId): void
  {
    if (MatchRepository::haveMatchBoxer($boxerId)) {
      throw new Exception("Boxer has already setup match", 406);
    }
  }


  /**
   * @param int boxerId
   * @param string engName
   *
   * @return JsonResponse
   */
  public function deleteBoxer($boxerId, $engName): JsonResponse
  {
    try {
      $targetBoxer = $this->getBoxer($boxerId);
      //? データの整合性をチェック
      if ($targetBoxer->eng_name != $engName) {
        throw new Exception("Request data is dose not match boxer in database", 406);
      };
      $this->throwExceptionIfBoxerHaveMatch($boxerId);
      DB::beginTransaction();
      TitleRepository::delete($boxerId); //?ボクサーが所持しているタイトルを削除
      $targetBoxer->delete();
      DB::commit();
      return response()->json(["success" => true, "message" => "Boxer is deleted"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getCode() === 406) {
        return response()->json(["success" => false, "message" => $e->getMessage()], 406);
      }
      return response()->json(["success" => false, "message" => "Delete error"], 500);
    }
  }


  /**
   * @param array アップデート対象データの配列
   * @return JsonResponse
   */
  public function updateBoxerData($updateBoxerData): JsonResponse
  {
    try {
      $targetBoxer = $this->getBoxer($updateBoxerData['id']);
      DB::beginTransaction();
      $this->storeTitle($updateBoxerData['id'], $updateBoxerData["titles"]);
      unset($updateBoxerData["titles"]);
      $targetBoxer->update($updateBoxerData);
      DB::commit();
      return response()->json(["success" => true, "message" => "Successful boxer update"], 200);
    } catch (Exception $e) {
      DB::rollBack();
      if ($e->getCode()) {
        return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["success" => false, "message" => "Failed fighter update"], 500);
    }
  }
}
