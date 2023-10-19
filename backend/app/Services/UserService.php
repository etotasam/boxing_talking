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

class UserService
{

  protected $userRepository;
  protected $guest;
  protected $preUserRepository;
  public function __construct(
    UserRepositoryInterface $userRepository,
    GuestRepositoryInterface $guest,
    PreUserRepositoryInterface $preUserRepository,
  ) {
    $this->userRepository = $userRepository;
    $this->guest = $guest;
    $this->preUserRepository = $preUserRepository;
  }

  public function loginUserService(string $email, string $password): User
  {
    if ($this->guest->isGuestUser()) {
      $this->guest->logoutGuestUser();
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
    $preUser = $this->preUserRepository->getPreUser($preUserId);

    if (!$preUser) {
      throw new Exception("Invalid access", 403);
    }

    DB::beginTransaction();
    try {
      $authUser = $this->userRepository->createUser([
        "name" => $preUser->name,
        "email" => $preUser->email,
        "password" => $preUser->password
      ]);
      if (!$authUser) {
        throw new Exception("Failed signup...", 500);
      }

      $preUser->delete();
    } catch (\Exception $e) {
      DB::rollback();
      throw new \Exception($e->getMessage(), $e->getCode());
    }

    DB::commit();
  }
}
