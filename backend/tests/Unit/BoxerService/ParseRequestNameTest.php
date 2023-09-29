<?php

use Tests\TestCase;


use App\Services\BoxerService;
use Illuminate\Database\Eloquent\Model;
use App\Models\Title;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\Organization;
use App\Models\WeightDivision;

class ParseRequestNameTest extends TestCase
{

  protected function setUp(): void
  {
    parent::setUp();
    // $this->mock = Mockery::mock(Model::class);
    $this->boxerService = new BoxerService(new Organization, new WeightDivision, new Title, new Boxer, new BoxingMatch);
  }


  /**
   * @test
   */
  public function parseRequestNameInThatCaseNull(): void
  {
    $response = $this->boxerService->parseRequestName(null);
    list($eng_name, $name) = $response;
    $this->assertSame(null, $name);
    $this->assertSame(null, $eng_name);
  }


  /**
   * @test
   */
  public function parseRequestNameInThatCaseJapanese(): void
  {
    $japaneseName = "ボクサーの名前";
    $response = $this->boxerService->parseRequestName($japaneseName);
    list($eng_name, $name) = $response;
    $this->assertSame($japaneseName, $name);
    $this->assertSame(null, $eng_name);
  }
  /**
   * @test
   */
  public function parseRequestNameInThatCaseEnglish(): void
  {
    $engName = "english name";
    $response = $this->boxerService->parseRequestName($engName);
    list($eng_name, $name) = $response;
    $this->assertSame(null, $name);
    $this->assertSame($engName, $eng_name);
  }
}
