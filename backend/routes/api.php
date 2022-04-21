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

// controller
use App\Http\Controllers\MatchController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\FighterController;

use function PHPUnit\Framework\isEmpty;

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






Route::get('/fighter',[FighterController::class, 'fetch']);
Route::post('/fighter',[FighterController::class, 'register']);
Route::put('/fighter/update', [FighterController::class, 'update']);
Route::delete('/fighter',[FighterController::class, 'delete']);

Route::get('/match', [MatchController::class, 'fetch']);
Route::post('/match/register', [MatchController::class, 'register']);
Route::delete('/match/delete', [MatchController::class, 'delete']);

Route::get('/comment', [CommentController::class, 'fetch']);
Route::post('/comment', [CommentController::class, 'store']);
Route::delete('/comment', [CommentController::class, 'delete']);

Route::get('/vote/{user_id}', [VoteController::class, 'fetch']);

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
        // return ["message" => "voted successfully"];
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