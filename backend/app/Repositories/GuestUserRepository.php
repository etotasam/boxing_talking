<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;
use App\Repositories\Interfaces\GuestRepositoryInterface;
// use Carbon\Carbon;

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

  public function getCountCreatedGuestToday()
  {
    return GuestUser::whereDate('created_at', today())->withTrashed()->count();
  }

  // public function deleteLogoutGuestUser()
  // {
  //   $yesterday = Carbon::yesterday()->endOfDay();

  //   $deleteTargetCount =  GuestUser::onlyTrashed()->whereDate('deleted_at', '<', $yesterday)->count();
  //   if ($deleteTargetCount) {
  //     GuestUser::onlyTrashed()->whereDate('deleted_at', '<', $yesterday)->forceDelete();
  //     return $deleteTargetCount . "件削除しました";
  //   } else {
  //     return "削除対象がありませんでした";
  //   }
  // }
}
