<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Exception;
// Models
use App\Models\Boxer;
use App\Models\BoxingMatch;
use Illuminate\Support\Facades\Auth;
// requests
use App\Http\Requests\BoxerRequest;

use App\Http\Resources\BoxerResource;

class BoxerController extends Controller
{

    public function __construct(Boxer $boxer, BoxingMatch $match)
    {
        $this->boxer = $boxer;
        $this->match = $match;
    }

    //? name eng_name countryで検索出来るqueryを作る
    protected function createQuery($arr_word): array
    {
        $arrayQuery = array_map(function ($key, $value) {
            if (isset($value)) {
                if ($key == 'name' || $key == "eng_name") {
                    return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
                } else {
                    return [$key, 'like', $value];
                }
            }
        }, array_keys($arr_word), array_values($arr_word));

        $arrayQueries = array_filter($arrayQuery, function ($el) {
            if (isset($el)) {
                return $el;
            }
        });

        return $arrayQueries;
    }
    /**
     * fetch fighters data from DB
     *
     * @param int require limit
     * @param int require page
     * @param string name
     * @param string country
     * @return array 選手情報
     */
    public function fetch(Request $request)
    {
        try {
            $boxers = $this->boxer->getBoxersByNameAndCountry($request->name, $request->country, $request->limit, $request->page);
            return response()->json($boxers, 200);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["success" => false, "message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["success" => false, "message" => "Fetch boxer error"], 500);
        }
    }


    /**
     * count fighters
     * @param string name
     * @param string country
     * @return int 選手の数
     */
    public function count(Request $request)
    {
        try {
            $name = $request->name;
            $country = $request->country;
            $arrayWords = compact("name", "country");
            $arrayQuery = array_map(function ($key, $value) {
                if (isset($value)) {
                    if ($key == 'name') {
                        return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
                    } else {
                        return [$key, 'like', $value];
                    }
                }
            }, array_keys($arrayWords), array_values($arrayWords));

            $likeQueries = array_filter($arrayQuery, function ($el) {
                if (isset($el)) {
                    return $el;
                }
            });

            $fighters_count = Boxer::where($likeQueries)->count();
            return response()->json($fighters_count, 200);
        } catch (Exception $e) {
            return response()->json(["message" => "faild get count fighters"], 500);
        }
    }

    /**
     * fetch fighters data from DB
     *
     * @param \Illuminate\Http\Request
     */
    public function register(BoxerRequest $request)
    {
        try {
            $boxer = $request->all();
            $this->boxer->create($boxer);
            return response()->json(["message" => "created fighter"], 200);
        } catch (Exception $e) {
            if ($e->getCode() === 406) {
                return response()->json(["message" => $e->getMessage()], 406);
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
            // throw new Exception("@@@@@@エラー", 406);
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
            //? 試合が組まれているかどうかをチェックする
            $red_exist = $this->match->where("red_boxer_id", $id)->exists();
            $blue_exist = $this->match->where("blue_boxer_id", $id)->exists();
            if ($red_exist or $blue_exist) {
                throw new Exception("Boxer has already setup match", 406);
            };

            $boxer->delete();
            return response()->json(["message" => "Boxer is deleted"], 200);
        } catch (Exception $e) {
            if ($e->getCode() === 406) {
                return response()->json(["message" => $e->getMessage()], 406);
            }
            return response()->json(["message" => "delete error"], 500);
        }
    }

    /**
     * update fighter data
     *
     * @param
     */
    public function update(Request $request)
    {
        // throw new Exception();
        try {
            $boxerID = $request->id;
            $boxer = $this->boxer->find($boxerID);
            if (!$boxer) {
                throw new Exception("Boxer is not exists", 404);
            }

            $updateBoxer = $request->toArray();

            $boxer->update($updateBoxer);
            return response()->json(["message" => "boxer updated"], 200);
        } catch (Exception $e) {
            if ($e->getCode()) {
                return response()->json(["message" => $e->getMessage()], $e->getCode());
            }
            return response()->json(["message" => "Failed fighter update"], 500);
        }
    }




    public function test()
    {
        try {

            // $boxer = $this->boxer->getBoxerWithTitles(11);

            // return response()->json($boxer);
        } catch (Exception $e) {
            return response()->json(["message" => $e->getMessage()], 500);
        }
    }
}
