<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Services\CommentService;
use App\Repository\MatchRepository;
use App\Http\Requests\CommentRequest;
use App\Http\Resources\CommentResource;


class CommentController extends ApiController
{
    public function __construct(MatchService $matchService, CommentService $commentService, AuthService $authService)
    {
        $this->matchService = $matchService;
        $this->commentService = $commentService;
        $this->authService = $authService;
    }

    /**
     * 試合へのコメント一覧の取得
     *
     * @param int match_id
     * @return CommentResource[]|JsonResponse
     */
    public function index(Request $request)
    {
        $matchId = $request->query('match_id');
        // 試合が存在しない場合はエラー
        $match = MatchRepository::get($matchId);
        if (!$match) {
            return $this->responseNotFound("Match is not exists");
        }
        //BoxingMatchモデルのhasMany()で、データを降順で取得
        try {
            $commentsOnMatch = $match->comments()->orderBy('created_at', 'desc')->get();
        } catch (\Exception $e) {
            $this->responseInvalidQuery("Failed get comments on the match");
        }

        return CommentResource::collection($commentsOnMatch);
    }

    /**
     * 試合へのコメント投稿
     *
     * @param int match_id
     * @param string comment
     * @return JsonResponse
     */
    public function store(CommentRequest $request)
    {
        $matchId = $request->match_id;
        $comment = $request->comment;

        if (!MatchRepository::isMatchExists($matchId)) {
            return $this->responseNotFound('Cant post comment to not exists match');
        }
        $userId = $this->authService->getUserIdOrGuestUserId();
        try {
            $this->commentService->postComment($userId, $matchId, $comment);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery("Failed when post comment");
        };

        return $this->responseSuccessful("Success post comment");
    }
}
