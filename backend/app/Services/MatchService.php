<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;
use App\Repositories\WinLossPredictionRepository;
use App\Services\TitleMatchService;

class MatchService
{

  protected $auth;
  protected $titleMatchService;
  protected $matchRepository;
  protected $commentRepository;
  protected $titleMatchRepository;
  protected $predictionRepository;
  public function __construct(
    TitleMatchService $titleMatchService,
    MatchRepositoryInterface $matchRepository,
    CommentRepositoryInterface $commentRepository,
    TitleMatchRepositoryInterface $titleMatchRepository,
    WinLossPredictionRepositoryInterface $predictionRepository,
  ) {
    $this->titleMatchService = $titleMatchService;
    $this->matchRepository = $matchRepository;
    $this->commentRepository = $commentRepository;
    $this->titleMatchRepository = $titleMatchRepository;
    $this->predictionRepository = $predictionRepository;
  }

  /**
   * 試合データの保存
   *
   * @param array $matchDataForStore
   *  [
   *    'match_date' => '2023-10-18',
   *    'red_boxer_id' => 45,
   *    'blue_boxer_id' => 43,
   *    'grade' => 'タイトルマッチ',
   *    'country' => 'Mexico',
   *    'venue' => '会場',
   *    'weight' => 'クルーザー',
   *    'titles' => [
   *        0 => 'WBC暫定',
   *        1 => 'WBO暫定',
   *     ],
   *  ]
   *
   * @return void
   */
  public function storeMatch(array $matchDataForStore)
  {
    $organizationsNameArray = $this->extractOrganizationsArray($matchDataForStore);
    unset($matchDataForStore['titles']);

    DB::beginTransaction();
    try {
      $createdMatch = $this->matchRepository->createMatch($matchDataForStore);
      if (!$createdMatch) {
        throw new \Exception("Failed create match");
      }

      $titleMatchesArray = $this->titleMatchService->formatForStoreToTitleMatchTable($createdMatch['id'], $organizationsNameArray);
      $isSuccessStoreTitleMatch = $this->titleMatchRepository->insertTitleMatch($titleMatchesArray);
      if (!$isSuccessStoreTitleMatch) {
        throw new \Exception("Failed store to title_matches");
      }
    } catch (Exception $e) {
      DB::rollBack();
      throw new \Exception($e->getMessage() ?? "Failed store match");
    }

    DB::commit();
  }

  /**
   * 試合一覧の取得
   *
   * @param string|null range
   *
   * @return \Illuminate\Support\Collection $matches
   */
  public function getMatchesExecute(string|null $range)
  {
    if ($range == "all") {
      if (Auth::user()->administrator) {
        $matches = $this->matchRepository->getAllMatches();
      } else {
        throw new Exception("Cannot get all matches without auth administrator", 401);
      }
    } else if ($range == "past") {
      $matches = $this->matchRepository->getPastMatches();
    } else {
      $matches = $this->matchRepository->getMatches();
    }

    return $matches;
  }

  /**
   * 試合データの更新
   *
   * @param array $updateMatchData 更新データだけが連想配列で送られる 例)['name' => '変更名', 'titles' => ['WBA', 'WBC']]
   *
   * @return void
   */
  public function updateMatch(int $matchId, array $updateMatchData)
  {
    // $match = MatchRepository::get($matchId);
    $match = $this->matchRepository->getMatchById($matchId);
    if (!$match) {
      throw new Exception("Match is not exists", 404);
    }
    DB::beginTransaction();
    try {
      if (array_key_exists('titles', $updateMatchData)) {
        $this->titleMatchService->updateTitleMatchExecute($matchId, $updateMatchData['titles']);
        unset($updateMatchData['titles']);
      }
      if (!empty($updateMatchData)) {
        $isUpdateSuccess = $this->matchRepository->updateMatch($matchId, $updateMatchData);
        if (!$isUpdateSuccess) {
          throw new \Exception();
        }
      }
    } catch (Exception $e) {
      DB::rollBack();
      throw new \Exception("Failed update match");
    }

    DB::commit();
  }

  /**
   * @param array $matchDataForStore
   *  [
   *    'match_date' => '2023-10-18',
   *    'red_boxer_id' => 45,
   *    'blue_boxer_id' => 43,
   *    'grade' => 'タイトルマッチ',
   *    'country' => 'Mexico',
   *    'venue' => '会場',
   *    'weight' => 'クルーザー',
   *    'titles' => [
   *        0 => 'WBC暫定',
   *        1 => 'WBO暫定',
   *     ],
   *  ]
   *
   * @return  array organizationsNameArray
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
    if (!$this->matchRepository->isMatch($matchId)) {
      throw new \Exception("Not exit the match", 404);
    }
    DB::beginTransaction();
    try {
      $this->titleMatchRepository->deleteTitleMatch($matchId);
      $this->commentRepository->deleteAllCommentOnMatch($matchId);
      $this->predictionRepository->deletePredictionOnMatch($matchId);
      // WinLossPredictionRepository::delete($matchId);
      $isMatchDeleted = $this->matchRepository->deleteMatch($matchId);
      if (!$isMatchDeleted) {
        throw new \Exception();
      }
    } catch (\Exception $e) {
      DB::rollBack();
      throw new \Exception("Failed when delete match");
    }

    DB::commit();
  }

  public function isMatchDateTodayOrPast(int $matchId): bool
  {
    $match = $this->matchRepository->getMatchById($matchId);
    $matchDate = strtotime($match['match_date']);
    $nowDate = strtotime('now');

    return ($nowDate > $matchDate);
  }

  public function matchPredictionCountUpdate(int $matchId, string $prediction): void
  {
    $match = $this->matchRepository->getMatchById($matchId);
    if ($prediction == "red") {
      $match->increment("count_red");
    } else if ($prediction == "blue") {
      $match->increment("count_blue");
    }
    $match->save();
  }
}
