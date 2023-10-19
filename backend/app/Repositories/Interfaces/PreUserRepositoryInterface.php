<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\PreUser;

interface PreUserRepositoryInterface
{
  /**
   * @param string $preUserId uuid
   * @return PreUser
   */
  public function getPreUser($preUserId);

  /**
   * @param string $name
   * @param string $email
   * @param string $password
   * @return PreUser
   */
  public function createPreUser($name, $email, $password);
}
