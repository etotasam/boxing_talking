<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\MatchService;
use App\Services\AuthService;
use App\Http\Resources\BoxingMatchResource;

use function Ramsey\Uuid\v1;

class MatchController extends Controller
{

    public function __construct(
        MatchService $matchService,
        AuthService $authService,
    ) {
        $this->matchService = $matchService;
        $this->authService = $authService;
    }

    /**
     * 試合データ一覧の取得
     *
     * @param string range = null
     *
     * @return BoxingMatchResource|JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $matches =  $this->matchService->getMatches($request->query('range'));
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage() ?: "Failed get matches"], $e->getCode() ?: 500);
        }

        return BoxingMatchResource::collection($matches);
    }

    /**
     * 試合データの登録
     *
     * @param array matchDataForStoreArray
     *
     * @return JsonResponse
     */
    public function store(Request $request)
    {
        return $this->matchService->storeMatch($request->toArray());
    }

    /**
     * 試合データの削除
     *
     * @param int match_id
     *
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        return $this->matchService->deleteMatch($request->match_id);
    }

    /**
     * 試合データの更新
     *
     * @param  int match_id
     * @param  array update_match_data
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        return $this->matchService->updateMatch($request->match_id, $request->update_match_data);
    }
}
