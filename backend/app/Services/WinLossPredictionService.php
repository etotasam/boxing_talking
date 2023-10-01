<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;
use App\Models\WinLossPrediction;
use App\Repository\UserRepository;
use App\Repository\GuestUserRepository;

class WinLossPredictionService
{
  public function __construct()
  {
  }

  /**
   * @return ?Collection
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
