<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\BoxerRequest;
use App\Services\BoxerService;

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
     * @return array (key-value)boxers
     * @return int count
     */
    public function fetch(Request $request)
    {
        try {
            $result = $this->boxerService->getBoxersAndCount($request->name, $request->country, $request->limit, $request->page);
            return $result;
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => "Fetch boxer error"], 500);
        }
    }


    /**
     *
     * @param \Illuminate\Http\Request boxerData
     */
    public function register(BoxerRequest $request)
    {
        try {
            $boxerData = $request->toArray();
            DB::beginTransaction();
            list($createdBoxer, $titles) = $this->boxerService->createBoxerWithTitles($boxerData);
            $this->boxerService->setTitle($createdBoxer['id'], $titles);
            DB::commit();
            return response()->json(["message" => "Success created boxer"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode() === 406) {
                return response()->json(["message" => $e->getMessage()], 406);
            }
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => "Failed boxer register"], 500);
        }
    }

    /**
     *
     * @param int boxer_id
     * @param string eng_name
     */
    public function delete(Request $request)
    {
        try {
            $boxerID = $request->boxer_id;
            $boxerEngName = $request->eng_name;
            $boxer = $this->boxerService->getBoxerOrThrowExceptionIfNotExists($boxerID);
            //? データの整合性をチェック
            if ($boxer->eng_name != $boxerEngName) {
                throw new Exception("Request data is dose not match boxer in database", 406);
            };
            //? 対象ボクサーが既に試合を組まれている場合はthrow
            $this->boxerService->throwErrorIfBoxerHaveMatch($boxerID);

            DB::beginTransaction();
            $this->boxerService->deleteBoxerTitles($boxerID); //?ボクサーが所持しているタイトルを削除
            $boxer->delete();
            DB::commit();
            return response()->json(["message" => "Boxer is deleted"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode() === 406) {
                return response()->json(["message" => $e->getMessage()], 406);
            }
            return response()->json(["message" => "Delete error"], 500);
        }
    }

    /**
     *
     * @param
     */
    public function update(Request $request)
    {
        try {
            $boxerID = $request->id;
            $boxer = $this->boxerService->getBoxerOrThrowExceptionIfNotExists($boxerID);

            $updateBoxerData = $request->toArray();
            DB::beginTransaction();
            $this->boxerService->setTitle($boxerID, $updateBoxerData["titles"]);

            unset($updateBoxerData["titles"]);

            $boxer->update($updateBoxerData);
            DB::commit();
            return response()->json(["message" => "Successful boxer update"], 200);
        } catch (Exception $e) {
            DB::rollBack();
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => "Failed fighter update"], 500);
        }
    }
}
