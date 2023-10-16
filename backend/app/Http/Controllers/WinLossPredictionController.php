<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\WinLossPredictionService;

class WinLossPredictionController extends Controller
{

    public function __construct(WinLossPredictionService $predictionService)
    {
        $this->predictionService = $predictionService;
    }
    /**
     * ユーザーの勝敗予想を取得
     *
     * @return array|null
     */
    public function index()
    {
        $predictions = $this->predictionService->getPrediction();
        return $predictions;
    }

    /**
     * 試合の勝敗予想の投票
     *
     * @param string match_id
     * @param string prediction "red"|"blue"
     *
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        return $this->predictionService->votePrediction(intval($request->match_id), $request->prediction);
    }
}
