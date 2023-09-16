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

    if (Auth::guard('guest')->check()) {
      return $next($request);
    } else {
      return response()->json(["message" => "Guest auth require for access"]);
    }
  }
}
