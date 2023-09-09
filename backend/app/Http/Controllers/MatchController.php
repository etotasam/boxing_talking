<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// Models
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\Vote;
use Exception;

class MatchController extends Controller
{



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
    public function fetch()
    {
        // throw new Exception();

        // \Log::debug();
        //? 管理者の場合のみ過去の試合を含めすべての試合を取得する
        if (Auth::user() && Auth::user()->administrator) {
            $all_match = BoxingMatch::orderBy('match_date')->get();
        } else {
            $today = date('Y-m-d', strtotime('-2 week'));
            $all_match = BoxingMatch::where('match_date', '>', $today)->orderBy('match_date')->get();
        }

        $matches = $all_match->map(function ($item, $key) {
            $red_id = $item->red_boxer_id;
            $blue_id = $item->blue_boxer_id;
            $red_boxer = Boxer::find($red_id);
            $blue_boxer = Boxer::find($blue_id);
            $titles = $item->titles;

            $formatted_red_boxer = $this->toArrayTitles($red_boxer);
            $formatted_blue_boxer = $this->toArrayTitles($blue_boxer);


            if (empty($titles)) {
                $formatted_titles = [];
            } else {
                $formatted_titles = explode('/', $titles);
            };

            return  [
                "id" => $item->id,
                "red_boxer" => $formatted_red_boxer,
                "blue_boxer" => $formatted_blue_boxer,
                "country" => $item->country,
                "venue" => $item->venue,
                "grade" => $item->grade,
                "titles" => $formatted_titles,
                "weight" => $item->weight,
                "match_date" => $item->match_date,
                "count_red" => $item->count_red,
                "count_blue" => $item->count_blue
            ];
        });
        return response()->json($matches);
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
            // $match = $request->all();
            // ! 配列で受けた保有タイトルを文字列に変換する
            $titles = implode('/', $match["titles"]);
            if (empty($titles)) {
                $match['titles'] = null;
            } else {
                $match['titles'] = $titles;
            }
            \Log::info($match);
            $query = BoxingMatch::create($match);
            \Log::debug($query->toSql());
            return response()->json(["message" => "success"], 200);
        } catch (Exception $e) {
            return response()->json(["message" => "faild match register"], 500);
        }
    }

    /**
     * Delete resource from DB
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        $match_id = $request->matchId;
        try {
            DB::beginTransaction();
            //? 削除対象の試合に付いているコメントを削除する
            Comment::where("match_id", $match_id)->delete();
            //? 削除対象の試合に付いている勝敗予想を削除する
            Vote::where("match_id", $match_id)->delete();

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
        $id = $request->match_id;
        $update_match_data = $request->update_match_data;
        // throw new Exception();
        try {
            BoxingMatch::find($id)->update($update_match_data);
        } catch (Exception $e) {
            return response()->json(["message" => "failed update match"], 500);
        }
    }
}
