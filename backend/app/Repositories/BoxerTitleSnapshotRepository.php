<?php

namespace App\Repositories;

use App\Models\BoxerTitleSnapshot;
use Illuminate\Support\Collection;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;

class BoxerTitleSnapshotRepository implements BoxerTitleSnapshotInterface
{

  /**
   * 試合登録時の選手保有タイトルを(boxer_title_snapshotテーブル)保存(一括)
   * @param array $titlesArray [["match_id" => int, "boxer_id" => int, "organization_id" => int, "weight_division_id" => int], ...]
   * @return bool
   */
  public function storeBoxerTitleSnapshot(array $titlesArray)
  {
    return BoxerTitleSnapshot::insert($titlesArray);
  }
}
