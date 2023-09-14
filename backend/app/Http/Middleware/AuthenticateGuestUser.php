<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\GuestUser;

class AuthenticateGuestUser
{
  public function handle(Request $request, Closure $next)
  {
    $cookie_token = $request->cookie('guest_token');
    $request_token = $request->header('Authorization');

    if ($cookie_token === $request_token) {
      $guest_user = GuestUser::find(1);
    } else {
      $guest_user = false;
    }

    if (!$guest_user) {
      return response()->json(['message' => 'Unauthorized Guest'], 401);
    }

    Auth::guard('guest')->setUser($guest_user);

    return $next($request);
  }
}
