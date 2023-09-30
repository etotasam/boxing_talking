<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Repository\GuestUserRepository;

class GuestUserService
{


  /**
   * @param Request request
   * @return void
   */
  public function loginGuest($request): void
  {
    if (Auth::check()) {
      throw new Exception("Guest login is not allowed as already authenticated", 400);
    }
    $guestUser = GuestUserRepository::createGuestUser();
    Auth::guard('guest')->login($guestUser);
    if (!Auth::guard('guest')->check()) {
      throw new Exception("Failed guest login", 500);
    }
    $request->session()->regenerate();
  }

  /**
   * @return void
   */
  public function logoutGuest(): void
  {
    $guestGuard = Auth::guard('guest');
    $guestUser = $guestGuard->user();
    if (!$guestUser) {
      throw new Exception('Must be guest user to guest logout', 403);
    }
    $guestUserId = $guestGuard->user()->id;
    $guestGuard->logout();
    GuestUserRepository::deleteGuestUser($guestUserId);
    if (Auth::guard('guest')->check()) {
      throw new Exception('Failed guest logout', 403);
    }
  }
}
