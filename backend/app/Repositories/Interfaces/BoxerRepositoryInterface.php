<?php

namespace App\Repositories\Interfaces;

use App\Models\Boxer;

interface BoxerRepositoryInterface
{
  /**
   * @param array $searchWordArray [
   *     'name'    => string|null,   // ボクサーの名前
   *     'eng_name' => string|null,  // ボクサーの英語名
   *     'country'  => string|null   // ボクサーの国籍
   * ]
   * @param null|int $page
   * @param null|int $limit
   *
   * @return array [Illuminate\Support\Collection $boxers, int $boxersCount]
   */
  public function getBoxers(array $searchWordArray, ?int $page, ?int $limit);

  /**
   * 選手データをidで取得
   * @param int $boxerId
   * @return Boxer
   */
  public function getBoxerById(int $boxerId);

  /**
   * 選手データが存在するか
   * @param int $boxerId
   * @return bool
   */
  public function isBoxerById(int $boxerId);

  /**
   * 保持タイトルと一緒に選手データを取得
   * @param int $boxerId
   * @return Boxer with titles => [["organization" => Model Organization, "weightDivision" => Model WeightDivision]]
   */
  public function getBoxerWithTitlesById(int $boxerId);

  /**
   * 選手の作成
   * @param array $boxerData
   * @return Boxer
   */
  public function createBoxer(array $boxerData);

  /**
   * 選手の単体の削除
   * @param int $boxerId
   * @return bool
   */
  public function deleteBoxer(int $boxerId);

  /**
   * @param array $updateBoxerData idと更新対象のデータの入った連想配列
   * @return  bool
   */
  public function updateBoxer(array $updateBoxerData);
}
