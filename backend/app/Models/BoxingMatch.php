<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\Grade;
use App\Models\WeightDivision;
use App\Models\Organization;
use App\Models\MatchDataSnapshot;
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
        'grade_id',
        'country',
        'venue',
        'weight_id',
        'titles',
        // 'count_red',
        // 'count_blue',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class, 'match_id');
    }

    public function titleBelts()
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

    public function getWeight()
    {
        return $this->belongsTo(WeightDivision::class, "weight_id");
    }

    public function getGrade()
    {
        return $this->belongsTo(Grade::class, "grade_id");
    }

    public function getSnapshot()
    {
        return $this->hasMany(MatchDataSnapshot::class, 'match_id');
    }
}
