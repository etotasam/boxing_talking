<?php

namespace Tests\Feature\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use App\Repositories\TitleRepository;
use App\Helpers\TestHelper;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class StoreBoxerTest extends TestCase
{

  use RefreshDatabase;


  protected $boxerData;
  protected $mockTitleRepository;
  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerData = Boxer::factory(["name" => "テストボクサー"])->make()->toArray();
    $this->seed([OrganizationSeeder::class, WeightDivisionSeeder::class]);
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

  /**
   * ボクサーの登録時にタイトルの保存に失敗した(titlesテーブルへの保存)
   */
  public function testStoreBoxerWithFailedStoreTitle()
  {
    /**
     * @var TitleRepository|\Mockery\MockInterface $mockTitleRepository
     */
    $this->mockTitleRepository = \Mockery::mock(TitleRepository::class);
    $this->mockTitleRepository->makePartial();
    $this->mockTitleRepository->shouldReceive('storeTitlesHoldByTheBoxer')->andReturn(false);
    $this->app->instance(TitleRepositoryInterface::class, $this->mockTitleRepository);

    //adminユーザとして実行
    $this->actingAs(TestHelper::createAdminUser());
    $this->boxerData['titles'] = [
      ["organization" => "WBA", "weight" => "ヘビー"]
    ];
    $response = $this->post('api/boxer', $this->boxerData);
    $response->assertStatus(500);
    unset($this->boxerData['titles']);
    //ボクサーデータはrollbackされ、DBには保存されていない
    $this->assertDatabaseMissing('boxers', $this->boxerData);
  }
}
