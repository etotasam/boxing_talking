<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\ProvisionalUser;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\WinLossPrediction;
use Illuminate\Support\Str;
use \Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Exception;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id',
        'email',
        'password',
        'created_at',
        'updated_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function prediction()
    {
        return $this->hasMany(WinLossPrediction::class);
    }

    public $incrementing = false; // 自動インクリメントを無効化
    protected $keyType = 'string'; // 主キーのデータ型をUUIDに設定
    protected static function booted()
    {
        static::creating(function (User $model) {
            empty($model->id) && $model->id = Str::uuid();
        });
    }

    //?pre_usersから登録される時にidがuuidで作成されたものかを調べる...必要か？
    protected function setIdAttribute($id)
    {
        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';

        if (preg_match($uuidPattern, $id)) {
            $this->attributes['id'] = $id;
        } else {
            throw new Exception("invalid id", 500);
        }
    }
}
