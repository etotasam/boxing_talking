<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
// Models
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\Title;
// requests
use App\Http\Requests\BoxerRequest;
// Services
use App\Services\BoxerService;

class BoxerController extends Controller
{

    public function __construct(Boxer $boxer, BoxingMatch $match, BoxerService $boxerService, Title $title)
    {
        $this->boxer = $boxer;
        $this->match = $match;
        $this->title = $title;
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
     * @param \Illuminate\Http\Request
     */
    public function register(BoxerRequest $request)
    {
        try {
            $boxer = $request->toArray();
            DB::beginTransaction();
            $response = $this->boxer->createBoxer($boxer);
            $this->boxerService->setTitle($response['boxer']['id'], $response['titles']);
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
     * delete boxer in DB
     *
     * @param
     */
    public function delete(Request $request)
    {
        try {
            $id = $request->boxer_id;
            $boxerEngName = $request->eng_name;
            try {
                $boxer = $this->boxer->findOrFail($id);
            } catch (Exception $e) {
                return response()->json(["message" => "Boxer is not exist in DB"], 406);
            };
            //? データの整合性をチェック
            if ($boxer->eng_name != $boxerEngName) {
                throw new Exception("Request data is dose not match boxer in database", 406);
            };
            //? 対象ボクサーが既に試合を組まれている場合はthrow
            $this->boxerService->throwErrorIfBoxerHaveMatch($this->match, $id);

            DB::beginTransaction();
            $this->title->where('boxer_id', $id)->delete(); //?ボクサーが所持しているタイトルを削除
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
            $boxer = $this->boxer->find($boxerID);
            if (!$boxer) {
                throw new Exception("No boxer with that ID exists", 404);
            }

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
