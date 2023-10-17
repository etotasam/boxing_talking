<?php

namespace App\Repositories;

use App\Models\PreUser;

class PreUserRepository
{


  /**
   * @param array preUserData
   * @return PreUser
   */
  public static function create($preUserData): PreUser
  {
    return PreUser::create($preUserData);
  }

  /**
   * @param int preUserId
   * @return PreUser
   */
  public static function get($preUserId): ?PreUser
  {
    return PreUser::find($preUserId);
  }
}
