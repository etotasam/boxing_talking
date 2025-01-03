<?php

namespace Tests\Feature\Feature\MatchController;

use Tests\TestCase;
use App\Helpers\TestHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\TitleMatch;
use App\Models\Title;
use App\Models\MatchResult;
use App\Models\BoxerTitleSnapshot;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;

class ResultStoreTest extends TestCase
{
    use RefreshDatabase;
    protected $matchResultService;


    protected function setUp(): void
    {
        parent::setUp();

        //? 管理者権限
        $this->actingAs(TestHelper::createAdminUser());

        $this->seed(OrganizationSeeder::class);
        $this->seed(WeightDivisionSeeder::class);

        $this->division = [
            "heavy" => 1,
            "cruiser" => 2,
            "lightHeavy" => 3,
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
            'weight_id' => 1, //ヘビー級
        ],);
        //? 試合のタイトル
        TitleMatch::insert(
            [
                ["match_id" => $this->match->id, "organization_id" => 1], //WBA
                ["match_id" => $this->match->id, "organization_id" => 2], //WBC
                ["match_id" => $this->match->id, "organization_id" => 3], //WBO
                ["match_id" => $this->match->id, "organization_id" => 4], //IBF
            ]
        );
        //? 試合時にボクサー保持タイトル(BoxerTitleSnapshot)
        $this->boxerTitleSnapshot = [
            [
                "match_id" => $this->match->id,
                "boxer_id" => $this->redBoxer->id,
                "organization_id" => $this->organization["WBA"],
                "weight_division_id" => $this->division["heavy"]
            ],
            [
                "match_id" => $this->match->id,
                "boxer_id" => $this->redBoxer->id,
                "organization_id" => $this->organization["WBC"],
                "weight_division_id" => $this->division["heavy"]
            ],
            [
                "match_id" => $this->match->id,
                "boxer_id" => $this->blueBoxer->id,
                "organization_id" => $this->organization["WBO"],
                "weight_division_id" => $this->division["heavy"]
            ],
            [
                "match_id" => $this->match->id,
                "boxer_id" => $this->blueBoxer->id,
                "organization_id" => $this->organization["IBF"],
                "weight_division_id" => $this->division["heavy"]
            ],
        ];
        BoxerTitleSnapshot::insert($this->boxerTitleSnapshot);

        $this->titleSnapshot = BoxerTitleSnapshot::where("match_id", $this->match->id);

        //? 試合結果登録
        $this->result = MatchResult::create(
            ["match_id" => $this->match->id, "match_result" => "red", "detail" => "ko", "round" => 1]
        );
    }


    /**
     * @test
     */
    public function testSetup()
    {
        $this->markTestSkipped();

        $this->assertDatabaseHas('match_results', ['match_id' => $this->match->id, 'match_result' => "red", 'detail' => "ko", "round" => 1]);
    }

    /**
     * @test
     */
    public function testUpdateBoxerTitleStateWhenRedBoxerWins()
    {
        // $this->markTestSkipped();

        $match_id = $this->match->id;
        $result = "red";
        $detail = "ko";
        $round = 1;

        //リクエスト送信
        $response = $this->post('/api/match/result', compact("match_id", "result", "detail", "round"));
        $expectedResult = [
            // ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBO"], "state" => "new"],
            // ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["IBF"], "state" => "new"],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "state" => "still"],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBC"], "state" => "still"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["WBO"], "state" => "fall"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["IBF"], "state" => "fall"],
        ];

        foreach ($expectedResult as $result) {
            $this->assertDatabaseHas('boxer_title_snapshots', array_merge([
                'match_id' => $this->match->id,
                "weight_division_id" => $this->division["heavy"],
            ], $result));
        }
        $response->assertStatus(200);
    }


    /**
     * @test
     */
    public function testUpdateBoxerTitleStateWhenBlueBoxerWins()
    {
        // $this->markTestSkipped();

        $match_id = $this->match->id;
        $result = "blue";
        $detail = "ko";
        $round = 1;

        //リクエスト送信
        $response = $this->post('/api/match/result', compact("match_id", "result", "detail", "round"));
        $expectedResult = [
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "state" => "fall"],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBC"], "state" => "fall"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["WBO"], "state" => "still"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["IBF"], "state" => "still"],
        ];

        foreach ($expectedResult as $result) {
            $this->assertDatabaseHas('boxer_title_snapshots', array_merge([
                'match_id' => $this->match->id,
                "weight_division_id" => $this->division["heavy"],
            ], $result));
        }
        $response->assertStatus(200);
    }

    /** @test */
    public function testUpdateBoxerTitleForResultDraw()
    {

        // $this->markTestSkipped();

        //事前にデータを入れておく(stateのデフォルト値がnullなので変更しておく)
        $this->post('/api/match/result', ["match_id" => $this->match->id, "result" => "red", "detail" => "ko", "round" => 1])
            ->assertStatus(200);

        $match_id = $this->match->id;
        $result = "draw";
        $detail = null;
        $round = null;

        //リクエスト送信
        $response = $this->post('/api/match/result', compact("match_id", "result", "detail", "round"));
        $expectedResult = [
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "state" => null],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBC"], "state" => null],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["WBO"], "state" => null],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["IBF"], "state" => null],
        ];

        foreach ($expectedResult as $result) {
            $this->assertDatabaseHas('boxer_title_snapshots', array_merge([
                'match_id' => $this->match->id,
                "weight_division_id" => $this->division["heavy"],
            ], $result));
        }
        $response->assertStatus(200);
    }


    /**
     * @test
     */
    public function testUpdateBoxerTitleAlreadyHasState()
    {

        // $this->markTestSkipped();

        $result_1 = ["match_id" => $this->match->id, "result" => "red", "detail" => "ko", "round" => 1];

        $response = $this->post('/api/match/result', $result_1);
        $expectedResult = [
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "state" => "still"],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBC"], "state" => "still"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["WBO"], "state" => "fall"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["IBF"], "state" => "fall"],
        ];

        foreach ($expectedResult as $result) {
            $this->assertDatabaseHas('boxer_title_snapshots', array_merge([
                'match_id' => $this->match->id,
                "weight_division_id" => $this->division["heavy"],
            ], $result));
        }
        $response->assertStatus(200);

        $result_2 = ["match_id" => $this->match->id, "result" => "blue", "detail" => "ko", "round" => 1];

        $response = $this->post('/api/match/result', $result_2);
        $expectedResult = [
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBA"], "state" => "fall"],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBC"], "state" => "fall"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["WBO"], "state" => "still"],
            ['boxer_id' => $this->blueBoxer->id, "organization_id" => $this->organization["IBF"], "state" => "still"],
        ];

        foreach ($expectedResult as $result) {
            $this->assertDatabaseHas('boxer_title_snapshots', array_merge([
                'match_id' => $this->match->id,
                "weight_division_id" => $this->division["heavy"],
            ], $result));
        }
        $response->assertStatus(200);
    }
}
