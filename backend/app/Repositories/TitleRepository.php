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
   * ボクサーの保持するタイトルをtitlesテーブルに保存
   * @param int $boxerId,
   * @param int $organizationId,
   * @param int $weightDivisionId,
   *
   * @return bool
   */
  public function createTitlesHoldByTheBoxer($boxerId, $organizationId, $weightDivisionId)
  {
    $title = new Title;
    $title->fill([
      "boxer_id" => $boxerId,
      "organization_id" => $organizationId,
      "weight_division_id" => $weightDivisionId
    ]);
    $title->save();
    // return Title::create([
    //   "boxer_id" => $boxerId,
    //   "organization_id" => $organizationId,
    //   "weight_division_id" => $weightDivisionId
    // ]);
  }

  /**
   * ボクサーの保持タイトル(titlesテーブル)を保存(一括)
   * @param array $titlesArray [["boxer_id" => 1, "organization_id" => 1, "weight_division_id" => 1], ...]
   * @return bool
   */
  public function storeTitlesHoldByTheBoxer($titlesArray)
  {
    return Title::insert($titlesArray);
  }

  /**
   * ボクサーが所持するタイトル(titlesテーブル)を削除
   * @param int boxerId
   * @return int
   */
  public function deleteTitlesHoldByTheBoxer($boxerId)
  {
    return Title::where('boxer_id', $boxerId)->delete();
  }
}
