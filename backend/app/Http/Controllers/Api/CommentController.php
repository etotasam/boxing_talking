<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Services\CommentService;
// use App\Repositories\MatchRepository;
use App\Http\Requests\CommentRequest;
use App\Http\Resources\CommentResource;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;


class CommentController extends ApiController
{
    protected $matchService;
    protected $commentService;
    protected $authService;
    protected $matchRepository;
    protected $commentRepository;
    public function __construct(
        MatchService $matchService,
        CommentService $commentService,
        AuthService $authService,
        MatchRepositoryInterface $matchRepository,
        CommentRepositoryInterface $commentRepository
    ) {
        $this->matchService = $matchService;
        $this->commentService = $commentService;
        $this->authService = $authService;
        $this->matchRepository = $matchRepository;
        $this->commentRepository = $commentRepository;
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
        if (!$this->matchRepository->isMatch($matchId)) {
            return $this->responseNotFound("Match is not exists");
        }
        try {
            $commentsOnMatch = $this->commentRepository->getCommentsOnMatchByMatchId($matchId);
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

        if (!$this->matchRepository->isMatch($matchId)) {
            return $this->responseNotFound('Cant post comment to not exists match');
        }
        $userId = $this->authService->getUserIdOrGuestUserId();
        try {
            $this->commentService->postCommentExecute($userId, $matchId, $comment);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed when post comment");
        };

        return $this->responseSuccessful("Success post comment");
    }

    /**
     * コメント削除
     *
     * @param int comment_id
     * @return bool
     */
    public function destroy(\App\Models\Comment $comment)
    {
        return $comment->delete();
    }
}
