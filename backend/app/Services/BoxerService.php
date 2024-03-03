<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use App\Services\TitleService;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Exceptions\BoxerException;
use Illuminate\Database\QueryException;

class BoxerService
{

  public function __construct(
    protected BoxerRepositoryInterface $boxerRepository,
    protected TitleRepositoryInterface $titleRepository,
    protected TitleService $titleService,
  ) {
  }

  /**
   * @param array $boxerData ボクサー登録に必要なデータの連想配列
   * @return JsonResponse
   */
  public function createBoxer(array $boxerData)
  {
    try {
      DB::transaction(function () use ($boxerData) {
        [$storedBoxer, $titles] = $this->postBoxerAndExtractTitles($boxerData);
        //ボクサーがタイトルを保持している場合はtitlesテーブルに保存
        $this->titleService->storeTitle($storedBoxer['id'], $titles);
      });
    } catch (QueryException $e) {
      \Log::error("database error with post boxer:" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (Exception $e) {
      throw new Exception("Failed create boxer :" . $e->getMessage());
    }
  }

  /**
   * @param int $boxerId
   * @return null
   */
  public function deleteBoxerExecute(int $boxerId)
  {
    try {
      DB::transaction(function () use ($boxerId) {
        $this->titleRepository->deleteTitlesHoldByTheBoxer($boxerId); //?所持タイトルの削除(外部キー制約がある為ボクサー削除の前に実行)
        $isDelete = $this->boxerRepository->deleteBoxer($boxerId);
        if (!$isDelete) {
          throw new BoxerException("boxer is not found");
        }
      });
    } catch (QueryException $e) {
      \Log::error("database error with delete boxer" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (BoxerException $e) {
      throw new BoxerException("Failed delete boxer :" . $e->getMessage());
    }
  }

  /**
   * boxerデータのupdate
   * @param array $updateBoxerData アップデート対象データの配列
   * @return null|JsonResponse
   */
  public function updateBoxerExecute(array $updateBoxerData)
  {
    try {
      DB::transaction(function () use ($updateBoxerData) {
        if (array_key_exists('titles', $updateBoxerData)) {
          $this->titleService->storeTitle($updateBoxerData['id'], $updateBoxerData["titles"]);
          unset($updateBoxerData["titles"]);
        };
        \Log::debug($updateBoxerData);
        $this->boxerRepository->updateBoxer($updateBoxerData);
      });
    } catch (QueryException $e) {
      \Log::error("database error with update boxer :" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (Exception $e) {
      throw new Exception("Failed update boxer :" . $e->getMessage());
    }
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
      \Log::error('Titles property is not exists in boxer data');
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
