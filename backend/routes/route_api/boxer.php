<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BoxerController;

Route::get('/boxer', [BoxerController::class, 'index']);

//! 管理者権限
Route::middleware('administrator')->group(function () {
  //? ボクサー
  Route::post('/boxer', [BoxerController::class, 'store']);
  Route::patch('/boxer', [BoxerController::class, 'update']);
  Route::delete('/boxer', [BoxerController::class, 'destroy']);
});
