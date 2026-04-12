<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;


Route::get('/test', [TestController::class, 'test']);
Route::get('/test2', [TestController::class, 'ad_test']);
