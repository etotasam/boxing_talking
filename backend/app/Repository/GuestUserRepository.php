<?php

namespace App\Repository;

use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;

class GuestUserRepository
{


  /**
   * @return GuestUser
   */
  public static function create(): GuestUser
  {
    return GuestUser::create();
  }

  /**
   * @param int guestId
   * @return GuestUser
   */
  public static function get($guestId): GuestUser
  {
    return GuestUser::find($guestId);
  }

  /**
   * @param int guestUserId
   * @return void
   */
  public static function delete($guestUserId): void
  {
    GuestUser::find($guestUserId)->delete();
  }
}
