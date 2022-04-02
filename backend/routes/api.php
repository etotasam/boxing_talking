<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\Fighter;
use App\Models\BoxingMatch;
use Illuminate\Support\Facades\Log;
use App\Models\Comment;
use App\Models\User;
use App\Models\Vote;
use App\Jobs\SampleJob;
use GuzzleHttp\Psr7\Message;

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
    // \Log::debug($email);
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
        $element = [
            "id" => $match->id,
            "red" => $red_fighter,
            "blue" => $blue_fighter,
            "date" => $match->match_date,
            "count_red" => $match->count_red,
            "count_blue" => $match->count_blue
        ];
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
        $created_at = $comment->created_at;
        $user = User::find($user_id);
        array_unshift($comments_array, ['id' => $comment->id, "user" => $user, "comment" => $comment->comment, "created_at" => $created_at]);
    }
    return $comments_array;
});

Route::post('/post_comment', function(Request $request) {
    try {
        // throw new Exception("post comment failed");
        $user_id = $request->userId;
        $match_id = $request->matchId;
        $comment = $request->comment;
        Comment::create([
            "user_id" => $user_id,
            "match_id" => $match_id,
            "comment" => $comment,
        ]);
        return response()->json(["message" => "posted comment successfully"], 200);
    } catch(Exception $e) {
        return response()->json(["message" => $e->getMessage()], 500);
    }
});

Route::delete('/delete_comment', function(Request $request) {
    $user_id = $request->userId;
    $comment_id = $request->commentId;
    $user = Auth::user();
    if($user->id == $user_id) {
        $comment = Comment::find($comment_id);
        $comment->delete();
        return response()->json(["message" => "comment deleted"], 200);
    }
    return response()->json(["message" => "comment delete failed"], 401);
});

Route::put('/{match_id}/{vote}/vote', function(string $match_id, string $vote) {

    try{
        DB::beginTransaction();
        $user_id = Auth::user()->id;
        $match_id = intval($match_id);
        $hasVote = Vote::where([["user_id", $user_id],["match_id", $match_id]])->first();
        if($hasVote) {
            throw new Exception("Voting is not allowed. You already voted.");
        }
        Vote::create([
            "user_id" => Auth::user()->id,
            "match_id" => intval($match_id),
            "vote_for" => $vote
        ]);
        $matches = BoxingMatch::where("id", intval($match_id))->first();
        if($vote == "red") {
            $matches->increment("count_red");
        }else if($vote == "blue") {
            $matches->increment("count_blue");
        }
        $matches->save();
        DB::commit();
        return ["message" => "voted successfully"];
        return response()->json(["message" => "success vote"],200);
    }catch (Exception $e) {
        DB::rollBack();
        return response()->json(["message" => $e->getMessage()],406);
    }
});

Route::get("/{match_id}/check_vote", function(string $match_id) {
    // return $match_id;
    $user_id = Auth::user()->id;
    $match_id = intval($match_id);
    $has_vote = Vote::where([["user_id", $user_id],["match_id", $match_id]])->first();
    $test = Auth::user()->votes;
    return $test;
});

Route::post("get_votes", function(Request $request) {
    $votes =User::find($request->userId)->votes;
    return $votes;
});

Route::put("/{id}/test", function($id = null) {
    $data = "";
    if($id !== null) {
        $user = User::find($id);
    }else {
        $user = null;
    }

    if ($user != null) {
        // SampleJob::dispatch($user)->delay(now()->addMinutes(1));
        SampleJob::dispatch($user)->onQueue('name');
        $data = User::all();
    }else {
        $data = "ログインしてね";
    }

    return response()->json($data);
});