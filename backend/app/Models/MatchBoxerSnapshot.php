<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchBoxerSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'boxer_id',
        'style',
        'win',
        'ko',
        'draw',
        'lose',
    ];

    /**
     * 試合データの取得
     */
    public function match()
    {
        return $this->beLongsTo(BoxingMatch::class, 'match_id');
    }

    public function boxer()
    {
        return $this->beLongsTo(Boxer::class, 'boxer_id');
    }
}
