<?php

namespace App\Repository;

use App\Models\User;

class UserRepository
{


  /**
   * @param array userData
   * @return User
   */
  public static function createUser($userData): User
  {
    return User::create($userData);
  }
}
