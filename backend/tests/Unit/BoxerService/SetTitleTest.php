<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Title;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\Organization;
use App\Models\WeightDivision;
use App\Services\BoxerService;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class SetTitleTest extends TestCase
{

  use RefreshDatabase;

  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerService = new BoxerService(new Organization, new WeightDivision, new Title, new Boxer, new BoxingMatch);
  }


  /**
   * @test
   */
  public function titleDeleteBeforeSetTitle(): void
  {
    $this->seed(WeightDivisionSeeder::class);
    $this->seed(OrganizationSeeder::class);
    $boxer = Boxer::create(
      [
        'name' => "ボクサー1",
        'eng_name' => "boxer1",
        'country' => "Japan",
        'birth' => "1981-06-18",
        'height' => "179",
        'reach' => "181",
        'style' => "southpaw",
        'ko' => 1,
        'win' => 1,
        'lose' => 0,
        'draw' => 1,
      ]
    );

    $titles = Title::create([
      "boxer_id" => $boxer->id,
      "organization_id" => 1, // WBA
      "weight_division_id" => 1 // ヘビー
    ]);
    $titlesArray = $titles->toArray();

    $newSetTitles = [
      [
        "organization" => "WBC",
        "weight" => "クルーザー"
      ]
    ];

    //? 実行前に保持タイトルがtitlesテーブルに存在しているか
    $this->assertDatabaseHas('titles', $titlesArray);
    //? テスト対象メソッドの実行
    $this->boxerService->setTitle($boxer->id, $newSetTitles);
    //? titlesをセットする前に保持しているtitlesが削除されているか
    $this->assertDatabaseMissing('titles', $titlesArray);
    //? 新たにセットしたタイトルがDBに登録されているか
    $this->assertDatabaseHas(
      'titles',
      [
        "boxer_id" => $boxer->id,
        "organization_id" => 2, // WBC
        "weight_division_id" => 2 // クルーザー
      ]
    );
  }
}
