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
use App\Models\Comment;
use DateTime;

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
     * @param int limit
     * @param int match_id
     * 
     * @return array ["maxPage" => int, "resentPostTime" => string]
     */
    public function state(Request $request)
    {
        $matchId = $request->match_id;
        $limit = $request->limit;
        try {
            $resentComment = Comment::latest()->first();
            $timestamp = strtotime($resentComment->created_at);
            $formattedCreatedAt = date('Y-m-d H:i:s', $timestamp);

            $commentsCount = Comment::where('match_id', $matchId)->count();
            $maxPage = ceil($commentsCount / $limit);

            return ["maxPage" => $maxPage, "resentPostTime" => $formattedCreatedAt];
        } catch (\Exception $e) {
            return $this->responseInvalidQuery('Failed fetch comments count');
        }
    }

    /**
     * 新しいコメントの取得
     * created_at以降に投稿されたコメントの取得
     *
     * @param int match_id
     * @param string created_at
     *
     * @return CommentResource[]|JsonResponse
     */
    public function new(Request $request)
    {
        $matchId = $request->match_id;
        $createdAt = $request->created_at;
        try {
            $comments = $this->commentService->fetchNewComments($matchId, $createdAt);
            return CommentResource::collection($comments);
        } catch (\QueryException $e) {
            \Log::error("Error on database by fetch new comments" . $e->getMessage());
            return $this->responseInvalidQuery('Unexpected error');
        } catch (\Exception) {
            return $this->responseInvalidQuery('Failed fetch new comments');
        }
    }

    /**
     * 指定の範囲の試合コメントを取得
     *
     * @param int match_id
     * @param int page
     * @param int limit
     * @param string create_at
     *
     * @return CommentResource[]|JsonResponse
     */
    public function index(Request $request)
    {
        $matchId = $request->match_id;
        $page = $request->page;
        $limit = $request->limit;
        $createdAt = $request->created_at;

        try {
            $comments = $this->commentService->fetchComments($matchId, $page, $limit, $createdAt);
            return CommentResource::collection($comments);
        } catch (QueryException $e) {
            \Log::error("Error on database by fetch comments" . $e->getMessage());
            return $this->responseInvalidQuery('Unexpected error');
        } catch (\Exception) {
            return $this->responseInvalidQuery('Failed get comments');
        }
    }

    /**
     * 試合へのコメント一覧の取得
     *
     * @param int match_id
     * @return CommentResource[]|JsonResponse
     */
    public function old(Request $request)
    {
        $matchId = $request->query('match_id');
        try {
            $commentsOnMatch = $this->commentRepository->getCommentsOnMatchByMatchId($matchId);
        } catch (QueryException $e) {
            \Log::error("Database error with get comments" . $e->getMessage());
            return $this->responseInvalidQuery('Unexpected error');
        } catch (Exception $e) {
            return $this->responseInvalidQuery('Failed get comments');
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
        } catch (\Exception $e) {
            if ($e->getCode() === 41) {
                return $this->responseUnauthorized($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed post comment");
        };

        return $this->responseSuccessful("Comment has post");
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
