<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsError
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
    $response = $next($request);

    if ($response->headers->has('Access-Control-Allow-Origin')) {
      // CORSヘッダーが含まれている場合
      return $response;
    }

    // CORSエラーの場合のレスポンスをカスタマイズ
    if ($request->wantsJson()) {
      return response()->json(['error' => 'CORSエラー'], 403);
    } else {
      return response('CORSエラー', 403);
    }
  }
}
