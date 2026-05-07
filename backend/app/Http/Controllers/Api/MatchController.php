<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\MatchService;
use App\Services\AuthService;
use App\Services\MatchResultStoreService;
use App\Http\Resources\BoxingMatchResource;
use App\Models\BoxingMatch;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Database\QueryException;
use App\Exceptions\NonAdministratorException;
use App\Http\Requests\BoxingMatchesRequest;
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;
use App\Repositories\Interfaces\GradeRepositoryInterface;
use Illuminate\Support\Facades\DB;



class MatchController extends ApiController
{

    public function __construct(
        private MatchService $matchService,
        private MatchResultStoreService $matchResultStoreService,
        private AuthService $authService,
        private WeightDivisionRepositoryInterface $weightRepository,
        private GradeRepositoryInterface $gradeRepository,
    ) {}

    /**
     * 試合データ一覧の取得
     *
     * リクエストクエリ:
     * - range: 取得範囲
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $matchesWithSnapshot =  $this->matchService->getMatchesExecute($request->query('range'));
        } catch (NonAdministratorException $e) {
            return $this->responseUnauthorized($e->getMessage());
        } catch (Exception $e) {
            return $this->responseInvalidQuery("Failed get Matches :" . $e->getMessage());
        }

        return BoxingMatchResource::collection($matchesWithSnapshot);
    }

    /**
     * idで指定の試合データの取得
     *
     * ルートパラメータ:
     * - match: 取得したい試合
     *
     * @param BoxingMatch $match
     * @return void
     */
    public function show(BoxingMatch $match)
    {
        // return new BoxingMatchResource($match);
    }


    /**
     * 試合データの登録
     *
     * リクエストボディ:
     * - match_date: 試合日
     * - red_boxer_id: 赤コーナーのボクサーID
     * - blue_boxer_id: 青コーナーのボクサーID
     * - grade: 試合グレード
     * - country: 開催国
     * - venue: 会場
     * - weight: 階級
     * - titles: タイトル一覧
     *
     * エラーコード:
     * - 51: matchesテーブルへの登録が失敗
     * - 50: titleMatchesテーブルへの登録が失敗
     *
     * @param BoxingMatchesRequest $request
     * @return JsonResponse
     */
    public function store(BoxingMatchesRequest $request)
    {
        try {
            $this->matchService->storeMatch($request->toArray());
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
        return $this->responseSuccessful("Success store match");
    }

    /**
     * 試合データの削除
     *
     * リクエストボディ:
     * - match_id: 削除したい試合ID
     *
     * エラーコード:
     * - 44: targetの試合データがない
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $this->matchService->deleteMatchExecute($request->match_id);
        } catch (Exception $e) {
            if ($e->getCode() === 44) {
                return $this->responseNotFound($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage());
        }

        return $this->responseSuccessful("Success match delete");
    }

    /**
     * 試合データの更新
     *
     * リクエストボディ:
     * - match_id: 更新したい試合ID
     * - country: 開催国
     * - venue: 会場
     * - grade: 試合グレード
     * - weight: 階級
     * - titles: タイトル一覧
     *
     * @param BoxingMatchesRequest $request
     * @return JsonResponse
     */
    public function update(BoxingMatchesRequest $request)
    {
        $matchId = $request->match_id;
        $updateMatchData = $request->validatedUpdateData();
        try {
            $this->matchService->updateMatch($matchId, $updateMatchData);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }

        return $this->responseSuccessful("Success update match");
    }

    /**
     * 試合結果を登録する
     *
     * リクエストボディ:
     * - is_update_boxer_record_checked: ボクサー戦績を更新するか
     * - match_id: 結果を登録したい試合ID
     * - result: 試合結果
     * - detail: 試合結果の詳細
     * - round: 決着ラウンド
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resultStore(Request $request)
    {
        $matchResultArray = [
            "match_id" => $request->match_id,
            "match_result" => $request->result,
            "detail" => $request->detail,
            "round" => $request->round
        ];

        $isUpdateBoxerRecordChecked = $request->is_update_boxer_record_checked;

        try {
            $this->matchResultStoreService->storeMatchResultExecute($matchResultArray, $isUpdateBoxerRecordChecked);
            // $this->matchService->storeMatchResultExecute($matchResultArray);
            return $this->responseSuccessful("Successful store match result and update boxers record");
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
    }
}
