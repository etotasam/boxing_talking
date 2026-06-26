<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\WinLossPredictionService;
use App\Http\Resources\WinLossPredictionResource;
use App\Http\Resources\MatchPredictionsResource;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;

class WinLossPredictionController extends ApiController
{

    protected $predictionService;
    protected $predictionRepository;
    public function __construct(
        WinLossPredictionService $predictionService,
        WinLossPredictionRepositoryInterface $predictionRepository,
    ) {
        $this->predictionService = $predictionService;
        $this->predictionRepository = $predictionRepository;
    }
    /**
     * ユーザーの勝敗予想を取得
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|JsonResponse
     */
    public function index()
    {
        try {
            $predictions = $this->predictionRepository->getPredictionByUser();
            if ($predictions) {
                $responsePrediction = WinLossPredictionResource::collection($predictions);
            } else {
                $responsePrediction = response()->json(["data" => null], 200);
            }
        } catch (\Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed get prediction");
        }

        return $responsePrediction;
    }

    /**
     * 試合の投票数の取得
     *
     * リクエストクエリ:
     * - match_id: 投票数を取得したい試合ID
     *
     * @param Request $request
     * @return MatchPredictionsResource|JsonResponse
     */
    public function fetchOnMatch(Request $request)
    {
        try {
            $matchPredictions = $this->predictionService->getMatchPrediction(intval($request->match_id));
            return new MatchPredictionsResource($matchPredictions);
        } catch (\Exception $e) {
            if ($e->getCode() === 404) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed get match predictions");
        }
    }

    /**
     * 試合の勝敗予想の投票
     *
     * リクエストボディ:
     * - match_id: 投票したい試合ID
     * - prediction: 投票内容（"red"|"blue"）
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $this->predictionService->votePrediction(intval($request->match_id), $request->prediction);
        } catch (\Exception $e) {
            if ($e->getCode() === 400) {
                return $this->responseBadRequest($e->getMessage());
            }
            if ($e->getCode() === 404) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage());
        }

        return $this->responseSuccessful("Success vote win-loss prediction");
    }
}
