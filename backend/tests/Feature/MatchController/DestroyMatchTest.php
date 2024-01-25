<?php

namespace Tests\Feature\MatchController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Helpers\TestHelper;
use App\Models\BoxingMatch;
use App\Models\Organization;
use App\Models\TitleMatch;
use App\Models\Boxer;
use Database\Seeders\OrganizationSeeder;

class DestroyMatchTest extends TestCase
{

  use RefreshDatabase;

  protected $boxerNames = ["boxer1", "boxer2"];
  protected $targetMatchId;
  protected $targetMatchTitles = ['WBA', 'WBO'];
  protected $storeMatchData = [
    'match_date' => '2023-10-01',
    'country' => "Japan",
    'red_boxer_id' => 1,
    'blue_boxer_id' => 2,
    'venue' => 'ラスベガス',
    'grade' => 'タイトルマッチ',
    'weight' => 'ヘビー',
  ];

  protected function setUp(): void
  {
    parent::setUp();
    $boxers = [];
    foreach ($this->boxerNames as $name) {
      $boxer = Boxer::factory()->create(['name' => $name]);
      array_push($boxers, $boxer);
    }
    $match = BoxingMatch::create($this->storeMatchData);
    $this->targetMatchId = $match->id;

    //title_matchesにstore
    $this->seed(OrganizationSeeder::class);
    foreach ($this->targetMatchTitles as $titleName) {
      $organization = Organization::where('name', $titleName)->first();
      TitleMatch::create(['match_id' => $this->targetMatchId, 'organization_id' => $organization->id]);
    }
  }

  /**
   * @test
   * セットアップで入れたデーががDBに入っているか
   */
  public function testDeleteMatchSetUp()
  {
    $this->assertDatabaseHas('boxing_matches', ['id' => $this->targetMatchId]);
    $this->assertDatabaseHas('title_matches', ['match_id' => $this->targetMatchId]);
  }

  /**
   * @test
   * 正常に削除されている
   */
  public function testDeleteMatch()
  {
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('/api/match', ['match_id' => $this->targetMatchId]);
    $response->assertStatus(200);
    //データは削除される
    $this->assertDatabaseMissing('boxing_matches', ['id' => $this->targetMatchId]);
    $this->assertDatabaseMissing('title_matches', ['match_id' => $this->targetMatchId]);
  }

  /**
   * @test
   * 存在しないmatchをdeleteしようとすると403
   */
  public function testDeleteMatchIfMatchNotExists()
  {
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('/api/match', ['match_id' => 100]); //存在しないmatch_id
    $response->assertStatus(404);
    //データは削除されていない
    $this->assertDatabaseHas('boxing_matches', ['id' => $this->targetMatchId]);
    $this->assertDatabaseHas('title_matches', ['match_id' => $this->targetMatchId]);
  }

  /**
   * @test
   * admin認証がない場合のリクエストは401
   */
  public function testDeleteMatchWithNoAdmin()
  {
    $response = $this->delete('/api/match', ['match_id' => $this->targetMatchId]);
    $response->assertStatus(401);
    //データは削除されていない
    $this->assertDatabaseHas('boxing_matches', ['id' => $this->targetMatchId]);
    $this->assertDatabaseHas('title_matches', ['match_id' => $this->targetMatchId]);
  }
}
