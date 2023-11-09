<?php

namespace App\Repositories;

use App\Models\PreUser;
use App\Repositories\Interfaces\PreUserRepositoryInterface;

class PreUserRepository implements PreUserRepositoryInterface
{

  public function getPreUser($preUserId)
  {
    return PreUser::findOrFail($preUserId);
  }

  public function createPreUser($name, $email, $password)
  {
    return PreUser::updateOrCreate(['email' => $email], compact("name", "email", "password"));
    // return PreUser::create(compact("name", "email", "password"));
  }
}
