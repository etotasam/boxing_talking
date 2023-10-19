<?php

namespace App\Repositories\Interfaces;

use App\Models\GuestUser;

interface GuestRepositoryInterface
{
  //!-----Guest

  /**
   * Auth::guard('guest')
   * @return GuestUser
   */
  public function getGuestUser();

  /**
   * Auth::guard('guest')->check()
   * @return bool
   */
  public function isGuestUser();

  /**
   * ゲストログイン
   * @param GuestUser $guestUser
   * @return bool
   */
  public function loginGuestUser($guestUser);

  /**
   * ゲストログアウト
   * @return bool
   */
  public function logoutGuestUser();

  /**
   * ゲストユーザーの作成
   * @return GuestUser
   */
  public function createGuestUser();

  /**
   * ゲストユーザーの作成
   * @param string $guestUserId uuid
   * @return int|null
   */
  public function deleteGuestUser($guestUserId);
}
