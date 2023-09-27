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

class MatchController extends Controller
{

    public function __construct(BoxingMatch $match, Boxer $boxer, TitleMatch $titleMatch, MatchService $matchService)
    {
        $this->match = $match;
        $this->boxer = $boxer;
        $this->titleMatch = $titleMatch;
        $this->matchService = $matchService;
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
            // ? まず管理者かどうかを確認する
            $authUserID = Auth::User()->id;
            $isAdmin = Administrator::where("user_id", $authUserID)->exists();
            if (!$isAdmin) {
                throw new Exception("unauthorize", 406);
            }

            $matchID = $request->match_id;
            DB::beginTransaction();
            //? 削除対象の試合に付いているコメントを削除する
            Comment::where("match_id", $matchID)->delete();
            //? 削除対象の試合に付いている勝敗予想を削除する
            WinLossPrediction::where("match_id", $matchID)->delete();

            //? 削除対象の試合に付いているタイトルを削除
            $titles = $this->titleMatch->where('match_id', $matchID)->get();
            if (!$titles->isEmpty()) {
                $idsToDelete = $titles->pluck('match_id')->toArray();
                $this->titleMatch->whereIn('match_id', $idsToDelete)->delete();
            }

            $match = BoxingMatch::find($matchID);
            if (!isset($match)) {
                throw new Exception("not exit match");
            }
            $match->delete();
            DB::commit();
            return response()->json(["message" => "match deleted"], 200);
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
            $id = $requestArray['match_id'];
            $match = $this->match->find($id);
            if (!$match) {
                throw new Exception("Match is not exists", 404);
            }
            DB::beginTransaction();
            $updateMatchData = $requestArray['update_match_data'];
            if (isset($updateMatchData['titles'])) {
                $this->matchService->createTitleOfMatch($updateMatchData['titles'], $id);
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
    //         $id = $request->id;

    //         $match = BoxingMatch::find($id);
    //         $organizations = $match->organization;
    //         if (!empty($organizations)) {
    //             $organizationsArray = $organizations->map(function ($organization) {
    //                 return $organization->name;
    //             });
    //             return $organizationsArray;
    //         } else {
    //             return [];
    //         }
    //     } catch (Exception $e) {
    //         return response()->json(["message" => $e->getMessage()], 500);
    //     }
    // }
}
