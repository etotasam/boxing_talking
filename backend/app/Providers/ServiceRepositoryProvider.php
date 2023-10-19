<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\GuestRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Repositories\Interfaces\TitleMatchRepositoryInterface;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\Interfaces\PreUserRepositoryInterface;
use App\Repositories\Interfaces\WinLossPredictionRepositoryInterface;
use App\Repositories\GuestUserRepository;
use App\Repositories\UserRepository;
use App\Repositories\BoxerRepository;
use App\Repositories\MatchRepository;
use App\Repositories\CommentRepository;
use App\Repositories\TitleMatchRepository;
use App\Repositories\TitleRepository;
use App\Repositories\PreUserRepository;
use App\Repositories\WinLossPredictionRepository;

class ServiceRepositoryProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(GuestRepositoryInterface::class, GuestUserRepository::class);
        $this->app->bind(BoxerRepositoryInterface::class, BoxerRepository::class);
        $this->app->bind(MatchRepositoryInterface::class, MatchRepository::class);
        $this->app->bind(CommentRepositoryInterface::class, CommentRepository::class);
        $this->app->bind(TitleMatchRepositoryInterface::class, TitleMatchRepository::class);
        $this->app->bind(TitleRepositoryInterface::class, TitleRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PreUserRepositoryInterface::class, PreUserRepository::class);
        $this->app->bind(WinLossPredictionRepositoryInterface::class, WinLossPredictionRepository::class);
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
