<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
// controller
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\WinLossPredictionController;
use App\Http\Controllers\Api\BoxerController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\DbDataToCsvController;
use App\Http\Controllers\Api\TestController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route::get('/test', [TestController::class, 'test']);

Route::get('/user', [AuthController::class, 'fetch']);
Route::get('/guest/user', function () {
    return (bool)Auth::guard('guest')->check();
});

Route::get('/health', [HealthCheckController::class, 'index']);
//? auth
Route::get('/admin', [AuthController::class, 'admin']);
Route::post('/user/create', [AuthController::class, 'create']);
Route::post('/user/pre_create', [AuthController::class, 'preCreate']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guest/login', [AuthController::class, 'guestLogin']);
//? 試合
Route::get('/match', [MatchController::class, 'index']);
Route::get('/match/{match}/show', [MatchController::class, 'show']);
//? ボクサー
Route::get('/boxer', [BoxerController::class, 'index']);
//? 勝利予想
Route::get('/prediction', [WinLossPredictionController::class, 'index']);
Route::get('/match/prediction', [WinLossPredictionController::class, 'fetchOnMatch']);
//? コメント
Route::get('/comment/old', [CommentController::class, 'old']);
Route::get('/comment', [CommentController::class, 'index']);
Route::get('/comment/new', [CommentController::class, 'new']);
Route::get('/comment/state', [CommentController::class, 'state']);
// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
    Route::post('/prediction', [WinLossPredictionController::class, 'store']);
    Route::post('/comment', [CommentController::class, 'store']);
});
//! ログインユーザー
Route::middleware('auth.user')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});
// !ゲストユーザー
Route::middleware('auth.guest')->group(function () {
    Route::post('/guest/logout', [AuthController::class, 'guestLogout']);
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
    Route::post('/match/result', [MatchController::class, 'resultStore']);
    //?コメント削除
    Route::delete('/comment/{comment}', [CommentController::class, 'destroy']);
    //?csv作成
    Route::get('/csv ', [DbDataToCsvController::class, 'output']);
});
