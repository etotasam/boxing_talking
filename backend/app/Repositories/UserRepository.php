<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{


  /**
   * @param array userData
   * @return User
   */
  public static function create($userData): User
  {
    return User::create($userData);
  }

  /**
   * @param int userId
   * @return User
   */
  public static function get($userId): ?User
  {
    return User::find($userId);
  }
}
