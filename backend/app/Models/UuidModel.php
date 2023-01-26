<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class UuidModel extends Model
{
    // プライマリーキーのカラム名
    protected $primaryKey = 'id';
    // プライマリーキーの型
    protected $keyType = 'string';
    // 自動インクリメント
    public $incrementing = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->attributes['id'] = Uuid::uuid4()->toString();
    }
}
