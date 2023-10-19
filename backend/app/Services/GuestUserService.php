<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class GuestUserService
{

  protected $guest;
  public function __construct(GuestRepositoryInterface $guest)
  {
    $this->guest = $guest;
  }

  /**
   * @param Request request
   * @return void
   */
  public function loginGuest($request): void
  {
    if (Auth::check()) {
      throw new Exception("Guest login is not allowed as already authenticated", 400);
    }
    DB::beginTransaction();
    try {
      $guestUser = $this->guest->createGuestUser();
      $this->guest->loginGuestUser($guestUser);
      if (!$this->guest->isGuestUser()) {
        throw new Exception();
      }
      $request->session()->regenerate();
      DB::commit();
    } catch (\Exception $e) {
      DB::rollback();
      throw new \Exception("Failed guest login", 500);
    }
  }


  public function logoutGuest(): void
  {
    if (!$this->guest->isGuestUser()) {
      throw new Exception('Must be guest user to guest logout', 403);
    }
    $guestUserId = $this->guest->getGuestUser()->id;
    $this->guest->logoutGuestUser();
    $this->guest->deleteGuestUser($guestUserId);
    if ($this->guest->isGuestUser()) {
      throw new Exception('Failed guest logout', 403);
    }
  }
}
