<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\WinLossPredictionService;
use App\Http\Resources\WinLossPredictionResource;
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
     * @return Collection|JsonResource
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
     * 試合の勝敗予想の投票
     *
     * @param string match_id
     * @param string prediction "red"|"blue"
     *
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
