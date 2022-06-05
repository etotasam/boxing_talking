<?php

namespace App\Http\Controllers;
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
            $id = (string) Str::uuid();
            $name = $request->name;
            $email = $request->email;
            $token = Str::random(60);
            $password = Hash::make($request->password);
            // $is_name_exist = User::where("name", $name)->exists();
            // $is_email_exist = User::where("email", $email)->exists();
            // if($is_email_exist) {
            //     throw new Exception('user already exists', Response::HTTP_FORBIDDEN);
            // }
            // if($is_name_exist) {
            //     throw new Exception('name already use', Response::HTTP_FORBIDDEN);
            // }
            $user = ["id" => $id, "name" => $name, "email" => $email, "password" => $password, "token" => $token];
            // \Log::debug($user);
            // User::create($user);
            ProvisionalUser::create($user);
            $data = ["token" => $token, "id" => $id];
            Mail::send('email.test', $data, function($message) {
                $message->to("cye_ma_kun245@yahoo.co.jp", "Test")
                ->from("from@test.com", "Boxing Talking")
                ->subject('Boxint Taking Email確認');
            });
            return response()->json(["message" => "created user"], Response::HTTP_CREATED);
        }catch(Exception $e) {
            if($e->getCode() === Response::HTTP_FORBIDDEN) {
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
    public function create(Request $request)
    {
        // throw new Exception();
        try {
            $name = $request->name;
            $email = $request->email;
            $password = Hash::make($request->password);
            $is_name_exist = User::where("name", $name)->exists();
            $is_email_exist = User::where("email", $email)->exists();
            if($is_email_exist) {
                throw new Exception('user already exists', Response::HTTP_FORBIDDEN);
            }
            if($is_name_exist) {
                throw new Exception('name already use', Response::HTTP_FORBIDDEN);
            }
            $user = ["name" => $name, "email" => $email, "password" => $password];
            User::create($user);
            return response()->json(["message" => "created user"], Response::HTTP_CREATED);
        }catch(Exception $e) {
            if($e->getCode() === Response::HTTP_FORBIDDEN) {
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
     * login
     *
     * @param string $email
     * @param string $password
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        // throw new Exception();
        $email = $request->email;
        $password = $request->password;
        if(Auth::attempt(['email' => $email, 'password' => $password])) {
            return Auth::user();
        }
        return response()->json(["message" => "401"], 401);
    }

    /**
     * logout
     *
     * @param int $user_id
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        // throw new Exception();
        $user_id = $request->user_id;
        $auth_user_id = Auth::User()->id;
        try{
            if($user_id != $auth_user_id) {
                throw new Exception("forbidden");
            }
            return Auth::logout();
        }catch(Exception $e){
            if($e->getMessage()) {
                return response()->json(["message" => $e->getMessage()], 403);
            }
            return response()->json(["message" => "faild whild logout"], 500);
        }
    }

}
