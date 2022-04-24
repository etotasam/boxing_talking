<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
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
