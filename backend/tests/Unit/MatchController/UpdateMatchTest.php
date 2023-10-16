<?php

namespace Tests\MatchController;

use Mockery\MockInterface;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Helpers\TestHelper;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Services\TitleMatchService;

class UpdateMatchTest extends TestCase
{

  use RefreshDatabase;


  /**
   * @var TitleMatchService|\Mockery\MockInterface $mockTitleMatchService
   */
  protected TitleMatchService $mockTitleMatchService;
  protected $boxerNames = ["boxer1", "boxer2"];
  protected $match;

  protected function setUp(): void
  {
    parent::setUp();
    $this->mockTitleMatchService = \Mockery::mock(TitleMatchService::class);
    Boxer::factory()->count(2)->create(); // boxer_idの1と2を作成
    $this->match = BoxingMatch::factory()->create(['country' => 'Japan', 'red_boxer_id' => 1, 'blue_boxer_id' => 2]);
  }

  private function mockSetUp()
  {
    $this->mockTitleMatchService->shouldReceive('updateExecute')->andReturn(null);
    $this->app->instance(TitleMatchService::class, $this->mockTitleMatchService);
  }

  /**
   * @test
   * patch '/api/match' 時のboxing_matchesテーブルのupdate確認(それに伴うtitle_matchesテーブルの更新はモックしている)
   */
  public function testUpdateMatchFailedNoAdminUser()
  {
    $this->mockSetUp();

    $updateData = [
      'match_id' => $this->match->id,
      'update_match_data' => ['country' => 'USA', 'titles' => ['WBA']]
    ];

    $response = $this->patch('/api/match', $updateData);
    $response->assertStatus(401);
    $this->assertDatabaseMissing('boxing_matches', ['country' => 'USA']);
  }

  /**
   * @test
   * patch '/api/match' 時のboxing_matchesテーブルのupdate確認(それに伴うtitle_matchesテーブルの更新はモックしている)
   */
  public function testUpdateMatchWithOnlyTitlesData()
  {
    $this->mockSetUp();

    $updateData = [
      'match_id' => $this->match->id,
      'update_match_data' => ['titles' => ['WBA', 'WBO']]
    ];
    //adminユーザーとして実行
    $this->actingAs(TestHelper::createAdminUser());

    $response = $this->patch('/api/match', $updateData);
    // $response->dump();
    $response->assertStatus(200);
  }

  /**
   * @test
   * patch '/api/match' 時のboxing_matchesテーブルのupdate確認(それに伴うtitle_matchesテーブルの更新はモックしている)
   */
  public function testUpdateMatchWithBothData()
  {
    $this->mockSetUp();

    $updateData = [
      'match_id' => $this->match->id,
      'update_match_data' => ['country' => 'USA', 'titles' => ['WBA']]
    ];
    //adminユーザーとして実行
    $this->actingAs(TestHelper::createAdminUser());

    $response = $this->patch('/api/match', $updateData);
    $response->assertStatus(200);
    $this->assertDatabaseHas('boxing_matches', ['country' => 'USA']);
  }
}
