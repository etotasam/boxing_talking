<?php

namespace App\Repository;

use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;

class GuestUserRepository
{

  public static function create(): GuestUser
  {
    return GuestUser::create();
  }

  public static function get(string $guestId): ?GuestUser
  {
    return GuestUser::find($guestId);
  }

  public static function delete(string $guestUserId): void
  {
    GuestUser::find($guestUserId)->delete();
  }
}
