<?php

namespace App\Services;

use Illuminate\Http\Response;
use App\Models\User;

class UserService
{

  public function __construct(User $user)
  {
    $this->user = $user;
  }


  /**
   * @param int userID
   * @return collection user data
   */
  public function getUser($userID)
  {
    return $this->user->find($userID);
  }

  /**
   * @param int userID
   * @return bool
   */
  public function isUserExists($userID)
  {
    return $this->user->find($userID)->exists();
  }
}
