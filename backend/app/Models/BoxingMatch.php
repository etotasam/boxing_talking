<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Comment;
use App\Models\Title;
use Illuminate\Support\Facades\Log;

class BoxingMatch extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'red_boxer_id',
        'blue_boxer_id',
        'match_date',
        'grade',
        'country',
        'venue',
        'weight',
        'titles',
        'count_red',
        'count_blue',
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class, 'match_id');
    }

    public function title()
    {
        return $this->hasOne(Title::class, 'match_id');
    }


    // ! 保有タイトルを配列にして返す
    protected function getTitlesAttribute($titles)
    {
        if (empty($titles)) {
            $titles = [];
        } else {
            $titles = explode('/', $titles);
        };
        return $titles;
    }

    // ! 配列で受けた保有タイトルを文字列に変換してDBに保存する 
    protected function setTitlesAttribute($titles)
    {
        $formattedTitles = implode('/', $titles);
        if (empty($formattedTitles)) {
            $formattedTitles = null;
        }
        $this->attributes['titles'] = $formattedTitles;
    }
}
