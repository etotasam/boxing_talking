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
      \Log::error($e->getMessage());
      abort(500);
    } catch (\Exception $e) {
      DB::rollback();
      throw $e;
    }

    DB::commit();
  }


  public function logoutGuest(): void
  {
    $guestUserId = $this->guest->getGuestUser()->id;
    $this->guest->logoutGuestUser();
    $isDelete = $this->guest->deleteGuestUser($guestUserId);
    if (!$isDelete) {
      abort(500);
    }
  }
}
