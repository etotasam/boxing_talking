<?php

namespace Tests\MatchController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Models\Organization;
use App\Models\Boxer;
use App\Helpers\TestHelper;
use Database\Seeders\OrganizationSeeder;

class StoreMatchTest extends TestCase
{

  use RefreshDatabase;

  protected $boxerNames = ["boxer1", "boxer2", "boxer3", "boxer4"];
  protected $storeMatchData;

  protected function setUp(): void
  {
    parent::setUp();
    $boxers = [];
    foreach ($this->boxerNames as $name) {
      $boxer = Boxer::factory()->create(['name' => $name]);
      array_push($boxers, $boxer);
    }

    $this->storeMatchData = [
      'match_date' => '2023-10-01',
      'country' => "Japan",
      'red_boxer_id' => 1,
      'blue_boxer_id' => 2,
      'venue' => 'ラスベガス',
      'grade' => 'タイトルマッチ',
      'weight' => 'ヘビー',
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
   * @test
   * タイトルマッチの時はtitle_matchesテーブルへもsoreされる
   */
  public function testStoreMatchWithTitleMatch()
  {
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());

    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(200);
    //title_matchesにセットされているか
    $organizationIdArray = array_map(function ($organizationName) {
      $organization = Organization::where('name', $organizationName)->first();
      return $organization->id;
    }, $this->storeMatchData['titles']);
    foreach ($organizationIdArray as $id) {
      $this->assertDatabaseHas('title_matches', ['match_id' => 1, 'organization_id' => $id]);
    }
    //matchesにセットされているか
    unset($this->storeMatchData['titles']);
    $this->assertDatabaseHas('boxing_matches', $this->storeMatchData);
  }

  /**
   * @test
   * タイトルマッチでは無い時はtitle_matchesテーブルへの登録はされない
   */
  public function testStoreMatchWithNonTitleMatch()
  {
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());

    //titles配列を空にする
    $this->storeMatchData['titles'] = [];

    //matchデータ自体はstoreされる
    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(200);
    //storeしたmatchIdはtitle_matchesにはstoreされていない
    $this->assertDatabaseMissing('title_matches', ['match_id' => 1]);
    //boxing_matchesテーブルにセットされている
    unset($this->storeMatchData['titles']);
    $this->assertDatabaseHas('boxing_matches', $this->storeMatchData);
  }

  /**
   * @test
   * adminユーザー以外で実行した時はエラー
   */
  public function testStoreMatchWithNotAdmin()
  {
    $response = $this->post('/api/match', $this->storeMatchData);
    $response->assertStatus(401);
    //titles_matchesにもsoreされていない
    $this->assertDatabaseMissing('title_matches', ['match_id' => 1]);
    //boxing_matchesにもsoreされていない
    unset($this->storeMatchData['titles']);
    $this->assertDatabaseMissing('boxing_matches', $this->storeMatchData);
  }
}
