<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class ApiRequestMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $requestData = $request->all();
        $snakeCaseData = $this->recursiveSnakeCase($requestData);
        $request->replace($snakeCaseData);

        $response = $next($request);

        if ($response->getStatusCode() == 200) {
            $content = json_decode($response->getContent(), true);
            $content = $this->convertKeysToCamelCase($content);
            $response->setContent(json_encode($content));
        }

        return $response;
    }

    /**
     * keyをスネークケースに変換
     *
     * @param array
     * @return
     */
    private function recursiveSnakeCase(JsonResource | array $data): array
    {
        return collect($data)->map(function ($value, $key) {
            $snakeKey = \Str::snake($key);
            return [$snakeKey => is_array($value) ? $this->recursiveSnakeCase($value) : $value];
        })->collapse()->all();
    }

    /**
     * keyをスネークケースに変換
     *
     * @param array
     * @return
     */
    private function convertKeysToCamelCase(array $data): array
    {
        return collect($data)->map(function ($value, $key) {
            $camelCase = \Str::camel($key);
            return [$camelCase => is_array($value) ? $this->convertKeysToCamelCase($value) : $value];
        })->collapse()->all();
    }
}
