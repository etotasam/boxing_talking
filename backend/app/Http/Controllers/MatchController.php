<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// Models
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\WinLossPrediction;
use App\Models\Administrator;
use Exception;

use \Symfony\Component\HttpFoundation\Response;

class MatchController extends Controller
{

    public function __construct(BoxingMatch $match)
    {
        $this->match = $match;
    }

    // ! 保有タイトルを配列にして返す
    protected function toArrayTitles($boxer)
    {
        if (empty($boxer->title_hold)) {
            $boxer->title_hold = [];
        } else {
            $boxer->title_hold = explode('/', $boxer->title_hold);
        };
        return $boxer;
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
            if ($range == "all") {
                if (Auth::user()->administrator) {
                    $matches = BoxingMatch::orderBy('match_date')->get();
                } else {
                    return response()->json(["success" => false, "message" => "Cannot get all matches without auth administrator"], 401);
                }
            } else if ($range == "past") {
                $fetchRange = date('Y-m-d', strtotime('-1 week'));
                $matches = BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();
            } else {
                $fetchRange = date('Y-m-d', strtotime('-1 week'));
                $matches = BoxingMatch::where('match_date', '>', $fetchRange)->orderBy('match_date')->get();
            }

            $formattedMatches = $matches->map(function ($item, $key) {
                $redID = $item->red_boxer_id;
                $blueID = $item->blue_boxer_id;
                $redBoxer = Boxer::find($redID);
                $blueBoxer = Boxer::find($blueID);
                $titles = $item->titles;

                return  [
                    "id" => $item->id,
                    "red_boxer" => $redBoxer,
                    "blue_boxer" => $blueBoxer,
                    "country" => $item->country,
                    "venue" => $item->venue,
                    "grade" => $item->grade,
                    "titles" => $titles,
                    "weight" => $item->weight,
                    "match_date" => $item->match_date,
                    "count_red" => $item->count_red,
                    "count_blue" => $item->count_blue
                ];
            });
            return response()->json($formattedMatches);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * fetch past matches from DB
     *
     * @return \Illuminate\Http\Response
     */
    public function fetchArchiveMatches()
    {
        // throw new Exception();

        // \Log::debug();
        //? 管理者の場合のみ過去の試合を含めすべての試合を取得する
        $fetchRange = date('Y-m-d', strtotime('-1 week'));
        $matches = BoxingMatch::where('match_date', '<', $fetchRange)->orderBy('match_date')->get();

        $formattedMatches = $matches->map(function ($item, $key) {
            $redID = $item->red_boxer_id;
            $blueID = $item->blue_boxer_id;
            $redBoxer = Boxer::find($redID);
            $blueBoxer = Boxer::find($blueID);
            $titles = $item->titles;

            return  [
                "id" => $item->id,
                "red_boxer" => $redBoxer,
                "blue_boxer" => $blueBoxer,
                "country" => $item->country,
                "venue" => $item->venue,
                "grade" => $item->grade,
                "titles" => $titles,
                "weight" => $item->weight,
                "match_date" => $item->match_date,
                "count_red" => $item->count_red,
                "count_blue" => $item->count_blue
            ];
        });
        return response()->json($formattedMatches);
    }

    /**
     * register match.
     *
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        try {
            $match = $request->all();
            try {
                $this->match->create($match);
            } catch (Exception $e) {
                throw new Exception("Catch error when register");
            }
            return response()->json(["message" => "success"], 200);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], Response::HTTP_NOT_IMPLEMENTED);
            }
        };
        return response()->json(["message" => " Failed match register"], 500);
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
            $id = $request->match_id;
            $match = $this->match->find($id);
            if (!$match) {
                return response()->json(["success" => false, "message" => "Match is not exists"], 404);
            }
            $updateMatchData = $request->update_match_data;
            $match->update($updateMatchData);
            return response()->json(["success" => true, "message" => "Success update match data"], 200);
        } catch (Exception $e) {
            return response()->json(["message" => $updateMatchData], 500);
        }
    }
}
