<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MatchController;



Route::get('/match', [MatchController::class, 'index']);
Route::get('/match/{match}/show', [MatchController::class, 'show']);

// !管理者
Route::middleware('administrator')->group(function () {
  Route::post('/match', [MatchController::class, 'store']);
  Route::delete('/match', [MatchController::class, 'destroy']);
  Route::patch('/match', [MatchController::class, 'update']);
  Route::post('/match/result', [MatchController::class, 'resultStore']);
});
