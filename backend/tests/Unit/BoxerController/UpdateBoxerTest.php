<?php

namespace Tests\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Helpers\TestHelper;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class UpdateBoxerTest extends TestCase
{

  use RefreshDatabase;

  protected $boxerData;
  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerData = Boxer::factory()->create(["name" => "更新対象ボクサー"]);
    $this->seed(WeightDivisionSeeder::class);
    $this->seed(OrganizationSeeder::class);
  }

  /**
   * ボクサーデータの更新(admin権限なしで実行)
   */
  public function testUpdateBoxerWithoutAdmin()
  {
    $boxerData = $this->boxerData->toArray();
    $this->assertDatabaseHas('boxers', $this->boxerData->toArray()); // 対象ボクサーがDBに存在しているか

    $response = $this->patch('api/boxer', ["id" => $boxerData['id'], "name" => "変更後の名前"]);
    $response->assertStatus(401);
    $this->assertDatabaseMissing('boxers', ["name" => "変更後の名前"]);
  }

  /**
   * ボクサーデータの更新
   */
  public function testUpdateBoxer()
  {
    $boxerData = $this->boxerData->toArray();
    $this->assertDatabaseHas('boxers', $this->boxerData->toArray()); // 対象ボクサーがDBに存在しているか

    $titlesUpdateData = [
      ["organization" => "WBA", "weight" => "ヘビー"]
    ];

    $this->actingAs(TestHelper::createAdminUser()); // admin権限ありのユーザーで実行
    $response = $this->patch('api/boxer', ["id" => $boxerData['id'], "titles" => $titlesUpdateData, "name" => "変更後の名前"]);
    $response->assertStatus(200);
    $this->assertDatabaseHas('boxers', ["name" => "変更後の名前"])
      ->assertDatabaseHas('titles', ["boxer_id" => $boxerData['id'], "organization_id" => 1, "weight_division_id" => 1]);
    // "organization_id" => 1 WBAのidナンバー
    // "weight_division_id" => 1 ヘビー のidナンバー
  }
}
