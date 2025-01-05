<?php

namespace Tests\Unit;

// use PHPUnit\Framework\TestCase;
use Mockery as m;
use \Illuminate\Support\Collection;
use Tests\TestCase;
use App\Helpers\TestHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\TitleMatch;
use App\Models\BoxerTitleSnapshot;
use App\Services\BoxerTitleSnapshotService;
use App\Repositories\BoxerTitleSnapshotRepository;
use App\Repositories\Interfaces\BoxerTitleSnapshotInterface;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class BoxerTitleSnapshotUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected $boxerTitleSnapshotService;
    protected $boxerTitleSnapshotRepository;
    protected function setUp(): void
    {
        parent::setUp();
        $this->boxerTitleSnapshotRepository  = new BoxerTitleSnapshotRepository;
        $this->boxerTitleSnapshotService = new BoxerTitleSnapshotService($this->boxerTitleSnapshotRepository);

        //? 管理者権限
        $this->actingAs(TestHelper::createAdminUser());

        //? シードデータ(タイトルの団体、階級)
        $this->seed(OrganizationSeeder::class);
        $this->seed(WeightDivisionSeeder::class);

        $this->weight = [
            "middle" => 5,
            "welter" => 7,
        ];

        $this->organization = [
            "WBA" => 1,
            "WBC" => 2,
            "WBO" => 3,
            "IBF" => 4,
        ];

        //? ボクサー作成
        [$this->redBoxer, $this->blueBoxer] = Boxer::factory()->count(2)->create();
        //? 試合作成
        $this->match = BoxingMatch::factory()->create([
            'red_boxer_id' => $this->redBoxer->id,
            'blue_boxer_id' => $this->blueBoxer->id,
            'weight_id' => $this->weight["middle"],
        ],);
        //? 試合のタイトル
        TitleMatch::insert(
            [
                ["match_id" => $this->match->id, "organization_id" => $this->organization["WBA"]],
                ["match_id" => $this->match->id, "organization_id" => $this->organization["WBC"]],
                ["match_id" => $this->match->id, "organization_id" => $this->organization["WBO"]],
                // ["match_id" => $this->match->id, "organization_id" => $this->organization["IBF"]],
            ]
        );
        //? ボクサーの保持タイトルをスナップショットに保存
        BoxerTitleSnapshot::insert(
            [
                ["match_id" => $this->match->id, "boxer_id" => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "weight_division_id" => $this->weight["middle"], "state" => null],
                ["match_id" => $this->match->id, "boxer_id" => $this->redBoxer->id, "organization_id" => $this->organization["IBF"], "weight_division_id" => $this->weight["middle"], "state" => null],
                ["match_id" => $this->match->id, "boxer_id" => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "weight_division_id" => $this->weight["welter"], "state" => null],
                ["match_id" => $this->match->id, "boxer_id" => $this->blueBoxer->id, "organization_id" => $this->organization["WBC"], "weight_division_id" => $this->weight["middle"], "state" => null],
            ]
        );
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        m::close();
    }


    /**
     * @test
     */
    public function testSetUp()
    {
        $this->markTestSkipped();
        //? setUpした試合がDBに存在しているか
        $this->assertDatabaseHas('boxing_matches', $this->match->toArray());
    }

    /**
     * @test
     * BoxerTitleSnapshotのupdate時にstateの初期化に失敗したら例外を投げられるかをテスト
     */
    public function testThrowExceptionWhenResetFailed()
    {

        //? 例外が投げられることを期待
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Failed reset boxer title snapshot state to null');

        //? mockの作成
        /** @var \App\Repositories\Interfaces\BoxerTitleSnapshotInterface|\Mockery\MockInterface $mockRepository */
        $mockRepository = m::mock(BoxerTitleSnapshotInterface::class);

        //? mockの振る舞いを設定
        $mockRepository->shouldReceive('resetBoxerTitleSnapshot')
            ->andReturn(true);

        //? mockをserviceクラスにDI
        $this->boxerTitleSnapshotService = new BoxerTitleSnapshotService($mockRepository);

        //? テスト実行
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'draw', $this->redBoxer->id, $this->blueBoxer->id);
    }

    /**
     * @test
     *  BoxerTitleSnapshotのstateを更新するテスト
     * 勝者がいる場合はstateを更新する
     * 試合に掛けられたタイトルと選手の保持していたタイトルが同じ場合にstateを更新し、それ以外はnullのままにする
     */
    public function testUpdateBoxerTitleSnapshotState()
    {

        //? redが勝利したパターンのアップデートを実行
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'red', $this->redBoxer->id, $this->blueBoxer->id);

        //? 選手の保持タイトルstateが勝敗で更新されているか
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->redBoxer->id, 'organization_id' => $this->organization["WBA"], "weight_division_id" => $this->weight["middle"], "state" => "still"]);
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->blueBoxer->id, 'organization_id' => $this->organization["WBC"], "weight_division_id" => $this->weight["middle"], "state" => "fall"]);
        //? 保持タイトルでも試合に掛けられていないタイトルはstateがnullのままか
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->redBoxer->id, 'organization_id' => $this->organization["IBF"], "weight_division_id" => $this->weight["middle"], "state" => null]);
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->redBoxer->id, 'organization_id' => $this->organization["WBA"], "weight_division_id" => $this->weight["welter"], "state" => null]);
    }

    /**
     * @test
     * 新たなタイトルを取得した時に新しいスナップショットを作成し、stateはnewになるか
     */
    public function testNewBoxerTitle()
    {
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'blue', $this->redBoxer->id, $this->blueBoxer->id);

        //? 勝った選手(blue)のスナップショットに新たなタイトルが追加されていて、stateがnewになっているか
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->blueBoxer->id, 'organization_id' => $this->organization["WBA"], "weight_division_id" => $this->weight["middle"], "state" => "new"]);
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->blueBoxer->id, 'organization_id' => $this->organization["WBO"], "weight_division_id" => $this->weight["middle"], "state" => "new"]);
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->blueBoxer->id, 'organization_id' => $this->organization["WBC"], "weight_division_id" => $this->weight["middle"], "state" => "still"]);
        //? 負けた選手(red)は所持していたタイトルのstateがfallになっているか
        $this->assertDatabaseHas('boxer_title_snapshots', ['match_id' => $this->match->id, 'boxer_id' => $this->redBoxer->id, 'organization_id' => $this->organization["WBA"], "weight_division_id" => $this->weight["middle"], "state" => "fall"]);
    }

    /**
     * @test
     * 試合結果を変更する際、勝敗が変わる場合はstateがnewのレコードを削除する
     */
    public function testDeleteNewTitleSnapshot()
    {
        //? 事前データ
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'blue', $this->redBoxer->id, $this->blueBoxer->id);
        $this->assertDatabaseHas('boxer_title_snapshots', [
            'match_id' => $this->match->id,
            'boxer_id' => $this->blueBoxer->id,
            'organization_id' => $this->organization["WBA"],
            "weight_division_id" => $this->weight["middle"],
            "state" => "new"
        ]);

        //? 勝敗が変わる変更をした際にnewのレコードが削除されているか
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'red', $this->redBoxer->id, $this->blueBoxer->id);
        $this->assertDatabaseMissing('boxer_title_snapshots', [
            'match_id' => $this->match->id,
            'boxer_id' => $this->blueBoxer->id,
            'organization_id' => $this->organization["WBA"],
            "weight_division_id" => $this->weight["middle"],
            "state" => "new"
        ]);
        $this->assertDatabaseMissing('boxer_title_snapshots', [
            'match_id' => $this->match->id,
            'boxer_id' => $this->blueBoxer->id,
            'organization_id' => $this->organization["WBO"],
            "weight_division_id" => $this->weight["middle"],
            "state" => "new"
        ]);
    }

    /**
     * @test
     * 試合結果で、ボクサーが新たなタイトルを取得した時、titlesテーブルの方にもそのタイトル情報が登録されているか
     */
    // TODO このテストが通る様にしてねー、あと関数名はちょっと考えてねー
    public function testTitlesTableStoreWhenTakeNewTitle()
    {
        $this->boxerTitleSnapshotService->updateBoxerTitleSnapshotState($this->match, 'blue', $this->redBoxer->id, $this->blueBoxer->id);

        $this->assertDatabaseHas('titles', [
            'boxer_id' => $this->blueBoxer->id,
            'organization_id' => $this->organization["WBA"],
            "weight_division_id" => $this->weight["middle"],
        ]);
        $this->assertDatabaseHas('boxer_title_snapshots', [
            'boxer_id' => $this->blueBoxer->id,
            'organization_id' => $this->organization["WBO"],
            "weight_division_id" => $this->weight["middle"],
        ]);
    }
}
