<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
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

  public function loginUserService(string $email, string $password): User
  {
    if (Auth::guard('guest')->check()) {
      Auth::guard('guest')->logout();
    }
    if (!Auth::attempt(compact("email", "password"))) {
      throw new Exception("Failed Login", 401);
    }
    return Auth::user();
  }


  public function logoutUserService(): void
  {
    if (!Auth::check()) {
      throw new Exception('Forbidden', 403);
    };
    Auth::logout();
    if (Auth::check()) {
      throw new Exception('dose not logout...', 500);
    }
  }

  public function createUserService(string $token): void
  {
    $secretKey = config('const.jwt_secret_key');
    if (!isset($secretKey)) {
      throw new Exception("cannot get secret-key", 500);
    }
    $decodedToken = JWT::decode($token, new Key($secretKey, 'HS256'));

    $preUserId = $decodedToken->user_id;
    $preUser = PreUserRepository::get($preUserId);

    if (!$preUser) {
      throw new Exception("Invalid access", 403);
    }
    $authUser = UserRepository::create([
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
