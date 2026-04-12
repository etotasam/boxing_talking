<?php

namespace App\Services;

use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\Interfaces\MatchBoxerSnapshotInterface;

class MatchBoxerSnapshotService
{

  public function __construct(
    protected BoxerRepositoryInterface $boxerRepository,
    protected BoxerTitleSnapshotInterface $BoxerTitleSnapshotRepository,
    protected TitleRepositoryInterface $titleRepository,
    protected MatchBoxerSnapshotInterface $MatchBoxerSnapshotRepository,
  ) {}


  /**
   * 試合時の選手のデータをスナップショットとして登録
   * @param array $arrayData => ["match_id" => int, "red_boxer_id" => int, "blue_boxer_id" => int]
   * @return boolean
   */
  public function storeMatchBoxerSnapshot(array $arrayData)
  {
    $matchId = $arrayData['match_id'];
    $redId = $arrayData['red_boxer_id'];
    $blueId = $arrayData['blue_boxer_id'];
    $redBoxer = $this->boxerRepository->getBoxerById($redId);
    $blueBoxer = $this->boxerRepository->getBoxerById($blueId);

    //? 選手の保有タイトルの取得
    $redBoxerTitle = $this->titleRepository->getTitlesHoldByTheBoxer($redId);
    $blueBoxerTitle = $this->titleRepository->getTitlesHoldByTheBoxer($blueId);

    //? red,blueそれぞれの保持タイトルを一つの多重配列にまとめる
    $boxersTitleArray = array_merge($redBoxerTitle->toArray(), $blueBoxerTitle->toArray());

    //? 各データにmatch_idを追加する
    $boxersTitleArrayForSnapshot = array_map(function ($array) use ($matchId) {
      $array["match_id"] = $matchId;
      return $array;
    }, $boxersTitleArray);

    $matchBoxerDataForSnapshot = [];

    $boxerSnapshots = [
      $redId => $redBoxer->toArray(),
      $blueId => $blueBoxer->toArray(),
    ];

    $requireData = ["style", "ko", "win", "draw", "lose"];
    //? 選手の戦績の抽出とフォーマット
    foreach ($boxerSnapshots as $boxerId => $boxerSnapshot) {
      $snapshot = array_intersect_key($boxerSnapshot, array_flip($requireData));
      $matchBoxerDataForSnapshot[] = [
        "match_id" => $arrayData["match_id"],
        "boxer_id" => $boxerId,
        "style" => $snapshot["style"],
        "ko" => $snapshot["ko"],
        "win" => $snapshot["win"],
        "draw" => $snapshot["draw"],
        "lose" => $snapshot["lose"],
      ];
    }

    //? 試合時戦歴等を保存
    $createdMatchDataSnapshot = $this->MatchBoxerSnapshotRepository->createMatchBoxerSnapshot($matchBoxerDataForSnapshot);

    // ? 試合時の選手の保持タイトルをsnapshotのテーブルに保存
    $isStoredBoxerTitleSnapshot = $this->BoxerTitleSnapshotRepository->storeBoxerTitleSnapshot($boxersTitleArrayForSnapshot);

    $isSuccess = $createdMatchDataSnapshot !== false && $isStoredBoxerTitleSnapshot;

    return $isSuccess;
  }
}
