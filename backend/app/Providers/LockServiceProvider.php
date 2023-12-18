<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\LockService;

class LockServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(LockService::class, function ($app) {
            return new LockService();
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
