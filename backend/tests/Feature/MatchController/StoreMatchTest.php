<?php

namespace Tests\Feature\MatchController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Models\Organization;
use App\Models\Boxer;
use App\Helpers\TestHelper;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;
use Database\Seeders\GradeSeeder;

class StoreMatchTest extends TestCase
{

  use RefreshDatabase;

  protected $boxerNames = ["boxer1", "boxer2", "boxer3", "boxer4"];
  protected $storeMatchData;

  protected function setUp(): void
  {
    parent::setUp();
    $this->seed([
      GradeSeeder::class,
      WeightDivisionSeeder::class
    ]);
    $boxers = [];
    foreach ($this->boxerNames as $name) {
      $boxer = Boxer::factory()->create(['name' => $name]);
      array_push($boxers, $boxer);
    }

    $this->storeMatchData = [
      'match_date' => '2024-10-01',
      'country' => "Japan",
      'red_boxer_id' => 1,
      'blue_boxer_id' => 2,
      'venue' => 'ラスベガス',
      'grade' => 'タイトルマッチ', #grade_id 1
      'weight' => 'ヘビー',     #weight_id 1
      'titles' => ['WBA', 'WBC', 'IBF']
    ];

    $this->seed(OrganizationSeeder::class);
  }

  /**
   * @test
   */
  public function storeMatchSetUpTest()
  {
    $boxerCount = Boxer::count();
    $this->assertSame(count($this->boxerNames), $boxerCount);
  }

  /**
   * タイトルマッチの時はtitle_matchesテーブルへもsoreされる
   */
  public function testStoreMatchWithTitleMatch()
  {
    //?adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());

    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(200);
    //?title_matchesにセットされているか
    $organizationIdArray = array_map(function ($organizationName) {
      $organization = Organization::where('name', $organizationName)->first();
      return $organization->id;
    }, $this->storeMatchData['titles']);

    foreach ($organizationIdArray as $id) {
      $this->assertDatabaseHas('title_matches', ['match_id' => 1, 'organization_id' => $id]);
    }

    $formattedMatchData = $this->formatMatchDataForStore($this->storeMatchData);

    //?matchesにセットされている
    $this->assertDatabaseHas('boxing_matches', $formattedMatchData);
  }

  /**
   * @test
   * タイトルマッチでは無い時はtitle_matchesテーブルへの登録はされない
   */
  public function testStoreMatchWithNonTitleMatch()
  {
    //?adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());

    //?titles配列を空にする
    $this->storeMatchData['titles'] = [];

    //?matchデータ自体はstoreされる
    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(200);
    //?storeしたmatchIdはtitle_matchesにはstoreされていない
    $this->assertDatabaseMissing('title_matches', ['match_id' => 1]);

    $formattedMatchData = $this->formatMatchDataForStore($this->storeMatchData);
    //?boxing_matchesテーブルにセットされている
    $this->assertDatabaseHas('boxing_matches', $formattedMatchData);
  }

  /**
   * adminユーザー以外で実行した時はエラー
   */
  public function testStoreMatchWithNotAdmin()
  {
    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(401);
    //?titles_matchesにもsoreされていない
    $this->assertDatabaseMissing('title_matches', ['match_id' => 1]);

    $formattedMatchData = $this->formatMatchDataForStore($this->storeMatchData);
    //?boxing_matchesにもsoreされていない
    $this->assertDatabaseMissing('boxing_matches', $formattedMatchData);
  }



  /**
   * @param array $matchData
   * @return array formatted match data for store
   */
  private function formatMatchDataForStore(array $matchData): array
  {
    unset($matchData['titles'], $matchData['grade'], $matchData['weight']);
    $formattedMatchData = array_merge($matchData, ["grade_id" => 1], ["weight_id" => 1]); # grade_id=1 タイトルマッチ weight_id=1 ヘビー

    return $formattedMatchData;
  }
}
