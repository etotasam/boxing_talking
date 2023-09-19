<?php

namespace App\Http\Controllers;


use App\Mail\Mailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ErrorHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
// use Mail;
// models
use App\Models\User;
use App\Models\PreUser;
use App\Models\GuestUser;
use App\Models\ProvisionalUser;
use App\Models\Administrator;

use Laravel\Sanctum\PersonalAccessTokenResult;
// use \Symfony\Component\HttpFoundation\Response;
use \Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;

// !request
use App\Http\Requests\CreateAuthRequest;

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
    public function guest_logout(Request $request)
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

            $guestGuard->logout();
            if (!Auth::guard('guest')->check()) {
                return true;
            } else {
                throw new Exception('Faild guest logout', Response::HTTP_FORBIDDEN);
            }
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }

    /**
     * pre_create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function pre_create(Request $request)
    {

        // throw new Exception();
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email|unique:pre_users,email',
                'name' => 'required|string|unique:users,name|unique:pre_users,name|max:30',
                'password' => 'regex: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\-]{8,24}$/'
            ]);

            if ($validator->fails()) {
                return new JsonResponse(['success' => false, 'message' => $validator->errors()], 422);
            }

            // ? password Hash
            $hashed_password = Hash::make($request->password);

            DB::beginTransaction();

            $pre_user = PreUser::create([
                "name" => $request->name,
                "email" => $request->email,
                "password" => $hashed_password,
            ]);
            $payload = [
                'user_id' => $pre_user->id,
                'exp' => strtotime('+30 minutes'),
            ];

            $secretKey = config('app.token_secret_key');

            $token = JWT::encode($payload, $secretKey, 'HS256');
            $data = ["token" => $token, "email" => $pre_user->email];

            Mail::to($request->email)->send(new Mailer($request->name, $token));

            DB::commit();
            return new JsonResponse(
                [
                    'success' => true,
                    'message' => "Thank you for subscribing to our email, please check your inbox"
                ],
                Response::HTTP_CREATED
            );
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                // return response()->json(["message" => $e->getMessage(), "error_details" => $e->getTrace()], 422);
                return new JsonResponse(['success' => false, 'message' => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], 500);
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
        try {
            $credentials = $request->only('token');
            $secret_key = config('app.token_secret_key');

            $decoded = JWT::decode($credentials['token'], new Key($secret_key, 'HS256'));
            $exp = $decoded->exp;
            $current_time = time();
            if ($current_time > $exp) {
                throw new Exception("期限切れ", 403);
            }

            $user_id = $decoded->user_id;
            $pre_user = PreUser::find($user_id);

            if (!$pre_user) {
                throw new Exception("無効", 403);
            }
            DB::beginTransaction();
            $auth_user = User::create([
                "name" => $pre_user->name,
                "email" => $pre_user->email,
                "password" => $pre_user->password
            ]);

            if (!$auth_user) {
                throw new Exception("本登録しっぱい", 401);
            }

            // if (!Auth::attempt(['email' => $auth_user->email, 'password' => $auth_user->password])) {
            // }
            // $auth_user = Auth::user();
            // if (!$auth_user) {
            //     throw new Exception("ログインミス", 403);
            // }

            $pre_user->delete();
            DB::commit();
            return response()->json(["message" => "successful"], Response::HTTP_CREATED);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => "failed"], 500);
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
    // public function create(Request $request)
    // {
    //     try {
    //         $name = $request->name;
    //         $email = $request->email;
    //         $password = Hash::make($request->password);
    //         $is_name_exist = User::where("name", $name)->exists();
    //         $is_email_exist = User::where("email", $email)->exists();
    //         if ($is_email_exist) {
    //             throw new Exception('user already exists', Response::HTTP_FORBIDDEN);
    //         }
    //         if ($is_name_exist) {
    //             throw new Exception('name already use', Response::HTTP_FORBIDDEN);
    //         }
    //         $user = ["name" => $name, "email" => $email, "password" => $password];
    //         User::create($user);
    //         if (Auth::attempt(['email' => $email, 'password' => $request->password])) {
    //             return Auth::user();
    //         }
    //         return response()->json(["message" => "created user"], Response::HTTP_CREATED);
    //     } catch (Exception $e) {
    //         return response()->json(["message" => $e->getMessage()], $e->getCode());
    //     }
    // }

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
     * @return \Illuminate\Http\Response
     */
    public function logout()
    {
        // throw new Exception();
        try {
            if (!Auth::check()) {
                throw new Exception('Forbidden', Response::HTTP_FORBIDDEN);
            };
            Auth::logout();
            if (!Auth::check()) {
                return true;
            } else {
                throw new Exception('dose not logout...', Response::HTTP_INTERNAL_SERVER_ERROR);
            }
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
