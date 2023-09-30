<?php

namespace App\Http\Controllers;


// use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;
use App\Models\Administrator;
use App\Services\UserService;
use App\Services\PreUserService;
use App\Services\GuestUserService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

// !request
use App\Http\Requests\PreCreateAuthRequest;
use App\Http\Requests\LoginRequest;

class AuthController extends Controller
{

    public function __construct(UserService $userService, PreUserService $preUserService, GuestUserService $guestService)
    {
        $this->userService = $userService;
        $this->preUserService = $preUserService;
        $this->guestService = $guestService;
    }

    /**
     * guest_login
     *
     * @return \Illuminate\Http\Response
     */
    public function guestLogin(Request $request)
    {
        try {
            $this->guestService->loginGuest($request);
            return response()->json(["success" => true, "message" => "success guest login"], Response::HTTP_ACCEPTED);
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
            $this->guestService->logoutGuest();
            return response()->json(["success" => true, "message" => "Logout guest user"], Response::HTTP_ACCEPTED);
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
            $preUserDataForRegister = [
                "name" => $request->name,
                "email" => $request->email,
                "password" => $request->password,
            ];

            DB::beginTransaction();
            $this->preUserService->createPreUserAndSendEmail($preUserDataForRegister);
            DB::commit();
            return response()->json(['success' => true, 'message' => "Successful pre signup."], Response::HTTP_CREATED);
        } catch (Exception $e) {
            DB::rollBack();
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

            DB::beginTransaction();
            $this->userService->createUserService($request->token);
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
