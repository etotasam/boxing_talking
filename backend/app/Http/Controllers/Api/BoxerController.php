<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Exceptions\FailedTitleException;
use App\Exceptions\BoxerException;
use App\Http\Requests\BoxerRequest;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Services\BoxerService;
use App\Http\Resources\BoxerCollection;
use Illuminate\Database\QueryException;

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
        } catch (QueryException $e) {
            \Log::error($e->getMessage());
            return $this->responseInvalidQuery("Failed get boxers");
        }

        return new BoxerCollection($boxers, $boxersCount);
    }

    /**
     * boxer登録
     * @param array boxerData ボクサー登録用のデータ
     */
    public function store(BoxerRequest $request): JsonResponse
    {
        try {
            $this->boxerService->createBoxer($request->toArray());
        } catch (FailedTitleException $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }

        return $this->responseSuccessful("Success create boxer");
    }

    /**
     * ボクサーの削除
     * errorCode 30 削除対象のboxerは試合が組まれている状態
     * errorCode 44 削除対象のboxerが存在しない
     * @param int boxer_id
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $boxerId = $request->boxer_id;
        if ($this->matchRepository->hasMatchBoxer($boxerId)) {
            return $this->responseBadRequest("Boxer has already setup match", 30);
        }

        try {
            $this->boxerService->deleteBoxerExecute($boxerId);
        } catch (BoxerException $e) {
            return $this->responseNotFound($e->getMessage(), 44);
        }

        return $this->responseSuccessful("Success delete boxer");
    }

    /**
     * ボクサーデータの更新
     * @param array boxerData idと更新対象データのみ
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $updateBoxerData = $request->toArray();
        if (!$this->boxerRepository->isBoxerById($updateBoxerData['id'])) {
            return $this->responseNotFound("boxer is not found");
        }
        try {
            $this->boxerService->updateBoxerExecute($updateBoxerData);
        } catch (FailedTitleException $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }

        return $this->responseSuccessful("Successful boxer update");
    }
}
