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

    /**
     *
     * @param array boxer
     * @return array
     */
    public function createBoxer($boxer): array
    {
        if (array_key_exists('titles', $boxer)) {
            $titlesArray = $boxer["titles"];
            unset($boxer["titles"]);
        } else {
            throw new Exception('titles is not exists in boxer data', 404);
        }
        $createdBoxer = $this->create($boxer);
        return ['boxer' => $createdBoxer, 'titles' => $titlesArray];
    }

    /**
     * boxerを個別で取得
     * @param int boxerID
     *
     * @return array(key-value) boxerData
     */
    public function getBoxerSingleByID($boxerID)
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
}
