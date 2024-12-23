<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoxerTitleSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'boxer_id',
        'organization_id',
        'weight_division_id',
        'state',
    ];
}
