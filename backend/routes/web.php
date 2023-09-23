<?php

use Illuminate\Support\Facades\Route;
use \Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
// Models
use App\Models\ProvisionalUser;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

$this->siteURL = config('app.url');

Route::get('/', function () {
    // return view('welcome');
    return redirect()->to($this->siteURL);
});


Route::get('/{any}', function () {
    return redirect()->to($this->siteURL);
});
