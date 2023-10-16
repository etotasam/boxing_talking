<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
// controller
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\WinLossPredictionController;
use App\Http\Controllers\BoxerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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
//? 試合
Route::get('/match', [MatchController::class, 'index']);
//? ボクサー
Route::get('/boxer', [BoxerController::class, 'index']);
//? 勝利予想
Route::get('/prediction', [WinLossPredictionController::class, 'index']);
//? コメント
Route::get('/comment', [CommentController::class, 'index']);
// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/guest/logout', [AuthController::class, 'guestLogout']);
    Route::post('/prediction', [WinLossPredictionController::class, 'store']);
    Route::post('/comment', [CommentController::class, 'store']);
});
// !管理者
Route::middleware('administrator')->group(function () {
    //? ボクサー
    Route::post('/boxer', [BoxerController::class, 'store']);
    Route::patch('/boxer', [BoxerController::class, 'update']);
    Route::delete('/boxer', [BoxerController::class, 'destroy']);
    //? 試合
    Route::post('/match', [MatchController::class, 'store']);
    Route::delete('/match', [MatchController::class, 'destroy']);
    Route::patch('/match', [MatchController::class, 'update']);
});
