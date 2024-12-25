<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoxerTitleSnapshot extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'match_id',
        'boxer_id',
        'organization_id',
        'weight_division_id',
        'state',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, "organization_id");
    }

    public function weightDivision()
    {
        return $this->belongsTo(WeightDivision::class, "weight_division_id");
    }
}
