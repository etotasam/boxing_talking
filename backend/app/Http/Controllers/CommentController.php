<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

// Models
use App\Models\BoxingMatch;
use App\Models\User;
use App\Models\GuestUser;
use App\Models\Comment;
use App\Models\WinLossPrediction;
use Exception;

use \Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\CommentRequest;

class CommentController extends Controller
{



    public function test_fetch(Request $request)
    {
        // return $request->limt;
        $offset = $request->offset;
        $limt = $request->limt;
        $match_id = $request->match_id;
        $comments_array = [];
        if (!$match_id) {
            throw new Exception('Failed fetch comments', Response::HTTP_BAD_REQUEST);
        }
        $match = BoxingMatch::find($match_id);
        if ($match) {
            $comments_on_match = $match->comments->skip($offset)->take($limt);
        } else {
            throw new Exception('Match is not exits', Response::HTTP_NOT_FOUND);
        }
        foreach ($comments_on_match as $comment) {
            $user_id = $comment->user_id;
            $created_at = $comment->created_at;
            $user = User::find($user_id);
            $post_user_name = $user->name;
            // $prediction = WinLossPrediction::where([["user_id", $user_id], ["match_id", $match_id]])->first();
            // if (isset($vote)) {
            //     $prediction_color = $prediction["prediction"];
            // } else {
            //     $prediction_color = Null;
            // }
            $formatted_comment = nl2br(htmlspecialchars($comment->comment));
            array_unshift($comments_array, ['id' => $comment->id, "post_user_name" => $post_user_name, "comment" => $formatted_comment, "created_at" => $created_at]);
        }
        return $comments_array;
    }

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
                if ($user) {
                    $post_user_name = $user->name;
                } else {
                    $post_user_name = null;
                }
                // $prediction = WinLossPrediction::where([["user_id", $user_id], ["match_id", $match_id]])->first();
                // if (isset($vote)) {
                //     $prediction_color = $prediction["prediction"];
                // } else {
                //     $prediction_color = Null;
                // }
                $formatted_comment = nl2br(htmlspecialchars($comment->comment));
                array_unshift($comments_array, ['id' => $comment->id, "post_user_name" => $post_user_name, "comment" => $formatted_comment, "created_at" => $created_at]);
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
     * @param int match_id
     * @param string comment
     * @return \Illuminate\Http\Response
     */
    public function post(CommentRequest $request)
    {
        try {
            // $is_auth = Auth::user();
            // if (!$is_auth) {
            //     throw new Exception("Posting comments require Login", Response::HTTP_UNAUTHORIZED);
            // }
            if (Auth::check()) {
                $user_id = Auth::user()->id;
            } else if (Auth::guard('guest')->check()) {
                $user_id = (string)Auth::guard('guest')->user()->id;
            } else {
                throw new Exception("Posting comments require Login", Response::HTTP_UNAUTHORIZED);
            }
            $match_id = $request->match_id;
            //? 試合は存在しているか
            $has_match = BoxingMatch::find($match_id);
            if (!$has_match) {
                throw new Exception("The match is not exist", Response::HTTP_FORBIDDEN);
            }

            $comment = $request->comment;
            //? 改行は4回以上の改行は3回の改行に変更する
            $formatted_comment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
            Comment::create([
                "user_id" => $user_id,
                "match_id" => $match_id,
                "comment" => $formatted_comment,
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

//? コメント投稿のvalidation
function sanitizeComment($commentText)
{
    // 前後の空白をトリム
    $commentText = trim($commentText);

    // 4つ以上の連続した改行を3つに置き換え
    $commentText = preg_replace('/(\r?\n){4,}/', "\n\n\n", $commentText);

    return $commentText; // 改行を置き換えたコメント
}
