<?php

namespace Tests\Unit\TitleService;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Title;
use App\Models\Boxer;
use App\Services\BoxerService;
use App\Services\TitleService;
use App\Repositories\Interfaces\TitleRepositoryInterface;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class StoreTitleMethodTest extends TestCase
{

  use RefreshDatabase;

  protected $titleService;
  protected $boxer;
  protected $titles;
  protected function setUp(): void
  {
    parent::setUp();
    $this->seed([OrganizationSeeder::class, WeightDivisionSeeder::class]);
    $this->titleService = app()->make(TitleService::class);

    $this->boxer = Boxer::factory()->create(["name" => "ボクサー1"]);

    //現在保持しているタイトル
    $this->titles = Title::create([
      "boxer_id" => $this->boxer->id,
      "organization_id" => 1, // WBA
      "weight_division_id" => 1 // ヘビー
    ]);
  }


  /**
   * ボクサーの保持タイトル(titlesテーブル)を変更更新
   */
  public function testUpdateTitlesTable(): void
  {
    //新たに登録するタイトル(formatはフロント側から送れてくる形式)
    $newSetTitles = [
      [
        "organization" => "WBC", // id 2
        "weight" => "クルーザー"  // id 2
      ]
    ];

    $titlesArray = $this->titles->toArray();
    //? 実行前に保持タイトルがtitlesテーブルに存在しているか
    $this->assertDatabaseHas('titles', $titlesArray);
    //? テスト対象メソッドの実行
    $this->titleService->storeTitle($this->boxer->id, $newSetTitles);
    //? titlesをセットする前に保持しているtitlesが削除されているか
    $this->assertDatabaseMissing('titles', $titlesArray);
    //? 新たにセットしたタイトルがDBに登録されているか
    $this->assertDatabaseHas(
      'titles',
      [
        "boxer_id" =>  $this->boxer->id,
        "organization_id" => 2, // WBC
        "weight_division_id" => 2 // クルーザー
      ]
    );
  }


  /**
   * titlesテーブルへの保存に失敗した時は例外がthrowされているか
   */
  public function testThrowExceptionIfFailedStoreTitle()
  {

    /**
     * @var TitleRepositoryInterface|\Mockery\MockInterface $mockTitleRepository
     */
    $mockTitleRepository = \Mockery::mock(TitleRepositoryInterface::class);
    $mockTitleRepository->makePartial();
    $mockTitleRepository->shouldReceive('storeTitlesHoldByTheBoxer')->andReturn(false);
    $this->titleService = (new TitleService($mockTitleRepository));

    //新たに登録するタイトル(formatはフロント側から送れてくる形式)
    $newSetTitles = [
      [
        "organization" => "WBC", // id 2
        "weight" => "クルーザー"  // id 2
      ]
    ];

    //? expectExceptionは例外の発生を期待するメソッドが実行される前に定義する
    $this->expectException(\Exception::class);
    // テスト対象メソッドの実行
    $this->titleService->storeTitle($this->boxer->id, $newSetTitles);
  }
}
