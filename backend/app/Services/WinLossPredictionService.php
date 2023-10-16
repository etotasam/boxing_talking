<?php

namespace App\Services;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Repository\UserRepository;
use App\Repository\MatchRepository;
use App\Repository\GuestUserRepository;
use App\Repository\WinLossPredictionRepository;

class WinLossPredictionService
{
  public function __construct(AuthService $authService, MatchService $matchService)
  {
    $this->authService = $authService;
    $this->matchService = $matchService;
  }

  public function votePrediction(int $matchId, string $prediction): JsonResponse
  {
    try {
      $userId = $this->authService->getUserIdOrGuestUserId();
      if (!MatchRepository::isMatchExists($matchId)) {
        throw new Exception("Match is not exists", 404);
      }
      //試合日が未来のみ投票可
      if ($this->matchService->isMatchDateTodayOrPast($matchId)) {
        throw new Exception('Cannot vote win-loss prediction after match date', 400);
      }
      //既に投票済みか
      $isVote = WinLossPredictionRepository::isVoteMatchPrediction($userId, $matchId);
      if ($isVote) {
        throw new Exception("Cannot win-loss prediction. You have already done.", 400);
      }

      DB::transaction(function () use ($userId, $matchId, $prediction) {
        WinLossPredictionRepository::store($userId, $matchId, $prediction);
        $this->matchService->matchPredictionCountUpdate($matchId, $prediction);
      });
      return response()->json(["message" => "Success vote win-loss prediction"], 200);
    } catch (Exception $e) {
      return response()->json(["message" => $e->getMessage() ?: "Failed vote win-loss prediction"], $e->getCode() ?: 500);
    }
  }

  /**
   * ユーザーの試合への全予想投票を取得
   *
   * @return null|Collection
   */
  public function getPrediction(): ?Collection
  {
    $isUser = Auth::check();
    $isGuest = Auth::guard('guest')->check();
    if (!$isUser && !$isGuest) {
      return null;
    }
    if ($isUser) {
      $userID = Auth::user()->id;
      $prediction = UserRepository::get($userID)->prediction;
    } else {
      $guest = Auth::guard('guest')->user();
      $guestID = $guest->id;
      $prediction = GuestUserRepository::get($guestID)->prediction;
    }
    return $prediction;
  }
}
