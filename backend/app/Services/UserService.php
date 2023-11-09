<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use App\Repositories\Interfaces\GuestRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\PreUserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;

class UserService
{

  public function __construct(
    protected UserRepositoryInterface $userRepository,
    protected GuestRepositoryInterface $guest,
    protected PreUserRepositoryInterface $preUserRepository,
  ) {
  }

  public function loginUserExecute(string $email, string $password): User
  {
    if (!Auth::attempt(compact("email", "password"))) {
      throw new AuthenticationException("Failed Login");
    }
    return Auth::user();
  }


  public function logoutUserService(): void
  {
    Auth::logout();
  }

  /**
   * 仮ユーザーからの本登録
   * @errorCode 50 secret-keyが見つからない
   * @errorCode 51 Usersテーブルへの登録失敗
   * @param string $token
   * @return void
   */
  public function createUserExecute(string $token): void
  {
    $secretKey = config('const.jwt_secret_key');
    if (!$secretKey) {
      \Log::error("Secret-key has not been found");
      abort(500);
    }
    $decodedToken = JWT::decode($token, new Key($secretKey, 'HS256'));

    $preUserId = $decodedToken->user_id;
    $preUser = $this->preUserRepository->getPreUser($preUserId);

    DB::beginTransaction();
    try {
      $this->userRepository->createUser([
        "name" => $preUser->name,
        "email" => $preUser->email,
        "password" => $preUser->password
      ]);

      $preUser->delete();
    } catch (\Exception $e) {
      DB::rollback();
      \Log::error($e->getMessage());
      abort(500);
    }

    DB::commit();
  }
}
