<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Exceptions\BoxerException;
use App\Http\Requests\BoxerRequest;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Services\BoxerService;
use App\Http\Resources\BoxerCollection;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Database\QueryException;

class BoxerController extends ApiController
{

    public function __construct(
        protected BoxerService $boxerService,
        protected BoxerRepositoryInterface $boxerRepository,
        protected MatchRepositoryInterface $matchRepository
    ) {
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
        [$eng_name, $name] = $this->boxerService->parseRequestName($request->query('name'));
        $country = $request->query('country') ?? null;

        $searchWordArray = array_filter(compact("name", "eng_name", "country"));

        try {
            [$boxers, $boxersCount] = $this->boxerRepository->getBoxers($searchWordArray, $request->query('page'), $request->query('limit'));
            return new BoxerCollection($boxers, $boxersCount);
        } catch (Exception $e) {
            return $this->responseInvalidQuery("Failed get boxers :" . $e->getMessage());
        }
    }

    /**
     * boxer登録
     * @param array boxerData ボクサー登録用のデータ
     */
    public function store(BoxerRequest $request): JsonResponse
    {
        try {
            $this->boxerService->createBoxer($request->toArray());
            return $this->responseSuccessful("Success create boxer");
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
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
            return $this->responseSuccessful("Success delete boxer");
        } catch (BoxerException $e) {
            return $this->responseNotFound($e->getMessage(), 44);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
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
            return $this->responseSuccessful("Successful boxer update");
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
    }
}
