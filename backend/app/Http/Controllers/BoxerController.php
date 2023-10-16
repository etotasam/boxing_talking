<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\BoxerRequest;
use App\Repository\BoxerRepository;
use App\Repository\MatchRepository;
use App\Services\BoxerService;
use App\Http\Resources\BoxerCollection;

class BoxerController extends Controller
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
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage() ?: "Failed getBoxersAndCount"], $e->getCode() ?: 500);
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
        try {
            $targetBoxer = BoxerRepository::get($boxerId);
            if (!$targetBoxer) {
                throw new Exception("Can not find boxer", 404);
            }
            if (MatchRepository::haveMatchBoxer($boxerId)) {
                throw new Exception("Boxer has already setup match", 406);
            }
            $this->boxerService->deleteBoxer($targetBoxer);
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage() ?: "Delete error"], $e->getCode() ?: 500);
        }

        return response()->json(['success' => true, "message" => "Boxer is deleted"], 200);
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
            return response()->json(["success" => false, "message" => "Can not find boxer"], 404);
        }
        try {
            $this->boxerService->updateBoxerExecute($targetBoxer, $updateBoxerData);
        } catch (Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage() ?: "Failed fighter update"], $e->getCode() ?: 500);
        }

        return response()->json(["success" => true, "message" => "Successful boxer update"], 200);
    }
}
