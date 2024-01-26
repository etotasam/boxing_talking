<?php

namespace Tests\Unit\BoxerService;

use Tests\TestCase;
use App\Services\BoxerService;
use Illuminate\Database\Eloquent\Model;

class ParseRequestNameTest extends TestCase
{

  protected function setUp(): void
  {
    parent::setUp();
    // $this->mock = Mockery::mock(Model::class);
    $this->boxerService = app()->make(BoxerService::class);
  }


  /**
   * @test
   */
  public function testParseRequestNameInThatCaseNull(): void
  {
    $response = $this->boxerService->parseRequestName(null);
    [$eng_name, $name] = $response;
    $this->assertSame(null, $name);
    $this->assertSame(null, $eng_name);
  }


  /**
   * @test
   */
  public function testParseRequestNameInThatCaseJapanese(): void
  {
    $japaneseName = "ボクサーの名前";
    $response = $this->boxerService->parseRequestName($japaneseName);
    [$eng_name, $name] = $response;
    $this->assertSame($japaneseName, $name);
    $this->assertSame(null, $eng_name);
  }
  /**
   * @test
   */
  public function testParseRequestNameInThatCaseEnglish(): void
  {
    $engName = "english name";
    $response = $this->boxerService->parseRequestName($engName);
    [$eng_name, $name] = $response;
    $this->assertSame(null, $name);
    $this->assertSame($engName, $eng_name);
  }
}
