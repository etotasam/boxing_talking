<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

// Models
use App\Models\BoxingMatch;
use App\Models\User;
use App\Models\Comment;
use App\Models\Vote;

class CommentController extends Controller
{

    /**
     * fetch all comments from DB
     *
     * @param int match_id
     * @return \Illuminate\Http\Response
     */
    public function fetch(Request $request)
    {
        $match_id = $request->match_id;
        $comments_array = [];
        $comments = BoxingMatch::find($match_id)->comments;
        foreach($comments as $comment) {
            $user_id = $comment->user_id;
            $created_at = $comment->created_at;
            $user = User::find($user_id);
            $vote = Vote::where([["user_id", $user_id], ["match_id", $match_id]])->first();
            if(isset($vote)) {
                $vote_color = $vote["vote_for"];
            }else {
                $vote_color = Null;
            }
            array_unshift($comments_array, ['id' => $comment->id, "user" => $user, "comment" => $comment->comment, "vote" => $vote_color, "created_at" => $created_at]);
        }
        return $comments_array;
    }

    /**
     * post comment
     *
     * @param int user_id
     * @param int match_id
     * @param string comment
     * @return \Illuminate\Http\Response
     */
    public function post(Request $request)
    {
        try {
            // throw new Exception("post comment failed");
            $user_id = $request->user_id;
            $match_id = $request->match_id;
            $comment = $request->comment;
            $has_match = BoxingMatch::find($match_id)->exists();
            if(!$has_match) {
                throw new Exception("the match not exist");
            }
            Comment::create([
                "user_id" => $user_id,
                "match_id" => $match_id,
                "comment" => $comment,
            ]);
            return response()->json(["message" => "posted comment successfully"], 200);
        } catch(Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }

    /**
     * comment delete
     *
     * @param int user_id
     * @param int comment_id
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        $user_id = $request->user_id;
        $comment_id = $request->comment_id;
        $user = Auth::user();
        if($user->id == $user_id) {
            $comment = Comment::find($comment_id);
            $comment->delete();
            return response()->json(["message" => "comment deleted"], 200);
        }
        return response()->json(["message" => "comment delete failed"], 401);
    }
}
