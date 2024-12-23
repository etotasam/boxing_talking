<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;
use Illuminate\Database\Events\QueryExecuted;

use function Psy\debug;

class MatchDataSnapshotService
{

  public function __construct(
    protected BoxerRepositoryInterface $boxerRepository,
  ) {}


  /**
   * 試合時の選手のデータをスナップショットとして登録
   * @param array $arrayData => ["match_id" => int, "red_boxer_id" => int, "blue_boxer_id" => int]
   * @return string
   */
  public function storeBoxerDataSnapshot(array $arrayData)
  {
    $redId = $arrayData['red_boxer_id'];
    $blueId = $arrayData['blue_boxer_id'];
    $redBoxer = $this->boxerRepository->getBoxerById($redId);
    $blueBoxer = $this->boxerRepository->getBoxerById($blueId);

    $requireData = ["style", "ko", "win", "draw", "lose"];

    $redBoxerSnapshot = array_intersect_key($redBoxer->toArray(), array_flip($requireData));
    $blueBoxerSnapshot = array_intersect_key($blueBoxer->toArray(), array_flip($requireData));

    $registerSnapshot = [
      "match_id" => $arrayData["match_id"],
      "red_boxer_id" => $redId,
      "red_style" => $redBoxerSnapshot["style"],
      "red_ko" => $redBoxerSnapshot["ko"],
      "red_win" => $redBoxerSnapshot["win"],
      "red_draw" => $redBoxerSnapshot["draw"],
      "red_lose" => $redBoxerSnapshot["lose"],
      "blue_boxer_id" => $blueId,
      "blue_style" => $blueBoxerSnapshot["style"],
      "blue_ko" => $blueBoxerSnapshot["ko"],
      "blue_win" => $blueBoxerSnapshot["win"],
      "blue_draw" => $blueBoxerSnapshot["draw"],
      "blue_lose" => $blueBoxerSnapshot["lose"],
    ];

    \Log::debug('test データ:' . print_r($registerSnapshot, true));

    return "登録中";
  }
}
