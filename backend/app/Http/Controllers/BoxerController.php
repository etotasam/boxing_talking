<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Exception;
// Models
use App\Models\Boxer;
use App\Models\BoxingMatch;

class BoxerController extends Controller
{
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
            $country = $request->country;

            if (!isset($page)) $page = 1;
            $under = ($page - 1) * $limit;

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

            try {
                $boxers = Boxer::where($like_querys)->offset($under)->limit($limit)->get();
            } catch (Exception $e) {
                return response()->json(["message" => "get PDOException error!:" . $e], 500);
            }
            // ! 保有タイトルを配列にして返す
            $new_boxers = $boxers->map(function ($boxer) {
                if (empty($boxer->title_hold)) {
                    $boxer->title_hold = [];
                } else {
                    $boxer->title_hold = explode('/', $boxer->title_hold);
                };
                return $boxer;
            });


            return response()->json($new_boxers, 200);
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
     * delete fighter in DB
     *
     * @param
     */
    public function delete(Request $request)
    {
        // throw new Exception();
        try {
            $id = $request->fighterId;
            $fighter = Boxer::find($id);
            $red_exist = BoxingMatch::where("red_fighter_id", $id)->exists();
            $blue_exist = BoxingMatch::where("blue_fighter_id", $id)->exists();
            if ($red_exist or $blue_exist) {
                throw new Exception("that fighter has match", 406);
            }
            $fighter->delete();
            return response()->json(["message" => "fighter deleted"], 200);
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
