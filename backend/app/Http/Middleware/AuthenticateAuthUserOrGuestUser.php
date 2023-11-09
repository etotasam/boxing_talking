<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Repositories\Interfaces\GuestRepositoryInterface;

class AuthenticateAuthUserOrGuestUser
{
    public function __construct(private GuestRepositoryInterface $guestRepository)
    {
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
        $isGuest = $this->guestRepository->isGuestUser();
        if ($isAuthUser || $isGuest) {
            return $next($request);
        } else {
            return response()->json(["success" => false, "message" => "Must be auth for access"], 401);
        }
    }
}
