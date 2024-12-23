<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BoxingMatch;
use App\Models\Boxer;


class MatchDataSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'red_boxer_id',
        'blue_boxer_id',
        'red_boxer_win',
        'red_boxer_ko',
        'red_boxer_draw',
        'red_boxer_lose',
        'red_boxer_style',
        'blue_boxer_win',
        'blue_boxer_ko',
        'blue_boxer_draw',
        'blue_boxer_lose',
        'blue_boxer_style',
    ];

    protected $hidden = [
        'create_at',
        'updated_at'
    ];

    /**
     * 試合データの取得
     */
    public function match() 
    {
        return $this->beLongsTo(BoxingMatch::class, 'match_id');
    }

    public function redBoxer()
    {
        return $this->beLongsTo(Boxer::class, 'red_boxer_id');
    }
    public function blueBoxer()
    {
        return $this->beLongsTo(Boxer::class, 'blue_boxer_id');
    }

    /**
     * 赤、青のボクサーを配列で取得
     */
    public function getBoxders()
    {
        return [
            'red_boxer' => $this->redBoxer,
            'blue_boxer' => $this->blueBoxer,
        ];
    }
}
