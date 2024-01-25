<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Title;
use App\Models\Boxer;
use App\Models\WeightDivision;
use App\Models\BoxingMatch;

class Organization extends Model
{
    use HasFactory;

    public $timestamps = false;

    // public function organization()
    // {
    //     return $this->belongsTo(TitleMatch::class);
    // }
}
