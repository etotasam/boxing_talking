<?php

use Illuminate\Support\Facades\Route;
// controller
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\DbDataToCsvController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
// 認証関連のルート
require __DIR__ . '/route_api/auth.php';

// ボクサー関連のルート
require __DIR__ . '/route_api/boxer.php';

// 試合関連のルート
require __DIR__ . '/route_api/match.php';

// 勝敗予測関連のルート
require __DIR__ . '/route_api/prediction.php';

// コメント関連のルート
require __DIR__ . '/route_api/comment.php';

// テスト用のルート
require __DIR__ . '/route_api/test.php';


Route::get('/health', [HealthCheckController::class, 'index']);

// !管理者
Route::middleware('administrator')->group(function () {
    Route::get('/csv ', [DbDataToCsvController::class, 'output']);
});
