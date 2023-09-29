<?php

namespace App\Http\Controllers;

use Exception;
use \Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Services\CommentService;
use App\Http\Requests\CommentRequest;


class CommentController extends Controller
{
    public function __construct(MatchService $matchService, CommentService $commentService, AuthService $authService)
    {
        $this->matchService = $matchService;
        $this->commentService = $commentService;
        $this->authService = $authService;
    }

    /**
     *
     * @param int match_id
     * @return \Illuminate\Http\Response
     */
    public function fetch(Request $request)
    {
        try {
            $matchID = $request->match_id;
            if (!$matchID) {
                throw new Exception('Failed fetch comments', Response::HTTP_BAD_REQUEST);
            }
            $match = $this->matchService->getSingleMatchOrThrowExceptionWhenNotExists($matchID);
            $commentsOfMatch = $this->commentService->getCommentsOfMatch($match);
            return $commentsOfMatch;
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }

    /**
     *
     * @param int match_id
     * @param string comment
     * @return \Illuminate\Http\Response
     */
    public function post(CommentRequest $request)
    {
        try {
            $userID = $this->authService->getUserIdOrThrowExceptionWhenNotExists();
            $matchID = $request->match_id;
            //? 試合が存在してない場合throw exception
            $this->matchService->getSingleMatchOrThrowExceptionWhenNotExists($matchID);

            $comment = $request->comment;
            $this->commentService->postCommentAndFormat($userID, $matchID, $comment);
            return response()->json(["message" => "posted comment successfully"], 200);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
