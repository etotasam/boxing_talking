<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        ModelNotFoundException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        if (!$request->is('api/*')) {
            //apiリクエスト以外は何もしない
            return parent::render($request, $exception);
        } else if ($exception instanceof ModelNotFoundException) {
            //モデルがみつからない時(Route Model Binding時)
            return response()->json(["success" => false, "message" => "Not found"], 404);
        } else if ($exception instanceof NotFoundHttpException) {
            //Routeに存在しないリクエスト
            return response()->json(["message" => "Not found"], 404);
        } else {
            return parent::render($request, $exception);
        }
    }
}
