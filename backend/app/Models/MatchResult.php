<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class MatchResult extends Model
{
  public $timestamps = false;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'match_id',
    'match_result',
    'detail',
    'round'
  ];

  protected $hidden = [];
}
