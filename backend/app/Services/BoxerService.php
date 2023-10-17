<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use App\Services\TitleService;
use App\Repositories\OrganizationRepository;
use App\Repositories\WeightDivisionRepository;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;

class BoxerService
{

  protected $boxerRepository;
  protected $titleRepository;
  protected $titleService;
  public function __construct(
    BoxerRepositoryInterface $boxerRepository,
    TitleRepositoryInterface $titleRepository,
    TitleService $titleService,
  ) {
    $this->boxerRepository = $boxerRepository;
    $this->titleRepository = $titleRepository;
    $this->titleService = $titleService;
  }

  /**
   * @param array $boxerData ボクサー登録に必要なデータの連想配列
   * @return JsonResponse
   */
  public function createBoxer(array $boxerData)
  {
    try {
      DB::transaction(function () use ($boxerData) {
        list($storedBoxer, $titles) = $this->postBoxerAndExtractTitles($boxerData);
        //ボクサーがタイトルを保持している場合はtitlesテーブルに保存
        $this->titleService->storeTitle($storedBoxer['id'], $titles);
      });
    } catch (\Exception $e) {
      return response()->json(["message" => $e->getMessage() ?: "Failed boxer register"], $e->getCode() ?: 500);
    }

    return response()->json(["message" => "Success created boxer"], 200);
  }


  /**
   * @param int $boxerId
   * @return null
   */
  public function deleteBoxerExecute(int $boxerId)
  {
    DB::beginTransaction();
    try {
      $this->titleRepository->deleteTitlesHoldByTheBoxer($boxerId); //?ボクサーが所持しているタイトルを削除
      $isDelete = $this->boxerRepository->deleteBoxer($boxerId);
      if (!$isDelete) {
        throw new \Exception("Target boxer not exists", 404);
      }
    } catch (\Exception $e) {
      DB::rollBack();
      throw new \Exception($e->getMessage(), $e->getCode());
    }
    DB::commit();
  }


  /**
   * @param array $updateBoxerData アップデート対象データの配列
   * @return null|JsonResponse
   */
  public function updateBoxerExecute(array $updateBoxerData)
  {

    DB::transaction(function () use ($updateBoxerData) {
      if (array_key_exists('titles', $updateBoxerData)) {
        $this->titleService->storeTitle($updateBoxerData['id'], $updateBoxerData["titles"]);
        unset($updateBoxerData["titles"]);
      };
      $this->boxerRepository->updateBoxer($updateBoxerData);
    });
  }

  /**
   * ボクサーデータのstoreと、保持タイトルがあればstore
   *
   * @param array $boxerData ボクサー登録に必要なデータの連想配列
   * @return array|JsonResponse [Boxer $storedBoxer, array $titlesArray]
   */
  private function postBoxerAndExtractTitles(array $boxerData): array|JsonResponse
  {
    if (array_key_exists('titles', $boxerData)) {
      $titlesArray = $boxerData["titles"];
      unset($boxerData["titles"]);
    } else {
      return response()->json(['success' => false, 'message' => 'Titles property is not exists on boxer data'], 403);
      // throw new Exception('Titles property is not exists in boxer data', 404);
    }
    $storedBoxer = $this->boxerRepository->createBoxer($boxerData);
    return [$storedBoxer, $titlesArray];
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
