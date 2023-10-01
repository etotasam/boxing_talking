<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\MatchService;
use App\Services\AuthService;

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
     * @param string range = null
     * @return JsonResponse
     */
    public function fetch(Request $request): JsonResponse
    {
        return $this->matchService->fetchMatches($request->range);
    }

    /**
     * @param array matchDataForStoreArray
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        return $this->matchService->storeMatch($request->toArray());
    }

    /**
     * @param  match_id number
     * @return JsonResponse
     */
    public function delete(Request $request): JsonResponse
    {
        return $this->matchService->deleteMatch($request->match_id);
    }

    /**
     * update
     *
     * @param  match_id number
     * @param  update_match_data object(only update data)
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        try {
            $requestArray = $request->toArray();
            $matchID = $requestArray['match_id'];
            //?リクエストから変更対象を取得
            $updateMatchData = $requestArray['update_match_data'];
            //?試合の取得
            $match = $this->matchService->getSingleMatch($matchID);
            DB::beginTransaction();
            $this->matchService->deleteTitleMatch($matchID);
            if (isset($updateMatchData['titles'])) {
                $this->matchService->storeMatchAndStoreTitleMatches($updateMatchData['titles'], $matchID);
                unset($updateMatchData['titles']);
            }
            $match->update($updateMatchData);
            DB::commit();
            return response()->json(["success" => true, "message" => "Success update match data"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => "Failed update match"], 500);
        }
    }

    // public function test(Request $request)
    // {
    //     try {
    //         $auth = Auth::User();
    //         if ($auth) {
    //             $authUserID = Auth::User()->id;
    //         } else {
    //             throw new Exception("No auth", 401);
    //         }
    //         $isAdmin = Administrator::where("user_id", $authUserID)->exists();
    //         if (!$isAdmin) {
    //             throw new Exception("unauthorize", 406);
    //         }
    //     } catch (Exception $e) {
    //         return response()->json(["message" => $e->getMessage()], 500);
    //     }
    // }
}
