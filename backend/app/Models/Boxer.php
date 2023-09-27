<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Organization;
use App\Models\WeightDivision;
use App\Models\Title;
use Exception;

use App\Http\Resources\BoxerResource;

class Boxer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'eng_name',
        'country',
        'height',
        'birth',
        'style',
        'reach',
        'win',
        'draw',
        'lose',
        'ko',
        'title_hold',
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function titles()
    {
        return $this->hasMany(Title::class);
    }


    //? クエリ作成
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

    public function getBoxersByNameAndCountry($name, $country, $limit, $page)
    {
        try {
            if (!isset($page)) $page = 1;
            $under = ($page - 1) * $limit;

            $eng_name = $name;
            $arrayWordWithName = compact("name", "country");
            $arrayWordWithEngName = compact("eng_name", "country");
            $QueryWithName = $this->createQuery($arrayWordWithName);
            $QueryWithEngName = $this->createQuery($arrayWordWithEngName);

            $engNameQuery = $this->newQuery();
            $nameQuery = $this->newQuery();
            // クエリの作成
            $BoxersDataWithEngName = $engNameQuery->where($QueryWithEngName)->offset($under)->limit($limit)->with(["titles.organization", "titles.weightDivision"])->get();
            $BoxersDataWithName = $nameQuery->where($QueryWithName)->offset($under)->limit($limit)->with(["titles.organization", "titles.weightDivision"])->get();

            //? データの保存の性質上基本的には片方のqueryでしかヒットしないはずだけど、eng_nameが優先されるように設定(返り値がある場合)
            // \Log::info($BoxersDataWithEngName);
            if (!empty($BoxersDataWithEngName->toArray())) {
                $boxers = $BoxersDataWithEngName;
            } else {
                $boxers = $BoxersDataWithName;
            };

            $formattedBoxers = $boxers->map(function ($boxer) {
                $formattedBoxer = new BoxerResource($boxer);
                return $formattedBoxer;
            });

            return $formattedBoxers;
        } catch (Exception $e) {
            if ($e->getCode()) {
                throw new Exception($e->getMessage(), $e->getCode());
            }
            throw new Exception("Failed getBoxersWithNameAndCountry", 500);
        }
    }

    // 所持タイトル(ベルト)も取得する
    public function getBoxerWithTitles($boxerID)
    {
        $boxer = $this->with(["titles.organization", "titles.weightDivision"])
            ->find($boxerID);
        if (!$boxer) {
            throw new Exception("no exist boxer", 500);
        }
        $titles = $boxer->titles->map(function ($title) {
            $name = $title->organization->name;
            $weight = $title->weightDivision->weight;
            return ["organization" => $name, "weight" => $weight];
        });
        $formattedBoxer = $boxer->toArray();
        $formattedBoxer["titles"] = $titles;
        return $formattedBoxer;
    }

    //! Accessor
    //? 文字列を配列にして返す
    // protected function getTitleHoldAttribute($title_hold)
    // {
    //     if (empty($title_hold)) {
    //         $formatted_title_hold = [];
    //     } else {
    //         $formatted_title_hold = explode('/', $title_hold);
    //     };
    //     return $formatted_title_hold;
    // }

    //! Mutate
    //? 配列で受けた保有タイトルを文字列に変換してDBに保存
    // protected function setTitleHoldAttribute($title_hold)
    // {
    //     $string_title_hold = implode('/', $title_hold);
    //     if (empty($string_title_hold)) {
    //         $this->attributes['title_hold'] = null;
    //     } else {
    //         $this->attributes['title_hold'] = $string_title_hold;
    //     }
    // }
}
