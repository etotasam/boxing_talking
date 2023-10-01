<?php

namespace App\Http\Controllers;

use Exception;
use \Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Services\CommentService;
use App\Http\Requests\CommentRequest;
use Illuminate\Http\JsonResponse;


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
     * @return JsonResponse
     */
    public function fetch(Request $request): JsonResponse
    {
        return $this->commentService->getComments($request->match_id);
    }

    /**
     *
     * @param int match_id
     * @param string comment
     * @return JsonResponse
     */
    public function post(CommentRequest $request): JsonResponse
    {
        return $this->commentService->postComment($request->match_id, $request->comment);
    }
}
