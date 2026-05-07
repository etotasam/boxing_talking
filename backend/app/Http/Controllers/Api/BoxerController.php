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
use App\Exceptions\FailedTitleException;
use App\Exceptions\CustomErrorCodes;


class BoxerController extends ApiController
{

    public function __construct(
        protected BoxerService $boxerService,
        protected BoxerRepositoryInterface $boxerRepository,
        protected MatchRepositoryInterface $matchRepository
    ) {}

    /**
     * boxer一覧取得
     *
     * リクエストクエリ:
     * - limit: 取得件数
     * - page: ページ番号
     * - name: ボクサー名
     * - country: 国
     *
     * @param Request $request
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
     *
     * リクエストボディ:
     * - boxerData: ボクサー登録用のデータ
     *
     * @param BoxerRequest $request
     * @return JsonResponse
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
     *
     * リクエストボディ:
     * - boxer_id: 削除したいボクサーID
     *
     * エラーコード:
     * - CustomErrorCodes::BOXER_ALREADY_HAS_MATCH: 削除対象のboxerは試合が組まれている状態
     * - CustomErrorCodes::BOXER_NOT_FOUND: 削除対象のboxerが存在しない
     * - CustomErrorCodes::BOXER_DELETE_FAILED: boxerの削除に失敗
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $boxerId = $request->boxer_id;
        if ($this->matchRepository->hasMatchBoxer($boxerId)) {
            return $this->responseBadRequest("Boxer has already setup match", CustomErrorCodes::BOXER_ALREADY_HAS_MATCH);
        }

        try {
            $this->boxerService->deleteBoxerExecute($boxerId);
            return $this->responseSuccessful("Success delete boxer");
        } catch (BoxerException $e) {
            return $this->responseNotFound($e->getMessage(), CustomErrorCodes::BOXER_NOT_FOUND);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage(), CustomErrorCodes::BOXER_DELETE_FAILED);
        }
    }

    /**
     * ボクサーデータの更新
     *
     * リクエストボディ:
     * - boxerData: idと更新対象データのみ
     *
     * @param Request $request
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
        } catch (FailedTitleException $e) {
            return $this->responseInvalidQuery($e->getMessage(), CustomErrorCodes::TITLE_ALREADY_HAS_OTHER_BOXER);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
    }
}
