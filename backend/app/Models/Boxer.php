<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BoxingMatch;
use App\Models\Title;

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

    public function hasMatch()
    {
        return $this->belongsTo(BoxingMatch::class, ['red_boxer_id', 'blue_boxer_id']);
    }
}
