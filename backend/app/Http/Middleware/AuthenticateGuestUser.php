<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class AuthenticateGuestUser
{

  public function __construct(private GuestRepositoryInterface $guestRepository)
  {
  }

  public function handle(Request $request, Closure $next)
  {

    if ($this->guestRepository->isGuestUser()) {
      return $next($request);
    } else {
      return response()->json(["message" => "Not guest"]);
    }
  }
}
