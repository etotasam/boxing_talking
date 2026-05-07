<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class HealthCheckController extends ApiController
{
    /**
     * ヘルスチェック結果を取得する
     *
     * @return JsonResponse
     */
    public function index()
    {
        return response()->json([
            'health-check' => 'ok'
        ], 200);
    }
}
