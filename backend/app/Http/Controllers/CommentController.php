<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Services\CommentService;
use App\Repository\MatchRepository;
use App\Http\Requests\CommentRequest;
use App\Http\Resources\CommentResource;


class CommentController extends Controller
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
        try {
            $matchId = $request->query('match_id');
            // 試合が存在しない場合はエラー
            $match = MatchRepository::get($matchId);
            if (!$match) {
                throw new Exception("Match is not exists", 404);
            }
            //BoxingMatchモデルのhasMany()で、データを降順で取得
            $commentsOnMatch = $match->comments()->orderBy('created_at', 'desc')->get();
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode() ?: 500);
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

        try {
            if (!MatchRepository::isMatchExists($matchId)) {
                throw new Exception('Cant post comment to not exists match', 404);
            }
            $userId = $this->authService->getUserIdOrGuestUserId();
            $this->commentService->postComment($userId, $matchId, $comment);
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode() ?: 500);
        };

        return response()->json(["success" => true, "message" => "posted comment successfully"], 200);
    }
}
