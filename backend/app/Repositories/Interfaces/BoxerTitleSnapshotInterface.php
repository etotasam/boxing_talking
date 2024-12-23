<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;

interface BoxerTitleSnapshotInterface
{
  /**
   * 試合登録時の選手保有タイトルを(boxer_title_snapshotテーブル)保存(一括)
   * @param array $titlesArray [["match_id" => int, "boxer_id" => int, "organization_id" => int, "weight_division_id" => int], ...]
   * @return bool
   */
  public function storeBoxerTitleSnapshot(array $titlesArray);
}
