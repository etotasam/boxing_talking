<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

// Models
use App\Models\BoxingMatch;
use App\Models\User;
use App\Models\Comment;
use App\Models\WinLossPrediction;
use Exception;

use \Symfony\Component\HttpFoundation\Response;

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
        try {
            // throw new Exception("fetch comment failed");
            $match_id = $request->match_id;
            $comments_array = [];
            if (!$match_id) {
                throw new Exception('Failed fetch comments', Response::HTTP_BAD_REQUEST);
            }
            $match = BoxingMatch::find($match_id);
            if ($match) {
                $comments_on_match = $match->comments;
            } else {
                throw new Exception('Match is not exits', Response::HTTP_NOT_FOUND);
            }
            foreach ($comments_on_match as $comment) {
                $user_id = $comment->user_id;
                $created_at = $comment->created_at;
                $user = User::find($user_id);
                $post_user_name = $user->name;
                $prediction = WinLossPrediction::where([["user_id", $user_id], ["match_id", $match_id]])->first();
                if (isset($vote)) {
                    $prediction_color = $prediction["prediction"];
                } else {
                    $prediction_color = Null;
                }
                $formatted_comment = nl2br(htmlspecialchars($comment->comment));
                array_unshift($comments_array, ['id' => $comment->id, "post_user_name" => $post_user_name, "comment" => $formatted_comment, "prediction" => $prediction_color, "created_at" => $created_at]);
            }
            return $comments_array;
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], 500);
        }
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
            $is_auth = Auth::user();
            if (!$is_auth) {
                throw new Exception("Posting comments require Login", Response::HTTP_UNAUTHORIZED);
            }
            $user_id = Auth::user()->id;
            $match_id = $request->match_id;
            $comment = $request->comment;
            $has_match = BoxingMatch::find($match_id)->exists();
            if (!$has_match) {
                throw new Exception("The match is not exist", Response::HTTP_FORBIDDEN);
            }
            Comment::create([
                "user_id" => $user_id,
                "match_id" => $match_id,
                "comment" => $comment,
            ]);
            return response()->json(["message" => "posted comment successfully"], 200);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * comment delete
     *
     * @param int comment_id
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        // $user_id = $request->user_id;
        $comment_id = $request->comment_id;
        $user = Auth::user();
        try {
            if (!$user) {
                throw new Exception('Unauthorized', Response::HTTP_UNAUTHORIZED);
            };
            $comment_data = Comment::find($comment_id);
            if ($comment_data->user_id != $user->id) {
                throw new Exception('Forbidden', Response::HTTP_FORBIDDEN);
            }
            $comment_data->delete();
            return response()->json(["message" => "Comment deleted"], Response::HTTP_OK);
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }
}
