<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\User;

interface UserRepositoryInterface
{

  /**
   * @param array $userData
   *  [
   *    "name" => string,
   *    "email" => string,
   *    "password" => string
   *  ]
   *
   * @return User
   */
  public function createUser($userData);

  /**
   * @param int $userId
   * @return User
   */
  public function getUser($userId);
}
