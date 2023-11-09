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
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;
use Illuminate\Database\Events\QueryExecuted;

class MatchService
{

  public function __construct(
    protected TitleMatchService $titleMatchService,
    protected MatchRepositoryInterface $matchRepository,
    protected CommentRepositoryInterface $commentRepository,
    protected TitleMatchRepositoryInterface $titleMatchRepository,
    protected WinLossPredictionRepositoryInterface $predictionRepository,
  ) {
  }

  /**
   * 試合データの保存
   * errorCode 50 titleMatchesテーブルへの登録が失敗
   * errorCode 51 matchesテーブルへの登録が失敗
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
        throw new \Exception("", 51);
      }

      $titleMatchesArray = $this->titleMatchService->formatForStoreToTitleMatchTable($createdMatch['id'], $organizationsNameArray);
      $isSuccessStoreTitleMatch = $this->titleMatchRepository->insertTitleMatch($titleMatchesArray);
      if (!$isSuccessStoreTitleMatch) {
        throw new \Exception("", 50);
      }
    } catch (QueryException $e) {
      \Log::error($e->getMessage());
      DB::rollBack();
      abort(500);
    } catch (\Exception $e) {
      DB::rollBack();
      throw $e;
    }

    DB::commit();
  }

  /**
   * 試合一覧の取得
   * errorCode 41 admin認証なし
   * @param string|null range
   * @return \Illuminate\Support\Collection $matches
   */
  public function getMatchesExecute(string|null $range)
  {
    if ($range == "all") {
      if (Auth::user()->administrator) {
        $matches = $this->matchRepository->getAllMatches();
      } else {
        throw NonAdministratorException::create();
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
    DB::beginTransaction();
    try {
      if (array_key_exists('titles', $updateMatchData)) {
        $this->titleMatchService->updateTitleMatchExecute($matchId, $updateMatchData['titles']);
        unset($updateMatchData['titles']);
      }
      if (!empty($updateMatchData)) {
        $this->matchRepository->updateMatch($matchId, $updateMatchData);
      }
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error($e->getMessage());
      abort(500);
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
  protected function extractOrganizationsArray(array $matchDataForStore): array
  {
    if (array_key_exists('titles', $matchDataForStore)) {
      $organizationsArray = $matchDataForStore['titles'];
    } else {
      \Log::error("Titles(organizations) is not exists in match data");
      throw new Exception("titles(organizations) is not exists in match data", 406);
    }
    return $organizationsArray;
  }


  /**
   * 試合データ削除の実行メソッド
   * @errorCode 44 targetの試合データがない
   * @param int $matchId
   * @return void
   */
  public function deleteMatchExecute(int $matchId): void
  {
    if (!$this->matchRepository->isMatch($matchId)) {
      throw new \Exception("", 44);
    }
    DB::beginTransaction();
    try {
      $this->titleMatchRepository->deleteTitleMatch($matchId);
      $this->commentRepository->deleteAllCommentOnMatch($matchId);
      $this->predictionRepository->deletePredictionOnMatch($matchId);
      // WinLossPredictionRepository::delete($matchId);
      $this->matchRepository->deleteMatch($matchId);
    } catch (QueryExecuted) {
      DB::rollBack();
      abort(500);
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
