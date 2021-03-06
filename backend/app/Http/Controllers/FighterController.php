<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// Models
use App\Models\Fighter;

class FighterController extends Controller
{
    /**
     * fetch fighters data from DB
     *
     * @return array 選手情報
     */
    public function fetch(Request $request)
    {
        try{
            $limit = $request->limit;
            $page = $request->page;
            $name = $request->name;
            $country = $request->country;

            if(!isset($page)) $page = 1;
            $under = ($page - 1) * $limit;

            $arr_word = compact("name", "country");
            $arr_query = array_map(function($key, $value) {
                if(isset($value)) {
                    if($key == 'name') {
                        return [$key, 'like', "%". addcslashes($value, '%_\\') ."%"];
                    }else {
                        return [$key, 'like', $value];
                    }
                }
            },array_keys($arr_word), array_values($arr_word));

            $like_querys = array_filter($arr_query, function($el) {
                if(isset($el)) {
                    return $el;
                }
            });

            $fighters_count = Fighter::where($like_querys)->count();
            // \Log::debug($fighters_count);
            $fighters = Fighter::where($like_querys)->offset($under)->limit($limit)->get();
            $value = compact("fighters", "fighters_count");

            return response()->json($value, 200);
        }catch(Exception $e) {
            return response()->json(["message" => "faild fetch Fighters"], 500);
        }
    }


    /**
     * count fighters
     *
     * @return int 選手の数
     */
    public function count()
    {
        try{
            $count = Fighter::all()->count();

            // \Log::debug($count);
            return response()->json($count, 200);
        }catch(Exception $e) {
            return response()->json(["message" => "faild get count fighters"], 500);
        }
    }

    /**
     * fetch fighters data from DB
     *
     * @param \Illuminate\Http\Request
     */
    public function register(Request $request)
    {
        // throw new Exception();
        $fighter = $request->toArray();
        try {
            Fighter::create($fighter);
            return response()->json(["message" => "created fighter"], 200);
        }catch (Exception $e) {
            return response()->json(["message" => "faild register"], 500);
        }
    }

    /**
     * delete fighter in DB
     *
     * @param
     */
    public function delete(Request $request)
    {
        // throw new Exception();
        try {
            $id = $request->fighterId;
            $fighter = Fighter::find($id);
            $fighter->delete();
            return response()->json(["message" => "fighter deleted"], 200);
        }catch(Exception $e) {
            return response()->json(["message" => "delete error"], 500);
        }
    }

    /**
     * update fighter data
     *
     * @param
     */
    public function update(Request $request): void
    {
        // throw new Exception();
        $id = $request->id;
        $update_fighter_data = $request->toArray();
        try{
            Fighter::find($id)->update($update_fighter_data);
            // return response()->json(["message" => "fighter updated"], 200);
        }catch(Exception $e) {
            // return response()->json(["message" => "faild fighter update"], 500);
        }
    }
}
