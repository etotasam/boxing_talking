<?php

namespace App\Http\Controllers;


// use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
// use App\Mail\Mailer;
use App\Jobs\MailSendJob;
use App\Models\User;
use App\Models\PreUser;
use App\Models\GuestUser;
use App\Models\Administrator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

// !request
use App\Http\Requests\PreCreateAuthRequest;
use App\Http\Requests\LoginRequest;

class AuthController extends Controller
{

    public function __construct(User $user, PreUser $preUser, GuestUser $guest)
    {
        $this->user = $user;
        $this->preUser = $preUser;
        $this->guest = $guest;
    }

    /**
     * guest_login
     *
     * @return \Illuminate\Http\Response
     */
    public function guestLogin(Request $request)
    {
        try {
            if (Auth::check()) {
                throw new Exception("Guest login is not allowed as already authenticated", Response::HTTP_BAD_REQUEST);
            }
            $guestUser = $this->guest->create();
            Auth::guard('guest')->login($guestUser);
            if (Auth::guard('guest')->check()) {
                $request->session()->regenerate();
                return response()->json(["success" => true, "message" => "success guest login"], Response::HTTP_ACCEPTED);
            } else {
                throw new Exception("Failed guest login", Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
        }
    }


    /**
     * guest_logout
     *
     * @return \Illuminate\Http\Response
     */
    public function guestLogout()
    {
        try {
            $guestGuard = Auth::guard('guest');
            $guestUser = $guestGuard->user();
            if (!$guestUser) {
                throw new Exception('Failed guest logout', Response::HTTP_FORBIDDEN);
            }

            //? ログアウトと同時にゲストユーザーを削除
            $guestUserID = $guestGuard->user()->id;
            $guestGuard->logout();
            $guest = $this->guest->find($guestUserID);
            if ($guest) {
                $guest->delete();
            }
            if (!Auth::guard('guest')->check()) {
                return response()->json(["success" => true, "message" => "Logout guest user"], Response::HTTP_ACCEPTED);
            } else {
                throw new Exception('Failed guest logout', Response::HTTP_FORBIDDEN);
            }
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
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
    public function preCreate(PreCreateAuthRequest $request)
    {
        // throw new Exception();
        try {
            $preUser = $this->preUser->create([
                "name" => $request->name,
                "email" => $request->email,
                "password" => $request->password,
            ]);
            if (!$preUser) {
                throw new Exception("Failed pre user create", 500);
            }

            MailSendJob::dispatch($preUser->id, $request->name, $request->email);

            return response()->json(
                [
                    'success' => true,
                    'message' => "Successful pre signup."
                ],
                Response::HTTP_CREATED
            );
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], $e->getCode());
            }
            return response()->json(['success' => false, "message" => $e->getMessage()], 500);
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
            $validator = Validator::make($request->only('token'), [
                "token" => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json(["success" => false, "message" => $validator->errors()], 422);
            }

            $secretKey = config('const.jwt_secret_key');
            if (!isset($secretKey)) {
                throw new Exception("cannot get secret-key", 500);
            }
            $decoded = JWT::decode($request->token, new Key($secretKey, 'HS256'));

            $userID = $decoded->user_id;
            $preUser = $this->preUser->find($userID);

            if (!$preUser) {
                throw new Exception("Invalid access", 403);
            }
            DB::beginTransaction();
            $authUser = $this->user->create([
                // "id" => $preUser->id,
                "name" => $preUser->name,
                "email" => $preUser->email,
                "password" => $preUser->password
            ]);

            if (!$authUser) {
                throw new Exception("Failed signup...", 500);
            }

            $preUser->delete();
            DB::commit();
            return response()->json(["message" => "Successful signup"], Response::HTTP_CREATED);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], 500);
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
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }


    /**
     * login
     *
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function login(LoginRequest $request)
    {
        //? ゲストでログインしてる場合はゲスト_ログアウト

        try {
            if (Auth::guard('guest')->check()) {
                Auth::guard('guest')->logout();
            }
            // throw new Exception();
            if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
                return Auth::user();
            } else {
                throw new Exception("Failed Login", Response::HTTP_UNAUTHORIZED);
            }
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
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
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }


    /**
     * admin check
     *
     * @param str $userID
     * @return \Illuminate\Http\Response
     */
    public function admin(Request $request)
    {
        try {
            if (!Auth::User()) {
                return false;
            }
            $authUser_id = Auth::User()->id;
            $is_admin = Administrator::where("user_id", $authUser_id)->exists();
            return $is_admin;
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
