<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
// models
use App\Models\User;
use App\Models\Vote;
use App\Models\BoxingMatch;

class VoteController extends Controller
{
    /**
     * fetch vote by auth user
     *
     * @return \Illuminate\Http\Response
     */
    public function fetch()
    {
        $user_id = Auth::user()->id;;
        // $user_id = $request->user_id;
        $votes =User::find($user_id)->votes;
        return $votes;
    }

    /**
     * fetch vote by auth user
     *
     * @param int match_id
     * @param string Request->vote
     * @return \Illuminate\Http\Response
     */
    public function vote(Request $request)
    {
        $match_id = $request->match_id;
        $vote = $request->vote;
        try{
            DB::beginTransaction();
            $user_id = Auth::user()->id;
            $match_id = intval($match_id);
            $hasVote = Vote::where([["user_id", $user_id],["match_id", $match_id]])->first();
            if($hasVote) {
                throw new Exception("Voting is not allowed. You already voted.");
            }
            Vote::create([
                "user_id" => Auth::user()->id,
                "match_id" => intval($match_id),
                "vote_for" => $vote
            ]);
            $matches = BoxingMatch::where("id", intval($match_id))->first();
            if($vote == "red") {
                $matches->increment("count_red");
            }else if($vote == "blue") {
                $matches->increment("count_blue");
            }
            $matches->save();
            DB::commit();
            // return ["message" => "voted successfully"];
            return response()->json(["message" => "success vote"],200);
        }catch (Exception $e) {
            DB::rollBack();
            return response()->json(["message" => $e->getMessage()],406);
        }
    }
}
