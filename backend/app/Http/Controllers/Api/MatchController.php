<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\MatchService;
use App\Services\AuthService;
use App\Http\Resources\BoxingMatchResource;
use App\Models\BoxingMatch;

class MatchController extends ApiController
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
            $matches =  $this->matchService->getMatchesExecute($request->query('range'));
        } catch (Exception $e) {
            if ($e->getCode() === 401) {
                return $this->responseUnauthorized($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed get matches");
        }

        return BoxingMatchResource::collection($matches);
    }

    /**
     * idで指定の試合データの取得
     *
     * @param BoxingMatch $match
     *
     * @return BoxingMatchResource
     */
    public function show(BoxingMatch $match)
    {
        return new BoxingMatchResource($match);
    }

    /**
     * 試合データの登録
     *
     * @param array [
     *  'match_date' => '2023-10-18',
     *  'red_boxer_id' => 45,
     *  'blue_boxer_id' => 43,
     *  'grade' => 'タイトルマッチ',
     *  'country' => 'Mexico',
     *  'venue' => '会場',
     *  'weight' => 'クルーザー',
     *  'titles' => [
     *      0 => 'WBC暫定',
     *      1 => 'WBO暫定',
     *   ],
     *  ]
     *
     * @return JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $this->matchService->storeMatch($request->toArray());
        } catch (\Exception $e) {
            return $this->responseInvalidQuery($e->getMessage ?? "Failed when store match");
        }
        return $this->responseSuccessful("Success store match");
    }

    /**
     * 試合データの削除
     *
     * @param int match_id
     *
     * @return JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $this->matchService->deleteMatchExecute($request->match_id);
        } catch (\Exception $e) {
            if ($e->getCode() === 404) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed delete match");
        }
        return $this->responseSuccessful("Success match delete");
    }

    /**
     * 試合データの更新
     *
     * @param  int match_id
     * @param  array update_match_data
     * @return JsonResponse
     */
    public function update(Request $request)
    {
        try {
            $this->matchService->updateMatch($request->match_id, $request->update_match_data);
        } catch (\Exception $e) {
            if ($e->getCode() === 404) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed update match");
        }

        return $this->responseSuccessful("Success update match");
    }
}
