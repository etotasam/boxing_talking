<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WinLossPredictionController;


Route::get('/prediction', [WinLossPredictionController::class, 'index']);
Route::get('/match/prediction', [WinLossPredictionController::class, 'fetchOnMatch']);

// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
  Route::post('/prediction', [WinLossPredictionController::class, 'store']);
});
