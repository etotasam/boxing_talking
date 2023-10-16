<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use App\Models\Boxer;
use App\Repository\BoxerRepository;
use App\Repository\OrganizationRepository;
use App\Repository\TitleRepository;
use App\Repository\WeightDivisionRepository;

class BoxerService
{

  public function __construct()
  {
  }

  /**
   * @param array $boxerData ボクサー登録に必要なデータの連想配列
   * @return JsonResponse
   */
  public function createBoxer(array $boxerData)
  {
    try {
      DB::transaction(function () use ($boxerData) {
        list($storedBoxer, $titles) = $this->storeBoxerAndExtractTitles($boxerData);
        $this->storeTitle($storedBoxer['id'], $titles);
      });
    } catch (Exception $e) {
      return response()->json(["message" => $e->getMessage() ?: "Failed boxer register"], $e->getCode() ?: 500);
    }

    return response()->json(["message" => "Success created boxer"], 200);
  }


  /**
   * @param Boxer $targetBoxer
   * @return null|JsonResponse
   */
  public function deleteBoxer(Boxer $targetBoxer)
  {
    try {
      DB::transaction(function () use ($targetBoxer) {
        TitleRepository::delete($targetBoxer->id); //?ボクサーが所持しているタイトルを削除
        $targetBoxer->delete();
      });
    } catch (Exception $e) {
      return response()->json(["success" => false, "message" => $e->getMessage() ?: "Failed boxer delete"], $e->getCode() ?: 500);
    }
  }


  /**
   * @param array $updateBoxerData アップデート対象データの配列
   * @return null|JsonResponse
   */
  public function updateBoxerExecute(Boxer $targetBoxer, array $updateBoxerData)
  {

    DB::transaction(function () use ($updateBoxerData, $targetBoxer) {
      if (array_key_exists('titles', $updateBoxerData)) {
        $this->storeTitle($updateBoxerData['id'], $updateBoxerData["titles"]);
        unset($updateBoxerData["titles"]);
      };
      $targetBoxer->update($updateBoxerData);
    });
  }

  /**
   * ボクサーデータのstoreと、保持タイトルがあればstore
   *
   * @param array $boxerData ボクサー登録に必要なデータの連想配列
   * @return array|JsonResponse [Boxer $storedBoxer, array $titlesArray]
   */
  private function storeBoxerAndExtractTitles(array $boxerData): array|JsonResponse
  {
    if (array_key_exists('titles', $boxerData)) {
      $titlesArray = $boxerData["titles"];
      unset($boxerData["titles"]);
    } else {
      return response()->json(['success' => false, 'message' => 'Titles property is not exists in boxer data'], 403);
      // throw new Exception('Titles property is not exists in boxer data', 404);
    }
    $storedBoxer = BoxerRepository::create($boxerData);
    return [$storedBoxer, $titlesArray];
  }

  /**
   * @param int $boxerId
   *
   * @return Boxer
   */
  public function getBoxer(int $boxerId): Boxer
  {
    try {
      $boxer = BoxerRepository::getBoxerFindOrFail($boxerId);
    } catch (Exception $e) {
      throw new Exception("No boxer with that ID exists", 404);
    };
    return $boxer;
  }


  /**
   * @return array boxerData
   */
  public function getBoxerSingleById(int $boxerId): array
  {
    $fetchedBoxer = BoxerRepository::getWithTitles($boxerId);
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

  public function storeTitle(int $boxerId, array $titles): void
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


  /**
   * ボクサー検索時のワードが英語名検索かどうか日本語名の方かを振り分ける
   */
  public function parseRequestName(?string $requestName): array
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
}
