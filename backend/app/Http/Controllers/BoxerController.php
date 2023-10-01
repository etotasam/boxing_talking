<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\BoxerRequest;
use App\Services\BoxerService;
use Illuminate\Http\JsonResponse;

class BoxerController extends Controller
{

    public function __construct(BoxerService $boxerService)
    {
        $this->boxerService = $boxerService;
    }

    /**
     *
     * @param int require limit
     * @param int require page
     * @param string name
     * @param string country
     *
     * @return JsonResponse
     */
    public function fetch(Request $request): JsonResponse
    {
        return $this->boxerService->getBoxersAndCount($request->name, $request->country, $request->limit, $request->page);
    }


    /**
     * @param BoxerRequest ボクサー登録用のデータ
     */
    public function store(BoxerRequest $request): JsonResponse
    {
        return $this->boxerService->createBoxer($request->toArray());
    }

    /**
     * @param int boxer_id
     * @param string eng_name
     * @return JsonResponse
     */
    public function delete(Request $request): JsonResponse
    {
        return $this->boxerService->deleteBoxer($request->boxer_id, $request->eng_name);
    }

    /**
     *
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        return $this->boxerService->updateBoxerData($request->toArray());
    }
}
