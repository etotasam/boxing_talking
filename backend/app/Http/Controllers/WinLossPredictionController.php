<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;
// models
use App\Models\User;
use App\Models\GuestUser;
use App\Models\WinLossPrediction;
use App\Models\BoxingMatch;
use App\Services\WinLossPredictionService;

use \Symfony\Component\HttpFoundation\Response;

class WinLossPredictionController extends Controller
{

    public function __construct(WinLossPredictionService $predictionService)
    {
        $this->predictionService = $predictionService;
    }
    /**
     * fetch vote by auth user
     *
     * @return \Illuminate\Http\Response
     */
    public function fetch()
    {
        try {
            $prediction = $this->predictionService->getPrediction();
            return $prediction;
        } catch (Exception $e) {
            if ($e->getCode() == Response::HTTP_UNAUTHORIZED) {
                return response()->json(["message" => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
            }
            return response()->json(["message" => "get user vote failed"], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * fetch vote by auth user
     *
     * @param int match_id
     * @param string("red" | "blue") prediction
     * @return \Illuminate\Http\Response
     */
    public function win_loss_prediction(Request $request)
    {

        try {
            if (!Auth::user() && !Auth::guard('guest')->check()) {
                throw new Exception('win-loss prediction vote require auth', Response::HTTP_UNAUTHORIZED);
            }
            //? ゲストユーザーか一般ログインユーザーか
            if (Auth::check()) {
                $userID = Auth::user()->id;
            } else if (Auth::guard('guest')->check()) {
                $userID = Auth::guard('guest')->user()->id;
            }
            $matchID = $request->match_id;
            $prediction = $request->prediction;
            $matchID = intval($matchID);
            //? 試合が見つからない場合は投票不可 throw error
            $isMatch = BoxingMatch::find($matchID)->exists();
            if (!$isMatch) {
                throw new Exception('the match not exist', Response::HTTP_NOT_FOUND);
            }
            //? 試合当日以降は試合予想の投票不可 throw error
            $data = BoxingMatch::select('match_date')->where('id', $matchID)->first();
            $match_data = strtotime($data['match_date']);
            $now_date = strtotime('now');
            if ($now_date > $match_data) {
                throw new Exception('Cannot win-loss prediction after match date', Response::HTTP_BAD_REQUEST);
            }

            //? すでに投票済みの場合は投票不可 throw error
            $isVote = WinLossPrediction::where([["user_id", $userID], ["match_id", $matchID]])->first();
            if ($isVote) {
                throw new Exception("Cannot win-loss prediction. You have already done.", Response::HTTP_BAD_REQUEST);
            }
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode());
        }
        //? ここからDBに挿入
        try {
            DB::beginTransaction();
            WinLossPrediction::create([
                "user_id" => $userID,
                "match_id" => intval($matchID),
                "prediction" => $prediction
            ]);
            $matches = BoxingMatch::where("id", intval($matchID))->first();
            if ($prediction == "red") {
                $matches->increment("count_red");
            } else if ($prediction == "blue") {
                $matches->increment("count_blue");
            }
            $matches->save();
            DB::commit();
            return response()->json(["message" => "Win-Loss prediction success"], Response::HTTP_OK);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(["message" => "Failed save to prediction" . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
