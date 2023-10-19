<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;

interface TitleRepositoryInterface
{

  /**
   * ボクサーが保持するタイトルを取得
   * @param int $boxerId
   * @return Collection
   */
  public function getTitlesHoldByTheBoxer($boxerId);

  /**
   * ボクサーの保持するタイトルをtitlesテーブルに保存
   * @param int $boxerId,
   * @param int $organizationId,
   * @param int $weightDivisionId,
   *
   * @return Title
   */
  public function createTitlesHoldByTheBoxer($boxerId, $organizationId, $weightDivisionId);

  /**
   * ボクサーの保持タイトル(titlesテーブル)を保存(一括)
   * @param array $titlesArray [["boxer_id" => 1, "organization_id" => 1, "weight_division_id" => 1], ...]
   * @return bool
   */
  public function storeTitlesHoldByTheBoxer($titlesArray);

  /**
   * ボクサーが所持するタイトル(titlesテーブル)を削除
   * @param int boxerId
   * @return int
   */
  public function deleteTitlesHoldByTheBoxer($boxerId);
}
