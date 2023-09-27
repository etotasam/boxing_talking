<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
//model
// use App\Models\Organization;
// use App\Models\WeightDivision;
// use App\Models\Title;
use App\Models\Administrator;

class AuthService
{
  public function __construct(Administrator $admin)
  {
    $this->admin = $admin;
  }

  /**
   * @return void
   */
  public function requireAdminRole()
  {
    $auth = Auth::User();
    if ($auth) {
      $authUserID = Auth::User()->id;
    } else {
      throw new Exception("No auth", Response::HTTP_UNAUTHORIZED);
    }
    $isAdmin = Administrator::where("user_id", $authUserID)->exists();
    if (!$isAdmin) {
      throw new Exception("No admin", Response::HTTP_UNAUTHORIZED);
    }
  }
}
