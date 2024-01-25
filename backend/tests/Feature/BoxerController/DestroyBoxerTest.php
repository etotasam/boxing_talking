<?php

namespace Tests\Feature\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\Title;
use App\Helpers\TestHelper;
use App\Repositories\Interfaces\BoxerRepositoryInterface;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;
use Database\Seeders\TitleSeeder;
use Database\Seeders\BoxerSeeder;

class DestroyBoxerTest extends TestCase
{

  use RefreshDatabase;


  protected $boxerData;
  protected $title;
  protected $boxers;
  protected $match;
  protected $mockBoxerRepository;
  protected function setUp(): void
  {
    parent::setUp();
    $this->seed([
      WeightDivisionSeeder::class,
      OrganizationSeeder::class,
      BoxerSeeder::class,

    ]);
    $this->boxerData = Boxer::factory()->create(["name" => "試合が組まれていないボクサー"]);
    $this->title = Title::factory()->create(["boxer_id" => $this->boxerData->id]);
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
    $response->assertStatus(400);
    $this->assertDatabaseHas('boxers', $boxerData); // 対象ボクサーは削除されていない
  }

  /**
   * 削除対象のボクサーが見つからない
   */
  public function testDeleteIfNotExistsBoxer()
  {
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('api/boxer', ["boxer_id" => 100]); // 存在しないボクサーID
    $response->assertStatus(404);
  }

  /**
   * 削除が失敗した時404
   */
  public function testDeleteBoxerFailed()
  {
    /**
     * @var BoxerRepositoryInterface|\Mockery\MockInterface $mockBoxerRepository
     */
    $this->mockBoxerRepository = \Mockery::mock(BoxerRepositoryInterface::class);
    $this->mockBoxerRepository->makePartial();
    $this->mockBoxerRepository->shouldReceive('deleteBoxer')->andReturn(false);
    $this->app->instance(BoxerRepositoryInterface::class, $this->mockBoxerRepository);

    $boxerData = $this->boxerData->toArray();
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('api/boxer', ["boxer_id" => $boxerData['id']]); // 存在しないボクサーID
    $response->assertStatus(404);
  }

  /**
   * ボクサーデータの削除(成功)
   */
  public function testDeleteBoxer()
  {
    $boxerData = $this->boxerData->toArray();

    $this->assertDatabaseHas('boxers', $boxerData);
    $this->assertDatabaseHas('titles', $this->title->toArray());
    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $response = $this->delete('api/boxer', ["boxer_id" => $boxerData['id']]);
    $response->assertStatus(200);
    $this->assertDatabaseMissing('boxers', $boxerData);
    $this->assertDatabaseMissing('titles', $this->title->toArray());
  }
}
