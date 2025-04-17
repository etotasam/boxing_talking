<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\AuthController;



Route::get('/user', [AuthController::class, 'fetch']);
Route::get('/guest/user', function () {
  return (bool)Auth::guard('guest')->check();
});

//? auth
Route::get('/admin', [AuthController::class, 'admin']);
Route::post('/user/create', [AuthController::class, 'create']);
Route::post('/user/pre_create', [AuthController::class, 'preCreate']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guest/login', [AuthController::class, 'guestLogin']);
//! ログインユーザー
Route::middleware('auth.user')->group(function () {
  Route::post('/logout', [AuthController::class, 'logout']);
});
// !ゲストユーザー
Route::middleware('auth.guest')->group(function () {
  Route::post('/guest/logout', [AuthController::class, 'guestLogout']);
});
