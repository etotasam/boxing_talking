<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Administrator;
use Illuminate\Support\Facades\Auth;

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
            $id = Auth::user()->id;
            $is_admin = Administrator::where('user_id', $id)->exists();
            if ($is_admin) {
                return $next($request);
            } else {
                return response()->json(["message" => "Unauthorized: Cannot access with your auth"], 401);
            }
        }
        return response()->json(["message" => "Unauthorized"], 401);
    }
}
