<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class GuestUserRepository implements GuestRepositoryInterface
{

  public function getGuestUser()
  {
    return Auth::guard('guest')->user();
  }

  public function isGuestUser()
  {
    return Auth::guard('guest')->check();
  }

  public function loginGuestUser($guestUser)
  {
    return Auth::guard('guest')->login($guestUser);
  }

  public function logoutGuestUser()
  {
    return Auth::guard('guest')->logout();
  }

  public function createGuestUser()
  {
    return GuestUser::create();
  }

  public function deleteGuestUser($guestUserId)
  {
    return GuestUser::destroy($guestUserId);
  }
}
