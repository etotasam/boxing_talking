<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Administrator;

class AuthenticateAdmin
{

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $is_admin = Administrator::where('user_id', Auth::id())->exists();
            if ($is_admin) {
                return $next($request);
            } else {
                return response()->json(["success" => false, "message" => "Unauthorized: Cannot access with your auth"], 401);
            }
        }
        return response()->json(["message" => "Unauthorized"], 401);
    }
}
