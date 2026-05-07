<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CommentController;


Route::get('/comment', [CommentController::class, 'index']);
Route::get('/comment/new', [CommentController::class, 'new']);

// !ゲストユーザーか通常の認証が必須
Route::middleware('auth.user_or_guest')->group(function () {
  Route::post('/comment', [CommentController::class, 'store']);
});

// !管理者
Route::middleware('administrator')->group(function () {
  //?コメント削除
  Route::delete('/comment/{comment}', [CommentController::class, 'destroy']);
});
