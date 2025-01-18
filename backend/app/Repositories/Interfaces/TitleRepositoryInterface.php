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
   * ボクサーの保持タイトル(titlesテーブル)を既存か確認しながら保存(1件)
   * @param int $boxerId
   * @param int $organizationId
   * @param int $weightDivisionId
   * @return void
   */
  public function storeTitle(int $boxerId, int $organizationId, int $weightDivisionId);

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
   * @param array $titlesArray [["boxer_id" => int, "organization_id" => int, "weight_division_id" => int], ...]
   * @return bool
   */
  public function storeTitlesHoldByTheBoxer($titlesArray);

  /**
   * ボクサーが所持するタイトルを全て削除(titlesテーブル)
   * @param int boxerId
   * @return int
   */
  public function deleteTitlesHoldByTheBoxer($boxerId);

  /**
   * ボクサー保持のタイトルを指定して削除(titlesテーブル)
   * @param int $boxerId
   * @param int $weightDivisionId
   * @param int|null $organizationId
   * @return bool isDeleteTarget
   */
  public function deleteTitle(int $boxerId, int $weightDivisionId, int $organizationId = null);
}
