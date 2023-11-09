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
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CommentController extends ApiController
{
    public function __construct(
        protected MatchService $matchService,
        protected CommentService $commentService,
        protected AuthService $authService,
        protected MatchRepositoryInterface $matchRepository,
        protected CommentRepositoryInterface $commentRepository
    ) {
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
        try {
            $commentsOnMatch = $this->commentRepository->getCommentsOnMatchByMatchId($matchId);
        } catch (QueryException $e) {
            \Log::error($e->getMessage());
            return $this->responseInvalidQuery('Invalid query');
        }

        return CommentResource::collection($commentsOnMatch);
    }

    /**
     * 試合へのコメント投稿
     * errorCode 41 認証なし
     * @param int match_id
     * @param string comment
     * @return JsonResponse
     */
    public function store(CommentRequest $request)
    {
        $matchId = $request->match_id;
        $comment = $request->comment;

        if (!$this->matchRepository->isMatch($matchId)) {
            return $this->responseNotFound('Can not find The match to post comment');
        }
        try {
            $userId = $this->authService->getUserIdOrGuestUserId();
            $this->commentService->postCommentExecute($userId, $matchId, $comment);
        } catch (HttpException $e) {
            return $this->responseInvalidQuery("Invalid query");
        } catch (\Exception $e) {
            if ($e->getCode() === 41) {
                return $this->responseUnauthorized("No auth");
            }
        };

        return $this->responseSuccessful("Comment has been post");
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
