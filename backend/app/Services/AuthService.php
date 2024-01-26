<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use App\Models\Administrator;
use App\Repositories\Interfaces\GuestRepositoryInterface;


class AuthService
{
  protected $guest;
  public function __construct(Administrator $admin, GuestRepositoryInterface $guest)
  {
    $this->admin = $admin;
    $this->guest = $guest;
  }

  public function requireAdminRole(): void
  {
    if (Auth::check()) {
    } else {
      throw new Exception("No auth", 401);
    }
    $isAdmin = $this->admin->where("user_id", Auth::id())->exists();
    if (!$isAdmin) {
      throw new Exception("No admin", 401);
    }
  }

  /**
   * @return string (uuid) userId
   */
  public function getUserIdOrGuestUserId(): string
  {
    if (Auth::check()) {
      $userId = Auth::id();
    } else if ($this->guest->isGuestUser()) {
      $userId = (string)$this->guest->getGuestUser()->id;
    } else {
      throw new Exception("Can not post with no auth", 41);
    }

    return $userId;
  }
}
