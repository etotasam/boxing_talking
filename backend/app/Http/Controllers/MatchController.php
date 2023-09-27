<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
// Models
use App\Models\BoxingMatch;
use App\Models\TitleMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\WinLossPrediction;
use App\Models\Administrator;
use Exception;
//Service
use App\Services\MatchService;
use App\Services\AuthService;

class MatchController extends Controller
{

    public function __construct(
        BoxingMatch $match,
        Boxer $boxer,
        TitleMatch $titleMatch,
        MatchService $matchService,
        AuthService $authService,
        Comment $comment,
        WinLossPrediction $winLossPrediction
    ) {
        $this->match = $match;
        $this->boxer = $boxer;
        $this->titleMatch = $titleMatch;
        $this->matchService = $matchService;
        $this->authService = $authService;
        $this->comment = $comment;
        $this->winLossPrediction = $winLossPrediction;
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
            $matches = $this->matchService->getMatches($range);
            $formattedMatches = $this->matchService->formatMatches($matches);
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
            $createdMatch = $this->match->create($registerMatch);

            $this->matchService->createTitleOfMatch($organizationsArray, $createdMatch["id"]);
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
            //? 試合の削除
            $this->matchService->deleteMatch($matchID);
            //? 削除対象の試合に付いているコメントを削除
            $this->comment->where("match_id", $matchID)->delete();
            //? 削除対象の試合に付いている勝敗予想を削除
            $this->winLossPrediction->where("match_id", $matchID)->delete();
            //? 削除対象の試合に付いているタイトルを削除
            $this->matchService->deleteTitleMatch($matchID);
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
            $match = $this->matchService->getSingleMatch($matchID);
            DB::beginTransaction();
            //?リクエストから変更対象を取得
            $updateMatchData = $requestArray['update_match_data'];
            \Log::error($updateMatchData);
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

    public function test(Request $request)
    {
        try {
            $auth = Auth::User();
            if ($auth) {
                $authUserID = Auth::User()->id;
            } else {
                throw new Exception("No auth", 401);
            }
            $isAdmin = Administrator::where("user_id", $authUserID)->exists();
            if (!$isAdmin) {
                throw new Exception("unauthorize", 406);
            }
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
}
