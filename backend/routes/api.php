<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\Fighter;
use App\Models\BoxingMatch;
use Illuminate\Support\Facades\Log;
use App\Models\Comment;
use App\Models\User;

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
Route::middleware('auth:sanctum')->group(function() {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/check', function() {
        return Auth::check();
    });
});

Route::post('/logout', function() {
    return Auth::logout();
});

Route::post('/login', function(Request $request) {
    $email = $request->email;
    $password = $request->password;
    \Log::debug($email);
    if(Auth::attempt(['email' => $email, 'password' => $password])) {
        return Auth::user();
    }
    return response()->json(["message" => "401"], 401);
});

/**
 * @return
 */
Route::post('/fighter', function(Request $request) {
    $name = $request->name;
    $country = $request->country;
    $fighters = Fighter::all();
    return $fighters;
});

Route::post('/fight', function(Request $request) {
    $red_id = $request->redFighterId;
    $blue_id = $request->blueFighterId;
    $matchDate = $request->matchDate;
    $date = date_create($matchDate);
    BoxingMatch::create([
        "red_fighter_id" => $red_id,
        "blue_fighter_id" => $blue_id,
        "match_date" => $matchDate
    ]);
    return response()->json(["message" => "success"], 200);
});

Route::get('/match', function() {
    $all_match = BoxingMatch::orderBy('match_date')->get();
    $match_array = [];
    foreach($all_match as $match) {
        $red_id = $match->red_fighter_id;
        $blue_id = $match->blue_fighter_id;
        $red_fighter = Fighter::find($red_id);
        $blue_fighter = Fighter::find($blue_id);
        $element = ["id" => $match->id,"red" => $red_fighter, "blue" => $blue_fighter, "date" => $match->match_date];
        array_push($match_array, $element);
    };
    return response()->json($match_array);
});

Route::get('get_comments', function(Request $request) {
    $match_id = $request->match_id;
    $comments_array = [];
    $comments = BoxingMatch::find($match_id)->comments;
    foreach($comments as $comment) {
        $user_id = $comment->user_id;
        $user = User::find($user_id);
        array_push($comments_array, ['id' => $comment->id, "user" => $user, "comment" => $comment->comment]);
    }
    return $comments_array;
});

Route::post('/post_comment', function(Request $request) {
    $user_id = $request->userId;
    $match_id = $request->matchId;
    $comment = $request->comment;
    Comment::create([
        "user_id" => $user_id,
        "match_id" => $match_id,
        "comment" => $comment,
    ]);
    return response()->json(["message" => "post comment success"], 200);
});