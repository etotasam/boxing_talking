<?php

namespace Tests\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Helpers\TestHelper;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class StoreBoxerTest extends TestCase
{

  use RefreshDatabase;


  protected $boxerData;
  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerData = Boxer::factory(["name" => "テストボクサー"])->make()->toArray();
    $this->seed(WeightDivisionSeeder::class);
    $this->seed(OrganizationSeeder::class);
  }

  /**
   * ボクサーの登録(保持タイトルなし)
   */
  public function testStoreBoxerWithoutTitles()
  {
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $this->boxerData['titles'] = []; // 保持タイトルなし
    $response = $this->post('api/boxer', $this->boxerData);
    $response->assertStatus(200);
    unset($this->boxerData['titles']);
    $this->assertDatabaseHas('boxers', $this->boxerData);
  }

  /**
   * ボクサーの登録(保持タイトルあり)
   */
  public function testStoreBoxerWithTitles()
  {
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $this->boxerData['titles'] = [
      ["organization" => "WBA", "weight" => "ヘビー"]
    ];
    $response = $this->post('api/boxer', $this->boxerData);
    $response->assertStatus(200);
    unset($this->boxerData['titles']);
    $this->assertDatabaseHas('boxers', $this->boxerData);
  }
}
