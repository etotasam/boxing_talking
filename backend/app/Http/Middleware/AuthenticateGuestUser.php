<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class AuthenticateGuestUser
{
  protected $guest;
  public function __construct(GuestRepositoryInterface $guest)
  {
    $this->guest = $guest;
  }

  public function handle(Request $request, Closure $next)
  {

    if ($this->guest->isGuestUser()) {
      return $next($request);
    } else {
      return response()->json(["message" => "Guest auth require for access"]);
    }
  }
}
