<?php

namespace App\Repository;

use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;

class GuestUserRepository
{


  /**
   * @return GuestUser
   */
  public static function createGuestUser(): GuestUser
  {
    return GuestUser::create();
  }

  /**
   * @param int guestUserId
   * @return void
   */
  public static function deleteGuestUser($guestUserId): void
  {
    GuestUser::find($guestUserId)->delete();
  }
}
