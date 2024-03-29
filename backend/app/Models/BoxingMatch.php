<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\TitleMatch;
use App\Models\Organization;
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
        'updated_at',
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class, 'match_id');
    }

    public function organization()
    {
        return $this->belongsToMany(Organization::class, 'title_matches', 'match_id');
    }

    public function redBoxer()
    {
        return $this->belongsTo(Boxer::class, 'red_boxer_id');
    }

    public function blueBoxer()
    {
        return $this->belongsTo(Boxer::class, 'blue_boxer_id');
    }

    public function result()
    {
        return $this->hasOne(MatchResult::class, "match_id");
    }
}
