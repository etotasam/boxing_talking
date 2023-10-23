<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Comment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'match_id',
        'comment',
    ];

    protected $hidden = [
        // 'created_at',
        'updated_at'
    ];

    public function postUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
