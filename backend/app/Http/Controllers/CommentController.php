<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
// Models
use App\Models\BoxingMatch;
use App\Models\User;
use App\Models\Comment;
use Exception;

use \Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\CommentRequest;

class CommentController extends Controller
{
    /**
     * fetch all comments
     *
     * @param int match_id
     * @return \Illuminate\Http\Response
     */
    public function fetch(Request $request)
    {
        try {
            // throw new Exception("fetch comment failed");
            $matchID = $request->match_id;
            $arrayComments = [];
            if (!$matchID) {
                throw new Exception('Failed fetch comments', Response::HTTP_BAD_REQUEST);
            }
            $match = BoxingMatch::find($matchID);
            if ($match) {
                $thisMatchComments = $match->comments;
            } else {
                throw new Exception('Match is not exits', Response::HTTP_NOT_FOUND);
            }
            foreach ($thisMatchComments as $commentData) {
                $userID = $commentData->user_id;
                $createdAt = $commentData->created_at;
                $user = User::find($userID);
                if ($user) {
                    $postUserName = $user->name;
                } else {
                    $postUserName = null;
                }
                $formattedComment = nl2br(htmlspecialchars($commentData->comment));
                array_unshift($arrayComments, ['id' => $commentData->id, "post_user_name" => $postUserName, "comment" => $formattedComment, "created_at" => $createdAt]);
            }
            return $arrayComments;
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
            if (Auth::check()) {
                $userID = Auth::user()->id;
            } else if (Auth::guard('guest')->check()) {
                $userID = (string)Auth::guard('guest')->user()->id;
            } else {
                throw new Exception("Posting comments require Login", Response::HTTP_UNAUTHORIZED);
            }
            $matchID = $request->match_id;
            //? 試合は存在しているか
            $match = BoxingMatch::find($matchID);
            if (!$match) {
                throw new Exception("The match is not exist", Response::HTTP_FORBIDDEN);
            }

            $comment = $request->comment;
            //? 改行は4回以上の改行は3回の改行に変更する
            $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
            Comment::create([
                "user_id" => $userID,
                "match_id" => $matchID,
                "comment" => $formattedComment,
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
        // $userID = $request->user_id;
        $commentID = $request->comment_id;
        $user = Auth::user();
        try {
            if (!$user) {
                throw new Exception('Unauthorized', Response::HTTP_UNAUTHORIZED);
            };
            $commentData = Comment::find($commentID);
            if ($commentData->user_id != $user->id) {
                throw new Exception('Forbidden', Response::HTTP_FORBIDDEN);
            }
            $commentData->delete();
            return response()->json(["message" => "Comment deleted"], Response::HTTP_OK);
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
    }
}
