<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\BoxingMatch;
use App\Repository\MatchRepository;
use App\Repository\OrganizationRepository;
use App\Repository\CommentRepository;
use App\Repository\TitleMatchRepository;
use App\Repository\WinLossPredictionRepository;
use App\Services\BoxerService;
use App\Services\TitleMatchService;

class MatchService
{

  public function __construct(
    BoxerService $boxerService,
    TitleMatchService $titleMatchService
  ) {
    $this->boxerService = $boxerService;
    $this->titleMatchService = $titleMatchService;
  }

  /**
   * 試合データの保存
   *
   * @param array $matchDataForStore
   *
   * @return JsonResponse
   */
  public function storeMatch(array $matchDataForStore): JsonResponse
  {
    $organizationsArray = $this->extractOrganizationsArray($matchDataForStore);
    unset($matchDataForStore['titles']);

    DB::beginTransaction();
    try {
      $this->storeMatchExecute($organizationsArray, $matchDataForStore);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(["success" => false, "message" => "Failed store match", 500]);
    }

    DB::commit();
    return response()->json(["success" => true, "message" => "Success store match", 200]);
  }

  /**
   * 試合一覧の取得
   *
   * @param string|null range
   *
   * @return \Illuminate\Support\Collection $matches
   */
  public static function getMatches(string|null $range)
  {
    if ($range == "all") {
      $user = Auth::user();
      if ($user->administrator) {
        $matches = BoxingMatch::orderBy('match_date')->get();
      } else {
        throw new Exception("Cannot get all matches without auth administrator", 401);
      }
    } else if ($range == "past") {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
    } else {
      $fetchRange = date('Y-m-d', strtotime('-1 week'));
      $matches = BoxingMatch::where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
    }

    return $matches;
  }

  /**
   * 試合データの削除
   *
   * @param int $matchId
   *
   * @return JsonResponse
   */
  public function deleteMatch(int $matchId): JsonResponse
  {
    try {
      DB::transaction(function () use ($matchId) {
        $this->deleteMatchExecute($matchId);
      });
    } catch (Exception $e) {
      return response()->json(["message" => $e->getMessage() ?: "Failed while match delete"], $e->getCode() ?: 500);
    }

    return response()->json(["message" => "Success match delete"], 200);
  }

  /**
   * 試合データの更新
   *
   * @param array $updateMatchData 更新データだけが連想配列で送られる 例)['name' => '変更名', 'titles' => ['WBA', 'WBC']]
   *
   * @return JsonResponse
   */
  public function updateMatch(int $matchId, array $updateMatchData)
  {
    try {
      $match = $this->getSingleMatch($matchId);
      DB::beginTransaction();
      if (isset($updateMatchData['titles'])) {
        $this->titleMatchService->updateExecute($matchId, $updateMatchData['titles']);
        unset($updateMatchData['titles']);
      }
      if (!empty($updateMatchData)) {
        $match->update($updateMatchData);
      }
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(["success" => false, "message" => $e->getMessage() ?: "Failed update match"], $e->getCode() ?: 500);
    }

    DB::commit();
    return response()->json(["success" => true, "message" => "Success update match data"], 200);
  }


  /**
   * 試合データと試合がタイトルマッチの場合はそのタイトルの保存の実行
   *
   * @param array $organizationsArray
   * @param array $matchData
   *
   * @return void
   */
  public function storeMatchExecute(array $organizationsArray, array $matchData): void
  {
    $createdMatch = MatchRepository::create($matchData);
    if (!empty($organizationsArray)) {
      foreach ($organizationsArray as $organizationName) {
        $organization = OrganizationRepository::get($organizationName);
        // if (!$organization) {
        //   throw new Exception("Not get organization name", 405);
        // }
        TitleMatchRepository::store($createdMatch['id'], $organization['id']);
      }
    }
  }

  /**
   * 試合データを1つ取得
   *
   * @param int $matchId
   *
   * @return BoxingMatch
   */
  public function getSingleMatch(int $matchId)
  {
    $match = MatchRepository::get($matchId);
    if (!$match) {
      throw new Exception("Match is not exists", 404);
    }
    return $match;
  }


  /**
   * @return  array organizationsArray
   */
  public function extractOrganizationsArray(array $matchDataForStore): array
  {
    if (array_key_exists('titles', $matchDataForStore)) {
      $organizationsArray = $matchDataForStore['titles'];
    } else {
      throw new Exception("titles(organizations) is not exists in match data", 406);
    }
    return $organizationsArray;
  }


  /**
   * 試合データ削除の実行メソッド
   *
   * @param int $matchId
   *
   * @return void
   */
  public function deleteMatchExecute(int $matchId): void
  {
    $match = MatchRepository::get($matchId);
    if (is_null($match)) {
      throw new Exception("Not exit the match", 403);
    }
    TitleMatchRepository::delete($matchId);
    CommentRepository::delete($matchId);
    WinLossPredictionRepository::delete($matchId);
    $match->delete();
  }

  public function isMatchDateTodayOrPast(int $matchId): bool
  {
    $data = MatchRepository::getMatchDate($matchId);
    $matchDate = strtotime($data['match_date']);
    $nowDate = strtotime('now');

    return ($nowDate > $matchDate);
  }

  public function matchPredictionCountUpdate(int $matchId, string $prediction): void
  {
    $match = MatchRepository::get($matchId);
    if ($prediction == "red") {
      $match->increment("count_red");
    } else if ($prediction == "blue") {
      $match->increment("count_blue");
    }
    $match->save();
  }
}
