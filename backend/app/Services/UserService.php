<?php

namespace App\Services;

use Illuminate\Http\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use App\Repository\PreUserRepository;
use App\Repository\UserRepository;

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

  /**
   * @param int userID
   */
  public function createUserService($token): void
  {
    $secretKey = config('const.jwt_secret_key');
    if (!isset($secretKey)) {
      throw new Exception("cannot get secret-key", 500);
    }
    $decodedToken = JWT::decode($token, new Key($secretKey, 'HS256'));

    $preUserId = $decodedToken->user_id;
    $preUser = PreUserRepository::getPreUser($preUserId);

    if (!$preUser) {
      throw new Exception("Invalid access", 403);
    }
    $authUser = UserRepository::createUser([
      "name" => $preUser->name,
      "email" => $preUser->email,
      "password" => $preUser->password
    ]);

    if (!$authUser) {
      throw new Exception("Failed signup...", 500);
    }

    $preUser->delete();
  }
}
