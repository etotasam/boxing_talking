<?php

namespace App\Http\Controllers;

use App\Helpers\ErrorHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Mail;
// models
use App\Models\User;
use App\Models\GuestUser;
use App\Models\ProvisionalUser;
use App\Models\Administrator;

use App\Http\Requests\CreateAuthRequest;
use Laravel\Sanctum\PersonalAccessTokenResult;
// use \Symfony\Component\HttpFoundation\Response;
use \Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{

    /**
     * guest_login
     *
     * @return \Illuminate\Http\Response
     */
    public function guest_login(Request $request)
    {
        try {
            if (Auth::check()) {
                throw new Exception("Guest login is not allowed as already authenticated", Response::HTTP_BAD_REQUEST);
            }
            // $guest_user = GuestUser::find(1);
            $guest_user = GuestUser::create();
            if (Auth::guard('guest')->login($guest_user)) {
                $request->session()->regenerate();
            };
            return Auth::guard('guest')->check();
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }


    /**
     * guest_logout
     *
     * @return \Illuminate\Http\Response
     */
    public function guest_logout(Response $request)
    {

        // $response = new Response('Logged out successfully');
        // $response->withCookie(Cookie::forget('guest_token'));
        // return $response;

        try {
            $guestGuard = Auth::guard('guest');
            $guestUser = $guestGuard->user();
            if (!$guestUser) {
                throw new Exception('Faild guest logout', Response::HTTP_FORBIDDEN);
            }

            return $guestGuard->logout();
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }


    /**
     * create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        // throw new Exception();
        try {
            $name = $request->name;
            $email = $request->email;
            $password = Hash::make($request->password);
            $is_name_exist = User::where("name", $name)->exists();
            $is_email_exist = User::where("email", $email)->exists();
            if ($is_email_exist) {
                throw new Exception('user already exists', Response::HTTP_FORBIDDEN);
            }
            if ($is_name_exist) {
                throw new Exception('name already use', Response::HTTP_FORBIDDEN);
            }
            $user = ["name" => $name, "email" => $email, "password" => $password];
            User::create($user);
            if (Auth::attempt(['email' => $email, 'password' => $request->password])) {
                return Auth::user();
            }
            return response()->json(["message" => "created user"], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }

    /**
     * user
     *
     * @return \Illuminate\Http\Response
     */
    public function fetch(Request $request)
    {
        try {
            if (Auth::check()) {
                return $request->user();
            } else {
                return null;
            }
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }


    /**
     * login
     *
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        //? ゲストでログインしてる場合はゲスト_ログアウト
        if (Auth::guard('guest')->check()) {
            Auth::guard('guest')->logout();
        }

        $email = $request->email;
        $password = $request->password;
        try {
            // throw new Exception();
            if (Auth::attempt(['email' => $email, 'password' => $password])) {
                return Auth::user();
            }
            throw new Exception("Failed Login", Response::HTTP_UNAUTHORIZED);
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }

    /**
     * logout
     *
     * @param string $user_name
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        // throw new Exception();
        $name = $request->user_name;
        try {
            if (!Auth::User()) {
                throw new Exception('Forbidden', Response::HTTP_FORBIDDEN);
            };
            if ($name == Auth::User()->name) {
                return Auth::logout();
            } else {
                throw new Exception('dose not logout...', Response::HTTP_BAD_REQUEST);
            };
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }



    /**
     * admin check
     *
     * @param str $user_id
     * @return \Illuminate\Http\Response
     */
    public function admin(Request $request)
    {
        try {
            if (!Auth::User()) {
                return false;
                // throw new Exception("no auth user", 401);
                // return response()->json(["message" => "no auth user", 401]);
            }
            // $req_user_id = $request->user_id;
            $auth_user_id = Auth::User()->id;
            // if ($req_user_id != $auth_user_id) {
            //     return response()->json(["message" => "illegal user", 406]);
            // }
            $is_admin = Administrator::where("user_id", $auth_user_id)->exists();
            return $is_admin;
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }
}
