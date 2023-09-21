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
            $red_id = $item->red_boxer_id;
            $blue_id = $item->blue_boxer_id;
            $red_boxer = Boxer::find($red_id);
            $blue_boxer = Boxer::find($blue_id);
            $titles = $item->titles;

            return  [
                "id" => $item->id,
                "red_boxer" => $red_boxer,
                "blue_boxer" => $blue_boxer,
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
            $red_id = $item->red_boxer_id;
            $blue_id = $item->blue_boxer_id;
            $red_boxer = Boxer::find($red_id);
            $blue_boxer = Boxer::find($blue_id);
            $titles = $item->titles;

            return  [
                "id" => $item->id,
                "red_boxer" => $red_boxer,
                "blue_boxer" => $blue_boxer,
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
     * @param  matchId number
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {

        try {
            // ? まず管理者かどうかを確認する
            $auth_user_id = Auth::User()->id;
            $is_admin = Administrator::where("user_id", $auth_user_id)->exists();
            if (!$is_admin) {
                throw new Exception("unauthorize", 406);
            }


            $match_id = $request->matchId;
            DB::beginTransaction();
            //? 削除対象の試合に付いているコメントを削除する
            Comment::where("match_id", $match_id)->delete();
            //? 削除対象の試合に付いている勝敗予想を削除する
            WinLossPrediction::where("match_id", $match_id)->delete();

            $match = BoxingMatch::find($match_id);
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
            return response()->json(["message" => "faild while match delete"], 500);
        }
    }

    /**
     * update
     *
     * @param  \Illuminate\Http\Request  $request
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
            $update_match_data = $request->update_match_data;
            $match->update($update_match_data);
            return response()->json(["success" => true, "message" => "Success update match data"], 200);
        } catch (Exception $e) {
            return response()->json(["message" => $update_match_data], 500);
        }
    }
}
