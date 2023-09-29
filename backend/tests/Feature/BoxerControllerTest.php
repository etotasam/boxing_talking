<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Database\Seeders\BoxerSeeder;
use App\Models\Boxer;


class MatchControllerTest extends TestCase
{

  use RefreshDatabase;

  protected function setUp(): void
  {
    parent::setUp();
    // $this->boxerController = new BoxerController(new Boxer, new BoxingMatch, new BoxerService, new Title);
    $this->seed(BoxerSeeder::class);
    Boxer::factory()->create([
      "name" => "アメリカンボクサー",
      "country" => "USA"
    ]);
    Boxer::factory()->create([
      "name" => "ブリティッシュボクサー",
      "country" => "UK"
    ]);
  }

  /**
   * @test
   */
  public function fetchBoxersAndCountTest()
  {
    //setupでの状態をテスト
    $this->assertDatabaseCount('boxers', 12); // seederで10件作成している

  }
}
