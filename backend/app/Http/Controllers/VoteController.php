<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;
// models
use App\Models\User;
use App\Models\Vote;
use App\Models\BoxingMatch;

use \Symfony\Component\HttpFoundation\Response;

class VoteController extends Controller
{
    /**
     * fetch vote by auth user
     *
     * @return \Illuminate\Http\Response
     */
    public function fetch()
    {
        try {
            if(!Auth::user()) {
                throw new Exception('no auth', Response::HTTP_UNAUTHORIZED);
            }
            $user_id = Auth::user()->id;
            $votes =User::find($user_id)->votes;
            return $votes;
        }catch(Exception $e) {
            if($e->getCode() == Response::HTTP_UNAUTHORIZED) {
                return response()->json(["message" => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
            }
            return response()->json(["message" => "get user vote faild"], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
        try{
            if(!Auth::user()) {
                throw new Exception('no auth', Response::HTTP_UNAUTHORIZED);
            }
            $user_id = Auth::user()->id;
            $match_id = $request->match_id;
            $vote = $request->vote;
            $match_id = intval($match_id);
            DB::beginTransaction();
            //? 試合が見つからない場合は投票不可 throw error
            $is_match = BoxingMatch::find($match_id)->exists();
            if(!$is_match) {
                throw new Exception('the match not exist');
            }
            //? 試合当日以降は試合予想の投票不可 throw error
            $data = BoxingMatch::select('match_date')->where('id', $match_id)->first();
            $match_data = strtotime($data['match_date']);
            $now_date = strtotime('now');
            if($now_date > $match_data) {
                throw new Exception('can not vote after match date');
            }

            //? すでに投票済みの場合は投票不可 throw error
            $has_vote = Vote::where([["user_id", $user_id],["match_id", $match_id]])->first();
            if($has_vote) {
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
            return response()->json(["message" => "vote success"],Response::HTTP_OK);
        }catch (Exception $e) {
            DB::rollBack();
            if($e->getCode() == Response::HTTP_UNAUTHORIZED) {
                return response()->json($e->getMessage(), Response::HTTP_UNAUTHORIZED);
            }
            $error_message = $e->getMessage() ? $e->getMessage() : 'vote failed';
            return response()->json(["message" => $error_message],Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
