<?php

namespace App\Services;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Repositories\Interfaces\GuestRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;

class WinLossPredictionService
{
  protected $guest;
  protected $authService;
  protected $matchService;
  protected $matchRepository;
  protected $userRepository;
  protected $predictionRepository;
  public function __construct(
    AuthService $authService,
    MatchService $matchService,
    GuestRepositoryInterface $guest,
    MatchRepositoryInterface $matchRepository,
    UserRepositoryInterface $userRepository,
    WinLossPredictionRepositoryInterface $predictionRepository,
  ) {
    $this->authService = $authService;
    $this->matchService = $matchService;
    $this->guest = $guest;
    $this->matchRepository = $matchRepository;
    $this->userRepository = $userRepository;
    $this->predictionRepository = $predictionRepository;
  }

  /**
   * ユーザーの試合予想を登録とその試合の投票数をカウントアップ
   * @param int $matchId
   * @param string $prediction
   *
   * @return void
   */
  public function votePrediction(int $matchId, string $prediction): void
  {
    if (!$this->matchRepository->isMatch($matchId)) {
      throw new \Exception("Match is not exists", 404);
    }
    //試合日が未来のみ投票可
    if ($this->matchService->isMatchDateInPastOrToday($matchId)) {
      throw new \Exception('Cannot vote win-loss prediction after match date', 400);
    }
    $userId = $this->authService->getUserIdOrGuestUserId();
    //既に投票済みか
    $isVote = $this->predictionRepository->isVotedPredictionToMatch($userId, $matchId);
    if ($isVote) {
      throw new \Exception("Cannot win-loss prediction. You have already done.", 400);
    }

    DB::beginTransaction();
    try {
      $this->predictionRepository->storePrediction($userId, $matchId, $prediction);
    } catch (\Exception $e) {
      DB::rollBack();
      throw new \Exception($e->getMessage());
    }

    DB::commit();
  }

  /**
   * 試合の勝敗予想集計と、現在の閲覧者への公開可否を取得する
   *
   * @param int $matchId
   * @return array
   */
  public function getMatchPrediction(int $matchId): array
  {
    if (!$this->matchRepository->isMatch($matchId)) {
      throw new \Exception("Match is not exists", 404);
    }

    $isVisible = $this->matchService->isMatchDateInPastOrToday($matchId);

    if (!$isVisible && (Auth::check() || $this->guest->isGuestUser())) {
      $userId = $this->authService->getUserIdOrGuestUserId();
      $isVisible = $this->predictionRepository->isVotedPredictionToMatch($userId, $matchId);
    }

    return [
      "isVisible" => $isVisible,
      "predictions" => $isVisible
        ? $this->predictionRepository->getMatchPrediction($matchId)
        : [],
    ];
  }

  /**
   * ユーザーの試合への全予想投票を取得
   *
   * @return null|Collection
   */
  public function getPrediction(): ?Collection
  {
    $isUser = Auth::check();
    $isGuest = $this->guest->isGuestUser();
    if ($isUser) {
      return Auth::user()->prediction;
    }
    if ($isGuest) {
      return $this->guest->getGuestUser()->prediction;
    }

    return null;
  }
}
