<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fighter extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'country',
        'height',
        'birth',
        'stance',
        'win',
        'draw',
        'lose',
        'ko',
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];
}
