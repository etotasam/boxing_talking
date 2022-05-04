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
    public function fetch()
    {
        try{
            $fighters = Fighter::all();
            return response()->json($fighters, 200);
        }catch(Exception $e) {
            return response()->json(["message" => "faild fetch Fighters"], 500);
        }
    }

    /**
     * fetch fighters data from DB
     *
     * @param \Illuminate\Http\Request
     */
    public function register(Request $request)
    {
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
    public function update(Request $request)
    {
        // throw new Exception();
        $id = $request->id;
        $update_fighter_data = $request->toArray();
        try{
            Fighter::find($id)->update($update_fighter_data);
            return response()->json(["message" => "fighter updated"], 200);
        }catch(Exception $e) {
            return response()->json(["message" => "faild fighter update"], 500);
        }
    }
}
