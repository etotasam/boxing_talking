<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use App\Models\WinLossPrediction;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;

class WinLossPredictionRepository implements WinLossPredictionRepositoryInterface
{

  public function getPredictionByUser()
  {
    $isUser = Auth::check();
    if ($isUser) {
      return Auth::user()->prediction;
    }
    $isGuest = Auth::guard('guest')->check();
    if ($isGuest) {
      return Auth::guard('guest')->user()->prediction;
    }
    return null;
  }

  public function deletePredictionOnMatch($matchId)
  {
    WinLossPrediction::where("match_id", $matchId)->delete();
  }

  public function getMatchPrediction($matchId)
  {
    $voteCounts = WinLossPrediction::where('match_id', $matchId)
      ->select('prediction', \DB::raw('COUNT(*) as count'))
      ->groupBy('prediction')
      ->pluck('count', 'prediction')
      ->toArray();

    return $voteCounts;
  }

  public function storePrediction(string $userId, int $matchId, string $prediction)
  {

    $predictionInstance = new WinLossPrediction;
    $predictionInstance->fill([
      "user_id" => $userId,
      "match_id" => $matchId,
      "prediction" => $prediction
    ]);
    return $predictionInstance->save();
  }

  public function isVotedPredictionToMatch(string $userId, int $matchId)
  {
    return WinLossPrediction::where([["user_id", $userId], ["match_id", $matchId]])->exists();
    // return WinLossPrediction::where([["user_id", $userId], ["match_id", $matchId]])->first();
  }
}
