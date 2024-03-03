<?php

namespace Tests\Unit;


use Tests\TestCase;
use Illuminate\Http\Request;
use App\Http\Middleware\ApiRequestMiddleware;


class ApiRequestMiddlewareTest extends TestCase
{
  /**
   * @test
   */
  public function testApiRequestToSnakeCase()
  {

    $middleware = new ApiRequestMiddleware();
    $params = ['userName' => 'value', 'nestKey' => ["nextNestKey" => "nextNestValue"]];

    $request = Request::create('/', "POST", $params);

    $response = $middleware->handle($request, function ($req) {
      return response($req);
    });

    $expectData = ['user_name' => 'value', 'nest_key' => ["next_nest_key" => "nextNestValue"]];
    $this->assertEquals(json_encode($expectData), $response->getContent());
  }
}
