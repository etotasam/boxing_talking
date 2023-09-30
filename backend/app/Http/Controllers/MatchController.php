<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Administrator;
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
     * fetch all matches from DB
     *
     * @return \Illuminate\Http\Response
     */
    public function fetch(Request $request)
    {
        try {
            $range = $request->range;
            $formattedMatches = $this->matchService->getAndFormatMatches($range);
            return response()->json($formattedMatches);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * register match.
     *
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        try {
            DB::beginTransaction();
            $registerMatch = $request->toArray();
            $organizationsArray = $this->matchService->getOrganizationsArray($registerMatch);
            unset($registerMatch['titles']);
            $this->matchService->createMatchWithTitles($organizationsArray, $registerMatch);
            DB::commit();
            return response()->json(["message" => "success"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
        };
        return response()->json(["message" => "Failed match register"], 500);
    }

    /**
     * Delete resource from DB
     *
     * @param  match_id number
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        try {
            // ? まず管理者かどうかを確認する(なければthrow)
            $this->authService->requireAdminRole();

            $matchID = $request->match_id;
            DB::beginTransaction();
            //? 試合の削除とそれに紐づくcommentなどの関連データの削除
            $this->matchService->deleteMatchAndRelatedData($matchID);
            DB::commit();
            return response()->json(["message" => "Success match delete"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getMessage()) {
                return response()->json(["message" => $e->getMessage()], 500);
            }
            return response()->json(["message" => "Failed while match delete"], 500);
        }
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
            //?試合の取得
            $match = $this->matchService->getSingleMatchOrThrowExceptionWhenNotExists($matchID);
            DB::beginTransaction();
            //?リクエストから変更対象を取得
            $updateMatchData = $requestArray['update_match_data'];
            //?変更対象が試合のグレード(タイトルマッチ?10R or 8R...)の場合はグレードのセット
            $this->matchService->deleteTitleMatch($matchID);
            if (isset($updateMatchData['titles'])) {
                $this->matchService->createTitleOfMatch($updateMatchData['titles'], $matchID);
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
