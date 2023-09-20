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


Route::get('/user', [AuthController::class, 'fetch']);

Route::get('/auth/check', function () {
    return Auth::check();
});


Route::get('/guest/user', function (Request $request) {
    return (bool)Auth::guard('guest')->check();
});



//? auth
Route::get('/admin', [AuthController::class, 'admin']);
// Route::post('/user/create', [AuthController::class, 'test_create'])->name('auth.test_create');
Route::post('/user/create', [AuthController::class, 'create']);
Route::post('/user/pre_create', [AuthController::class, 'pre_create']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/guest/login', [AuthController::class, 'guest_login']);

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
    Route::post('/guest/logout', [AuthController::class, 'guest_logout']);
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




//? メールテスト
Route::get('/mail', [MailController::class, 'send']);

//? テストapi
Route::post('/testtest', [BoxerController::class, 'testtest']);


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
