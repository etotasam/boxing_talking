<?php

use Illuminate\Support\Facades\Route;
use \Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
// Models
use App\Models\ProvisionalUser;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::get('/', function () {
    $front_app_url = config('const.front_app_url');
    // return view('welcome');
    return redirect()->to($front_app_url);
});

Route::get('/create/{token}/{user_id}', function ($token, $user_id) {
    // $data = ["token" => $token, "id" => $user_id];
    try{
        $user = ProvisionalUser::find($user_id);

        if(isset($user)) {
            if($user->token == $token) {
                // User::register_user($user);
                DB::beginTransaction();
                User::create(["name" => $user->name, "email" => $user->email, "password" => $user->password]);
                ProvisionalUser::destroy($user_id);
                DB::commit();
                $verified = "ok";
            }else {
                $verified = "no";
            }
        }else {
            $verified = "no";
        }
        // \Log::debug($res->status());
        return view('verify', ["verify" => $verified]);
    }catch (Exception $e) {
        DB::rollBack();
        return view('verify', ["verify" => "no"]);
    }
});

Route::get('/{any}', function () {
    return redirect()->to('http://localhost:3000/');
});
