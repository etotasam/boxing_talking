<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;
use App\Exceptions\CustomErrorCodes;
use Illuminate\Database\QueryException;

class GuestUserService
{

  protected $guest;
  public function __construct(GuestRepositoryInterface $guest)
  {
    $this->guest = $guest;
  }

  /**
   * @param Request request
   * @return void
   */
  public function loginGuest($request): void
  {

    // すでにログインしている場合はエラー
    if (Auth::guard('guest')->check() || Auth::check()) {
      throw new Exception("you already logged in");
    }

    //ゲストユーザーの1日の作成数に制限をかける
    $limit = 50;
    $countGeneratedGuestOnToday = $this->guest->getCountCreatedGuestToday();
    if ($countGeneratedGuestOnToday > $limit) {
      throw new Exception("Unable to generate guest user today", CustomErrorCodes::UNABLE_TO_GENERATE_GUEST_TODAY);
    }

    DB::beginTransaction();
    try {
      $guestUser = $this->guest->createGuestUser();
      $this->guest->loginGuestUser($guestUser);
      $request->session()->regenerate();
    } catch (QueryException $e) {
      DB::rollback();
      \Log::error("Database error :" . $e->getMessage());
      throw new Exception("Unexpected error on database :" . $e->getMessage(), 500);
    } catch (\Exception $e) {
      DB::rollback();
      throw new Exception("Unexpected error :" . $e->getMessage(), 500);
    }

    DB::commit();
  }


  public function logoutGuest(): void
  {
    $guestUserId = $this->guest->getGuestUser()->id;
    $this->guest->logoutGuestUser();
    $isDelete = $this->guest->deleteGuestUser($guestUserId);
    if (!$isDelete) {
      throw new Exception("Unexpected error", 500);
    }
  }
}
