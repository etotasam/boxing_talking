<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\NewAccessToken;

class GuestUser extends Authenticatable implements AuthenticatableContract
{
    use HasFactory;
    use HasApiTokens;

    public static function createGuestToken(): NewAccessToken
    {
        $guest_user = GuestUser::find(1);

        return $guest_user->createToken('guest-access');
    }
}
