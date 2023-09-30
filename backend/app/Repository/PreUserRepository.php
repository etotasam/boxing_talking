<?php

namespace App\Repository;

use App\Models\PreUser;

class PreUserRepository
{


  /**
   * @param array preUserData
   * @return PreUser
   */
  public static function createPreUser($preUserData): PreUser
  {
    return PreUser::create($preUserData);
  }

  /**
   * @param int id
   * @return PreUser
   */
  public static function getPreUser($id): PreUser
  {
    return PreUser::find($id);
  }
}
