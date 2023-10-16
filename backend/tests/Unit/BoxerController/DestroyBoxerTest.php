<?php

namespace Tests\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Helpers\TestHelper;

class DestroyBoxerTest extends TestCase
{

  use RefreshDatabase;


  protected $boxerData;
  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerData = Boxer::factory()->create(["name" => "試合が組まれていないボクサー"]);
    $this->boxers = Boxer::factory()->count(2)->create(); // 試合が組まれているボクサー
    $this->match = BoxingMatch::factory()->create([
      'red_boxer_id' => $this->boxers[0]->id,
      'blue_boxer_id' => $this->boxers[1]->id
    ]);
  }

  /**
   * ボクサーデータの削除(admin権限なし)
   */
  public function testDeleteBoxerWithoutAdminAuth()
  {
    $boxerData = $this->boxerData->toArray();
    $this->assertDatabaseHas('boxers', $boxerData); //対象データがDBに存在しているか
    $response = $this->delete('api/boxer', ["boxer_id" => $boxerData['id']]);
    $response->assertStatus(401);
    $this->assertDatabaseHas('boxers', $boxerData); // 対象ボクサーは削除されていない
  }

  /**
   * ボクサーデータの削除(対象ボクサーの試合が組まれている場合)
   */
  public function testDeleteBoxerHasMatch()
  {
    $boxerData = $this->boxers[0]->toArray();
    $this->assertDatabaseHas('boxers', $boxerData); //まず対象データがDBに存在しているか
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('api/boxer', ["boxer_id" => $boxerData['id']]);
    $response->assertStatus(406);
    $this->assertDatabaseHas('boxers', $boxerData); // 対象ボクサーは削除されていない
  }
  /**
   * ボクサーデータの削除
   */
  public function testDeleteBoxer()
  {
    $boxerData = $this->boxerData->toArray();
    $this->assertDatabaseHas('boxers', $boxerData); //まず対象データがDBに存在しているか
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('api/boxer', ["boxer_id" => $boxerData['id']]);
    $response->assertStatus(200);
    $this->assertDatabaseMissing('boxers', $boxerData); // 対象ボクサーが削除されている
  }
}
