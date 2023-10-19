<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{


  public function createUser($userData)
  {
    return User::create($userData);
  }

  public function getUser($userId)
  {
    return User::find($userId);
  }
}
