<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\Interfaces\MatchDataSnapshotInterface;
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;
use Illuminate\Database\Events\QueryExecuted;

use function Psy\debug;

class MatchDataSnapshotService
{

  public function __construct(
    protected BoxerRepositoryInterface $boxerRepository,
    protected BoxerTitleSnapshotInterface $BoxerTitleSnapshotRepository,
    protected TitleRepositoryInterface $titleRepository,
    protected MatchDataSnapshotInterface $MatchDataSnapshotRepository,
  ) {}


  /**
   * 試合時の選手のデータをスナップショットとして登録
   * @param array $arrayData => ["match_id" => int, "red_boxer_id" => int, "blue_boxer_id" => int]
   * @return boolean
   */
  public function storeBoxerDataSnapshot(array $arrayData)
  {
    $matchId = $arrayData['match_id'];
    $redId = $arrayData['red_boxer_id'];
    $blueId = $arrayData['blue_boxer_id'];
    $redBoxer = $this->boxerRepository->getBoxerById($redId);
    $blueBoxer = $this->boxerRepository->getBoxerById($blueId);

    $requireData = ["style", "ko", "win", "draw", "lose"];
    //? 選手の戦績を取得
    $redBoxerSnapshot = array_intersect_key($redBoxer->toArray(), array_flip($requireData));
    $blueBoxerSnapshot = array_intersect_key($blueBoxer->toArray(), array_flip($requireData));

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

    $matchDataForSnapshot = [
      "match_id" => $arrayData["match_id"],
      "red_boxer_id" => $redId,
      "red_boxer_style" => $redBoxerSnapshot["style"],
      "red_boxer_ko" => $redBoxerSnapshot["ko"],
      "red_boxer_win" => $redBoxerSnapshot["win"],
      "red_boxer_draw" => $redBoxerSnapshot["draw"],
      "red_boxer_lose" => $redBoxerSnapshot["lose"],
      "blue_boxer_id" => $blueId,
      "blue_boxer_style" => $blueBoxerSnapshot["style"],
      "blue_boxer_ko" => $blueBoxerSnapshot["ko"],
      "blue_boxer_win" => $blueBoxerSnapshot["win"],
      "blue_boxer_draw" => $blueBoxerSnapshot["draw"],
      "blue_boxer_lose" => $blueBoxerSnapshot["lose"],
    ];

    //? 試合時戦歴等を保存
    $createdMatchDataSnapshot = $this->MatchDataSnapshotRepository->createMatchSnapshot($matchDataForSnapshot);
    // \Log::debug('test データ:' . print_r($createdMatchDataSnapshot, true));

    // ? 試合時の選手の保持タイトルをsnapshotのテーブルに保存
    $isStoredBoxerTitleSnapshot = $this->BoxerTitleSnapshotRepository->storeBoxerTitleSnapshot($boxersTitleArrayForSnapshot);

    $isSuccess = $createdMatchDataSnapshot !== false && $isStoredBoxerTitleSnapshot;

    return $isSuccess;
  }
}
