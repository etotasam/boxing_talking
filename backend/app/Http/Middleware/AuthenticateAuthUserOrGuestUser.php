<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class AuthenticateAuthUserOrGuestUser
{
    protected $guest;
    public function __construct(GuestRepositoryInterface $guest)
    {
        $this->guest = $guest;
    }
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $isAuthUser = Auth::check();
        $isGuest = $this->guest->isGuestUser();
        if ($isAuthUser || $isGuest) {
            return $next($request);
        } else {
            return response()->json(["message" => "Must be auth for access"], 401);
        }
    }
}
