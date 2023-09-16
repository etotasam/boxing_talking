<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\BoxingMatch;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Vote;
use App\Jobs\SampleJob;
use GuzzleHttp\Psr7\Message;
use App\Models\GuestUser;

// controller
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\WinLossPredictionController;
use App\Http\Controllers\BoxerController;
use App\Http\Controllers\MailController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/**
 * ログイン情報のチェック
 */


Route::get('/user', [AuthController::class, 'fetch'])->name('auth.user');

Route::get('/auth/check', function () {
    return Auth::check();
})->name('auth.check');


Route::get('/guest/user', function (Request $request) {
    return (bool)Auth::guard('guest')->check();
})->name('auth.guest_user');



//? auth
Route::get('/admin', [AuthController::class, 'admin'])->name('auth.admin');
// Route::post('/user/create', [AuthController::class, 'test_create'])->name('auth.create');
Route::post('/user/create', [AuthController::class, 'create'])->name('auth.create');

Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

Route::post('/guest/login', [AuthController::class, 'guest_login'])->name('auth.guest_login');

//? 試合
Route::get('/match', [MatchController::class, 'fetch'])->name('match.fetch');
//? ボクサー
Route::get('/boxer/count', [BoxerController::class, 'count'])->name('boxer.count');
Route::get('/boxer', [BoxerController::class, 'fetch'])->name('boxer.fetch');
//? 勝利予想
Route::get('/prediction', [WinLossPredictionController::class, 'fetch'])->name('vote.fetch');
//? コメント
Route::get('/comment', [CommentController::class, 'fetch'])->name('comment.fetch');

// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('/guest/logout', [AuthController::class, 'guest_logout'])->name('auth.guest_logout');
    Route::put('/prediction', [WinLossPredictionController::class, 'win_loss_prediction'])->name('vote');
    Route::post('/comment', [CommentController::class, 'post'])->name('comment.post');
});

// !管理者
Route::middleware('administrator')->group(function () {
    //? ボクサー
    Route::get('/boxer/search', [BoxerController::class, 'search'])->name('boxer.search');
    Route::post('/boxer', [BoxerController::class, 'register'])->name('boxer.register');
    Route::put('/boxer', [BoxerController::class, 'update'])->name('boxer.update');
    Route::delete('/boxer', [BoxerController::class, 'delete'])->name('boxer.delete');
    //? コメント
    Route::delete('/comment', [CommentController::class, 'delete'])->name('comment.delete');
    //? 試合
    Route::post('/match', [MatchController::class, 'register'])->name('match.register');
    Route::delete('/match', [MatchController::class, 'delete'])->name('match.delete');
    Route::put('/match', [MatchController::class, 'update'])->name('match.update');
});




//? メールテスト
Route::get('/mail', [MailController::class, 'send'])->name('mail.send');

//? テストapi
Route::post('/testtest', [BoxerController::class, 'testtest'])->name('testtest');


Route::get("/{match_id}/check_vote", function (string $match_id) {
    $user_id = Auth::user()->id;
    $match_id = intval($match_id);
    $has_vote = Vote::where([["user_id", $user_id], ["match_id", $match_id]])->first();
    $test = Auth::user()->votes;
    return $test;
});



Route::put("/{id}/test", function ($id = null) {
    $data = "";
    if ($id !== null) {
        $user = User::find($id);
    } else {
        $user = null;
    }

    if ($user != null) {
        // SampleJob::dispatch($user)->delay(now()->addMinutes(1));
        SampleJob::dispatch($user)->onQueue('name');
        $data = User::all();
    } else {
        $data = "ログインしてね";
    }

    return response()->json($data);
});

Route::get('/test', function () {

    try {
        // throw new Exception("エラーです");
        return "fetch data complete";
    } catch (Exception $e) {
        return response()->json(["message" => $e->getMessage()], 500);
    }
});
