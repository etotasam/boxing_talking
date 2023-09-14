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
use App\Models\ProvisionalUser;
use App\Models\Administrator;

use App\Http\Requests\CreateAuthRequest;

use \Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{

    /**
     * create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function test_create(Request $request)
    {
        // throw new Exception();
        try {
            // $id = (string) Str::uuid();
            $name = $request->name;
            $email = $request->email;
            $token = Str::random(60);
            $password = Hash::make($request->password);
            $is_name_exist = User::where("name", $name)->exists();
            $is_email_exist = User::where("email", $email)->exists();
            if ($is_email_exist) {
                throw new Exception('user already exists', Response::HTTP_FORBIDDEN);
            }
            if ($is_name_exist) {
                throw new Exception('name already use', Response::HTTP_FORBIDDEN);
            }
            $user = ["name" => $name, "email" => $email, "password" => $password, "token" => $token];
            // \Log::debug($user);
            // User::create($user);
            ProvisionalUser::create($user);
            // $data = ["token" => $token];
            // Mail::send('email.test', $data, function($message) {
            //     $message->to("cye_ma_kun245@yahoo.co.jp", "Test")
            //     ->from("from@test.com", "Boxing Talking")
            //     ->subject('Boxint Taking Email確認');
            // });
            return response()->json(["message" => "created user"], Response::HTTP_CREATED);
        } catch (Exception $e) {
            if ($e->getCode() === Response::HTTP_FORBIDDEN) {
                return response()->json(['message' => $e->getMessage()], Response::HTTP_FORBIDDEN);
            }
            return response()->json(['message' => "create user faild"], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        // if(Auth::attempt(['email' => $email, 'password' => $password])) {
        //     return Auth::user();
        // }
        // return response()->json(["message" => "401"], 401);
    }


    /**
     * create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function create(CreateAuthRequest $request)
    {
        try {
            // throw new Exception("えらー", 500);
            $name = $request->name;
            $email = $request->email;
            $password = Hash::make($request->password);
            $is_email_exist = User::where("email", $email)->exists();
            if ($is_email_exist) {
                // return ErrorHelper::createErrorResponse('email', 'email is alredy registered', Response::HTTP_FORBIDDEN);
                return ErrorHelper::throwError('email is alredy registered', Response::HTTP_FORBIDDEN);
            }
            $is_name_exist = User::where("name", $name)->exists();
            if ($is_name_exist) {
                return ErrorHelper::throwError('The name is alredy in use', Response::HTTP_FORBIDDEN);
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
     * login
     *
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
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
