<?php

namespace App\Repositories;

use App\Models\Title;
use Illuminate\Support\Collection;
use App\Repositories\Interfaces\TitleRepositoryInterface;

class TitleRepository implements TitleRepositoryInterface
{


  /**
   * ボクサーの所持するタイトルを取得
   * @param int $boxerId
   * @return Collection
   */
  public function getTitlesHoldByTheBoxer($boxerId)
  {
    return Title::where('boxer_id', $boxerId)->get();
  }

  /**
   * 他のボクサーが所持しているタイトルかどうかを調べる
   * @param int $organizationId
   * @param int $weightDivisionId
   * @return Boxer|null
   */
  public function hasOtherBoxerTitle(int $organizationId, int $weightDivisionId)
  {
    return Title::where('organization_id', $organizationId)
      ->where('weight_division_id', $weightDivisionId)
      ->first();
  }

  /**
   * ボクサーの保持タイトル(titlesテーブル)を保存(一括)
   * @param array $titlesArray [["boxer_id" => int, "organization_id" => int, "weight_division_id" => int], ...]
   * @return bool
   */
  public function storeTitlesHoldByTheBoxer($titlesArray)
  {
    return Title::insert($titlesArray);
  }

  /**
   * ボクサーの保持タイトル(titlesテーブル)を既存か確認しながら保存(1件)
   * @param int $boxerId
   * @param int $organizationId
   * @param int $weightDivisionId
   * @return void
   */
  public function storeTitle(int $boxerId, int $organizationId, int $weightDivisionId)
  {
    Title::firstOrCreate([
      'boxer_id' => $boxerId,
      'organization_id' => $organizationId,
      'weight_division_id' => $weightDivisionId
    ]);
  }

  /**
   * ボクサーが所持するタイトル(titlesテーブル)を全て削除
   * @param int boxerId
   * @return int
   */
  public function deleteTitlesHoldByTheBoxer($boxerId)
  {
    return Title::where('boxer_id', $boxerId)->delete();
  }

  /**
   * ボクサー保持のタイトルを1件削除
   * @param int $boxerId
   * @param int $weightDivisionId
   * @param int|null $organizationId
   * @return bool isDeleteTarget
   */
  public function deleteTitle(int $boxerId, int $weightDivisionId, int $organizationId = null): bool
  {
    $query = Title::where('boxer_id', $boxerId)
      ->where('weight_division_id', $weightDivisionId);

    if ($organizationId !== null) {
      $query->where('organization_id', $organizationId);
    }

    $deleteCount = $query->delete();

    return $deleteCount > 0;
  }
}
