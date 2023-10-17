<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\BoxerRequest;
use App\Repository\BoxerRepository;
use App\Repository\MatchRepository;
use App\Services\BoxerService;
use App\Http\Resources\BoxerCollection;

class BoxerController extends ApiController
{

    public function __construct(BoxerService $boxerService)
    {
        $this->boxerService = $boxerService;
    }

    /**
     * boxer一覧取得
     *
     * @param int require limit
     * @param int require page
     * @param string name
     * @param string country
     *
     * @return BoxerCollection|JsonResponse
     */
    public function index(Request $request): BoxerCollection|JsonResponse
    {
        $boxerRepository = new BoxerRepository;

        list($eng_name, $name) = $this->boxerService->parseRequestName($request->query('name'));
        $country = $request->query('country') ?? null;
        $limit = $request->query('limit') ?? 15;
        $page = $request->query('page') ?? 1;
        $under = ($page - 1) * $limit;  //取得を開始する位置を指定(2ページ目などもあるので…)

        $searchWordArray = array_filter(compact("name", "eng_name", "country"));

        try {
            list($boxers, $boxersCount) = $boxerRepository->getBoxers($searchWordArray, $under, $limit);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery("Failed when get boxers data");
        }

        return new BoxerCollection($boxers, $boxersCount);
    }


    /**
     * @param array boxerData ボクサー登録用のデータ
     */
    public function store(BoxerRequest $request): JsonResponse
    {
        return $this->boxerService->createBoxer($request->toArray());
    }

    /**
     * ボクサーの削除
     *
     * @param int boxer_id
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $boxerId = $request->boxer_id;
        $targetBoxer = BoxerRepository::get($boxerId);
        if (!$targetBoxer) {
            return $this->responseNotFound("Can not find boxer");
        }
        if (MatchRepository::haveMatchBoxer($boxerId)) {
            return $this->responseBadRequest("Boxer has already setup match");
        }
        try {
            $this->boxerService->deleteBoxer($targetBoxer);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed when deleting boxer");
        }

        return $this->responseSuccessful("Boxer is deleted");
    }

    /**
     * ボクサーデータの更新
     *
     * @param array boxerData idと更新対象データのみ
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $updateBoxerData = $request->toArray();
        $targetBoxer = BoxerRepository::get($updateBoxerData['id']);
        if (!$targetBoxer) {
            return $this->responseNotFound("Can not find boxer");
        }
        try {
            $this->boxerService->updateBoxerExecute($targetBoxer, $updateBoxerData);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery("Failed boxer update");
        }
        return $this->responseSuccessful("Successful boxer update");
    }
}
