<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Exception;
// Models
use App\Models\Boxer;
use App\Models\BoxingMatch;

class BoxerController extends Controller
{

    //? name eng_name countryで検索出来るqueryを作る
    protected function create_query($arr_word): array
    {
        $arr_query = array_map(function ($key, $value) {
            if (isset($value)) {
                if ($key == 'name' || $key == "eng_name") {
                    return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
                } else {
                    return [$key, 'like', $value];
                }
            }
        }, array_keys($arr_word), array_values($arr_word));

        $arr_querys = array_filter($arr_query, function ($el) {
            if (isset($el)) {
                return $el;
            }
        });

        return $arr_querys;
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
            $limit = $request->limit;
            $page = $request->page;
            $name = $request->name;
            $eng_name = $request->name;
            $country = $request->country;

            if (!isset($page)) $page = 1;
            $under = ($page - 1) * $limit;

            //? name eng_name countryで検索出来る様に設定
            $arr_word_with_name = compact("name", "country");
            $arr_word_with_eng_name = compact("eng_name", "country");
            $query_with_name = $this->create_query($arr_word_with_name);
            $query_with_eng_name = $this->create_query($arr_word_with_eng_name);

            try {
                $boxers_data_with_name = Boxer::where($query_with_name)->offset($under)->limit($limit)->get();
                $boxers_data_with_eng_name = Boxer::where($query_with_eng_name)->offset($under)->limit($limit)->get();

                //? データの保存の性質上基本的には片方のqueryでしかヒットしないはずだけど、eng_nameが優先されるように設定(返り値がある場合)
                if (!empty($boxers_data_with_eng_name->toArray())) {
                    $boxers = $boxers_data_with_eng_name;
                } else {
                    $boxers = $boxers_data_with_name;
                };
            } catch (Exception $e) {
                return response()->json(["message" => "get PDOException error!:" . $e], 500);
            }
            // ? 保有タイトルを配列にして返す
            $formatted_boxers = $boxers->map(function ($boxer) {
                if (empty($boxer->title_hold)) {
                    $boxer->title_hold = [];
                } else {
                    $boxer->title_hold = explode('/', $boxer->title_hold);
                };
                return $boxer;
            });


            return response()->json($formatted_boxers, 200);
        } catch (Exception $e) {
            return response()->json(["message" => "faild fetch Boxers:" . $e], 500);
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
            $arr_word = compact("name", "country");
            $arr_query = array_map(function ($key, $value) {
                if (isset($value)) {
                    if ($key == 'name') {
                        return [$key, 'like', "%" . addcslashes($value, '%_\\') . "%"];
                    } else {
                        return [$key, 'like', $value];
                    }
                }
            }, array_keys($arr_word), array_values($arr_word));

            $like_querys = array_filter($arr_query, function ($el) {
                if (isset($el)) {
                    return $el;
                }
            });

            $fighters_count = Boxer::where($like_querys)->count();
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
    public function register(Request $request)
    {
        try {
            // throw new Exception();
            // すでに存在してるかをチェック(名前だけで判断してる...)
            $boxer = $request->all();
            $name = $boxer["name"];
            $eng_name = $boxer["eng_name"];
            $is_exist = Boxer::where("name", $name)->orWhere("eng_name", $eng_name)->exists();
            if ($is_exist) {
                throw new Exception("the fighter alrady exist", 406);
            }
            // 選手の登録
            // $boxer = $request->toArray();

            // ! 配列で受けた保有タイトルを文字列に変換する
            $string_title_hold = implode('/', $boxer['title_hold']);
            if (empty($string_title_hold)) {
                $boxer['title_hold'] = null;
            } else {
                $boxer['title_hold'] = $string_title_hold;
            }
            // $boxer['title_hold'] = json_encode($boxer['title_hold']);
            // \Log::debug($boxer);
            Boxer::create($boxer);
            return response()->json(["message" => "created fighter"], 200);
        } catch (Exception $e) {
            if ($e->getCode() === 406) {
                return response()->json(["message" => $e->getMessage()], 406);
            }
            return response()->json(["message" => "faild register"], 500);
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
            $req_boxer_eng_name = $request->eng_name;
            try {
                $boxer = Boxer::findOrFail($id);
                \Log::info($boxer->eng_name);
                \Log::info($req_boxer_eng_name);
            } catch (Exception $e) {
                return response()->json(["message" => "Boxer is not exist in DB"], 406);
            };
            //? データの整合性をチェック
            if ($boxer->eng_name != $req_boxer_eng_name) {
                throw new Exception("Request data is dose not match boxer in database", 406);
            };
            //? 試合が組まれているかどうかをチェックする
            $red_exist = BoxingMatch::where("red_boxer_id", $id)->exists();
            $blue_exist = BoxingMatch::where("blue_boxer_id", $id)->exists();
            if ($red_exist or $blue_exist) {
                throw new Exception("Boxer has alrady setup match", 406);
            };
            // // ? テスト用にここで終了させる
            // return response()->json(["message" => "Boxer is deleted"], 200);

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
            $id = $request->id;
            // $boxer = $request->toArray();
            $boxer = $request->all();
            $title_hold = implode('/', $boxer['title_hold']);

            if (empty($title_hold)) {
                $boxer['title_hold'] = null;
            } else {
                $boxer['title_hold'] = $title_hold;
            }

            Boxer::find($id)->update($boxer);

            // \Log::debug($boxer);

            return response()->json(["message" => "boxer updated"], 200);
        } catch (Exception $e) {
            return response()->json(["message" => "faild fighter update"], 500);
        }
    }


    public function testtest(Request $request)
    {
        try {
            $title_hold = $request->title_hold;
            $json = json_encode($title_hold);
            // \Log::debug($json);
            return $json;
        } catch (Exception $e) {
            return response()->json(["message" => "failed test api"], 500);
        }
    }
}
