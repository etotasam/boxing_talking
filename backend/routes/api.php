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
// Route::post('/user/create', [AuthController::class, 'test_create'])->name('auth.test_create');
Route::post('/user/create', [AuthController::class, 'create']);
Route::post('/user/pre_create', [AuthController::class, 'preCreate']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guest/login', [AuthController::class, 'guestLogin']);
//? 試合
Route::get('/match', [MatchController::class, 'fetch']);
//? ボクサー
Route::get('/boxer/count', [BoxerController::class, 'count']);
Route::get('/boxer', [BoxerController::class, 'fetch']);
//? 勝利予想
Route::get('/prediction', [WinLossPredictionController::class, 'fetch']);
//? コメント
Route::get('/comment', [CommentController::class, 'fetch']);
// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/guest/logout', [AuthController::class, 'guestLogout']);
    Route::put('/prediction', [WinLossPredictionController::class, 'win_loss_prediction']);
    Route::post('/comment', [CommentController::class, 'post']);
});
// !管理者
Route::middleware('administrator')->group(function () {
    //? ボクサー
    Route::get('/boxer/search', [BoxerController::class, 'search']);
    Route::post('/boxer', [BoxerController::class, 'register']);
    Route::put('/boxer', [BoxerController::class, 'update']);
    Route::delete('/boxer', [BoxerController::class, 'delete']);
    //? コメント
    Route::delete('/comment', [CommentController::class, 'delete']);
    //? 試合
    Route::post('/match', [MatchController::class, 'register']);
    Route::delete('/match', [MatchController::class, 'delete']);
    Route::put('/match', [MatchController::class, 'update']);
});


Route::get('/test', [MatchController::class, 'test']);
