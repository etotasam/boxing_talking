<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\BoxerRequest;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\MatchRepository;
use App\Services\BoxerService;
use App\Http\Resources\BoxerCollection;

class BoxerController extends ApiController
{

    protected $boxerService;
    protected $boxerRepository;
    protected $matchRepository;
    public function __construct(
        BoxerService $boxerService,
        BoxerRepositoryInterface $boxerRepository,
        MatchRepositoryInterface $matchRepository
    ) {
        $this->boxerService = $boxerService;
        $this->boxerRepository = $boxerRepository;
        $this->matchRepository = $matchRepository;
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
        list($eng_name, $name) = $this->boxerService->parseRequestName($request->query('name'));
        $country = $request->query('country') ?? null;

        $searchWordArray = array_filter(compact("name", "eng_name", "country"));

        try {
            list($boxers, $boxersCount) = $this->boxerRepository->getBoxers($searchWordArray, $request->query('page'), $request->query('limit'));
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
        if ($this->matchRepository->hasMatchBoxer($boxerId)) {
            return $this->responseBadRequest("Boxer has already setup match");
        }

        try {
            $this->boxerService->deleteBoxerExecute($boxerId);
        } catch (\Exception $e) {
            if ($e->getCode() === 404) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed delete boxer");
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
        $targetBoxer = $this->boxerRepository->getBoxerById($updateBoxerData['id']);
        if (!$targetBoxer) {
            return $this->responseNotFound("Can not find boxer");
        }
        try {
            $this->boxerService->updateBoxerExecute($updateBoxerData);
        } catch (\Exception $e) {
            return $this->responseInvalidQuery("Failed boxer update");
        }
        return $this->responseSuccessful("Successful boxer update");
    }
}
