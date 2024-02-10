<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BoxingMatch;


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

  // public function getMatch()
  // {
  //   $this->belongsTo(BoxingMatch::class, "match_id");
  // }
}
