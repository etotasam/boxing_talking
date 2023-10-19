<?php

namespace App\Repositories;

use App\Models\PreUser;
use App\Repositories\Interfaces\PreUserRepositoryInterface;

class PreUserRepository implements PreUserRepositoryInterface
{

  public function getPreUser($preUserId)
  {
    return PreUser::find($preUserId);
  }

  public function createPreUser($name, $email, $password)
  {

    return PreUser::create(compact("name", "email", "password"));
  }
}
