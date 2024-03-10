<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchPrediction extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'match_id',
        'red_votes',
        'blue_votes'
    ];

    protected $hidden = [
        'match_id',
    ];
}
