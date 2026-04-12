<?php

namespace App\Services;

use Exception;
use \Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;
use App\Repositories\Interfaces\GradeRepositoryInterface;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;
use App\Repositories\Interfaces\MatchBoxerSnapshotInterface;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Services\TitleMatchService;
use App\Services\MatchBoxerSnapshotService;
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;


// TODO MatchServiceを廃止しよう(refactor)
/**
 * !単一役割の原則に忠実に・・・
 * !試合結果を登録する役割をもつStoreMatchResultService
 * !試合結果に伴ってBoxerTitleSnapshotを登録、更新するBoxerTittleSnapshotServiceを作成する
 * ?serviceクラスが増える事はあまり問題にならない、それよりもモックのしやすさを考慮するべき
 * ?このままだと見ての通りMatchServiceクラスの依存注入が多すぎてテスト時にモックを作れない
 */
class MatchService
{

  public function __construct(
    protected TitleMatchService $titleMatchService,
    protected MatchBoxerSnapshotService $matchBoxerSnapshotService,
    protected MatchRepositoryInterface $matchRepository,
    protected CommentRepositoryInterface $commentRepository,
    protected TitleMatchRepositoryInterface $titleMatchRepository,
    protected WinLossPredictionRepositoryInterface $predictionRepository,
    protected GradeRepositoryInterface $gradeRepository,
    protected WeightDivisionRepositoryInterface $weightRepository,
    protected MatchBoxerSnapshotInterface $MatchBoxerSnapshotRepository,
    protected BoxerTitleSnapshotInterface $BoxerTitleSnapshotRepository,
    protected TitleRepositoryInterface $TitleRepository,
  ) {}

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
  public function storeMatch(array $requestMatchData)
  {
    DB::beginTransaction();
    try {
      [$organizationsNameArray, $formattedMatchData] = $this->formatMatchDataForStore($requestMatchData);

      $createdMatch = $this->matchRepository->createMatch($formattedMatchData);
      if (!$createdMatch) {
        throw new Exception("Can not create match", 51);
      }

      //? 試合時の選手の戦歴、保有ベルトのスナップショットをstore
      $isSuccessSnapshot = $this->matchBoxerSnapshotService->storeMatchBoxerSnapshot(["match_id" => $createdMatch['id'], "red_boxer_id" => $createdMatch['red_boxer_id'], "blue_boxer_id" => $createdMatch['blue_boxer_id']]);

      if (!$isSuccessSnapshot) {
        throw new Exception("Failed store snapshot data", 500);
      }

      $titleMatchesArray = $this->titleMatchService->formatForStoreToTitleMatchTable($createdMatch['id'], $organizationsNameArray);
      $isSuccessStoreTitleMatch = $this->titleMatchRepository->insertTitleMatch($titleMatchesArray);
      if (!$isSuccessStoreTitleMatch) {
        throw new Exception("Failed store title match", 50);
      }
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with create match or store title match data :" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage(), 500);
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception("Failed create match or store title match data :" . $e->getMessage(), 500);
    }

    DB::commit();
  }


  /**
   * @param array $matchData match data before format
   * @return array [$organizationsNameArray, $formattedMatchArray] organizationsName array & formatted match data for store
   */
  private function formatMatchDataForStore(array $matchData): array
  {

    $organizationsNameArray = $this->extractOrganizationsArray($matchData);



    $grade = $matchData['grade'];
    $gradeId = $this->gradeRepository->getGradeId($grade);
    $weight = $matchData['weight'];
    $weightId = $this->weightRepository->getWeightId($weight);

    unset($matchData['weight'], $matchData['grade'], $matchData['titles']);

    $formattedMatchData = array_merge($matchData, ["grade_id" => $gradeId], ["weight_id" => $weightId]);

    return [$organizationsNameArray, $formattedMatchData];
  }

  /**
   * 試合一覧の取得
   * errorCode 41 admin認証なし
   * @param string|null range
   * @return Collection $matches
   */
  public function getMatchesExecute(string|null $range)
  {

    if ($range == "all") {
      /** @var \App\Models\User $user */
      $user = Auth::user();
      if ($user->isAdmin()) {
        $matches = $this->matchRepository->getAllMatches();
      } else {
        throw NonAdministratorException::create();
      }
    } else if ($range == "past") {
      $matches = $this->matchRepository->getPastMatches();
    } else {
      $matches = $this->matchRepository->getMatches();
    }

    $matchesSnapshot = $this->getMatchDataSnapshot($matches);

    return $matchesSnapshot;
  }


  /**
   * ?試合のスナップショットの取得
   * @param Collection $matches
   */
  public function getMatchDataSnapshot($matches)
  {

    $matchesSnapshot = $matches->map(function ($match) {
      //? 戦績のスナップショット
      $recordSnapshot = $this->MatchBoxerSnapshotRepository->getMatchBoxerSnapshot($match->id);
      $match->boxerRecordSnapshot = $recordSnapshot;

      //? タイトルのスナップショット
      $titleSnapshot = $this->BoxerTitleSnapshotRepository->getTitleSnapshot($match->id);
      $match->titleSnapshot = $titleSnapshot;

      return $match;
    });


    return $matchesSnapshot;
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

      $formattedUpdateData = $this->formatMatchDataForUpdate($updateMatchData);

      if (!empty($formattedUpdateData)) {
        $this->matchRepository->updateMatch($matchId, $formattedUpdateData);
      }
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with update match :" .  $e->getMessage());
      throw new Exception("Unexpected error on database :" .  $e->getMessage());
    } catch (Exception $e) {
      throw new Exception("Failed update match");
    }

    DB::commit();
  }

  /**
   * @param array $matchData only MatchData for update
   * @return array formatted update data
   */
  private function formatMatchDataForUpdate(array $matchData): array
  {
    if (array_key_exists('grade', $matchData)) {
      $gradeId = $this->gradeRepository->getGradeId($matchData["grade"]);
      unset($matchData["grade"]);
      $matchData["grade_id"] = $gradeId;
    }

    if (array_key_exists('weight', $matchData)) {
      $weightId = $this->weightRepository->getWeightId($matchData["weight"]);
      unset($matchData["weight"]);
      $matchData["weight_id"] = $weightId;
    }

    return $matchData;
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
      throw new Exception("Can not found match to delete", 44);
    }
    DB::beginTransaction();
    try {
      $this->titleMatchRepository->deleteTitleMatch($matchId);
      $this->commentRepository->deleteAllCommentOnMatch($matchId);
      $this->predictionRepository->deletePredictionOnMatch($matchId);
      // WinLossPredictionRepository::delete($matchId);
      $this->matchRepository->deleteMatch($matchId);
    } catch (QueryException $e) {
      DB::rollBack();
      \Log::error("database error with delete match : " . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage());
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception("Failed delete match :" . $e->getMessage());
    }

    DB::commit();
  }

  public function isMatchDateInPastOrToday(int $matchId): bool
  {
    $match = $this->matchRepository->getMatchById($matchId);
    $matchDate = strtotime($match['match_date']);
    $nowDate = strtotime('now');

    return $nowDate > $matchDate;
  }

  // public function matchPredictionCountUpdate(int $matchId, string $prediction): void
  // {
  //   $match = $this->matchRepository->getMatchById($matchId);
  //   if (!$match) {
  //     throw new Exception("Match not found", 404);
  //   }
  //   if ($prediction == "red") {
  //     $match->increment("count_red");
  //   } else if ($prediction == "blue") {
  //     $match->increment("count_blue");
  //   }
  //   $match->save();
  // }
}
