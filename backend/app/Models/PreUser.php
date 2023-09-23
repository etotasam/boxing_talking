<?php

namespace App\Models;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PreUser extends Model
{
    protected $guarded = [];
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'id',
        'created_at',
        'updated_at'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function booted()
    {
        static::creating(function (PreUser $model) {
            empty($model->id) && $model->id = Str::uuid();
        });
    }

    //! mutate
    //? パスワードのハッシュ化
    protected function setPasswordAttribute($password)
    {
        $hashed_password = Hash::make($password);
        $this->attributes['password'] = $hashed_password;
    }
}
