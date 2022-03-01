<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Comment;
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
        'red_fighter_id',
        'blue_fighter_id',
        'match_date',
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class, 'match_id');
    }

    // protected function getBlueFighter() {
    //     $blue_fighter = $this->hasOne(Fighter::class, 'id', 'blue_fighter_id');
    //     return $blue_fighter;
    // }

    // protected function getRedFighter() {
    //     $red_fighter =  $this->hasOne(Fighter::class, 'id', 'red_fighter_id');
    //     return $red_fighter;
    // }

}
