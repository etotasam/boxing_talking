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
use App\Repositories\Interfaces\WeightDivisionRepositoryInterface;
use App\Repositories\Interfaces\GradeRepositoryInterface;
use App\Repositories\Interfaces\OrganizationRepositoryInterface;
use App\Repositories\Interfaces\MatchDataSnapshotInterface;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use App\Repositories\GuestUserRepository;
use App\Repositories\UserRepository;
use App\Repositories\BoxerRepository;
use App\Repositories\MatchRepository;
use App\Repositories\CommentRepository;
use App\Repositories\TitleMatchRepository;
use App\Repositories\TitleRepository;
use App\Repositories\PreUserRepository;
use App\Repositories\WinLossPredictionRepository;
use App\Repositories\WeightDivisionRepository;
use App\Repositories\GradeRepository;
use App\Repositories\OrganizationRepository;
use App\Repositories\MatchDataSnapshotRepository;
use App\Repositories\BoxerTitleSnapshotRepository;

class ServiceRepositoryProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(GuestRepositoryInterface::class, GuestUserRepository::class);
        $this->app->singleton(BoxerRepositoryInterface::class, BoxerRepository::class);
        $this->app->singleton(MatchRepositoryInterface::class, MatchRepository::class);
        $this->app->singleton(CommentRepositoryInterface::class, CommentRepository::class);
        $this->app->singleton(TitleMatchRepositoryInterface::class, TitleMatchRepository::class);
        $this->app->singleton(TitleRepositoryInterface::class, TitleRepository::class);
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(PreUserRepositoryInterface::class, PreUserRepository::class);
        $this->app->singleton(WinLossPredictionRepositoryInterface::class, WinLossPredictionRepository::class);
        $this->app->singleton(WeightDivisionRepositoryInterface::class, WeightDivisionRepository::class);
        $this->app->singleton(GradeRepositoryInterface::class, GradeRepository::class);
        $this->app->singleton(OrganizationRepositoryInterface::class, OrganizationRepository::class);
        $this->app->singleton(MatchDataSnapshotInterface::class, MatchDataSnapshotRepository::class);
        $this->app->singleton(BoxerTitleSnapshotInterface::class, BoxerTitleSnapshotRepository::class);
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
