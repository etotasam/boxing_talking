<?php

namespace App\Helpers;

use Exception;
use App\Models\User;
use App\Models\Administrator;

class TestHelper
{
  public static function createAdminUser(): User
  {
    $user = User::factory()->count(1)->create();
    $adminUser = $user[0];
    Administrator::create(['user_id' => $adminUser->id]);
    return $adminUser;
  }
}
