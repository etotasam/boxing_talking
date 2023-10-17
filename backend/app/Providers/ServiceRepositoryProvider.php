<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\BoxerRepository;
use App\Repositories\MatchRepository;
use App\Repositories\CommentRepository;
use App\Repositories\TitleMatchRepository;
use App\Repositories\TitleRepository;

class ServiceRepositoryProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(BoxerRepositoryInterface::class, BoxerRepository::class);
        $this->app->bind(MatchRepositoryInterface::class, MatchRepository::class);
        $this->app->bind(CommentRepositoryInterface::class, CommentRepository::class);
        $this->app->bind(TitleMatchRepositoryInterface::class, TitleMatchRepository::class);
        $this->app->bind(TitleRepositoryInterface::class, TitleRepository::class);
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
