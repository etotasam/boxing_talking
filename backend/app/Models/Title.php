<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\WeightDivision;
use App\Models\Organization;

class Title extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'boxer_id',
        'organization_id',
        'weight_division_id',
    ];

    protected $hidden = [
        'boxer_id',
    ];




    // public function match()
    // {
    //     return $this->belongsTo(BoxingMatch::class);
    // }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function weightDivision()
    {
        return $this->belongsTo(WeightDivision::class);
    }
}
