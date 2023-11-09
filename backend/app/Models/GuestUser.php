<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use App\Models\WinLossPrediction;

class GuestUser extends Authenticatable
{
    use HasFactory;
    use HasApiTokens;
    use SoftDeletes;

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function prediction()
    {
        return $this->hasMany(WinLossPrediction::class, 'user_id');
    }

    protected static function booted()
    {
        static::creating(function (self $model) {
            empty($model->id) && $model->id = Str::uuid();
        });
    }

    public $incrementing = false; // 自動インクリメントを無効化
    protected $keyType = 'string'; // 主キーのデータ型をUUIDに設定
}
