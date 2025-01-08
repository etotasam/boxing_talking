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
            "middle" => 5,
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
        //? 試合時のボクサー保持タイトル(BoxerTitleSnapshot)
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
     * 勝者がタイトルを防衛した時はstateがstillになり、敗者のタイトルのstateはfallになる
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

    /**
     * @test
     * 勝敗でタイトルを獲得、奪取された場合にtitlesテーブルから対象を追加、削除する
     */
    public function testAdjustTitleWithResult()
    {
        $match_id = $this->match->id;
        $result = "red";
        $detail = "ko";
        $round = 1;

        //? 試合でredが勝った時に取得するタイトル
        $expectedTitle = [
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["WBO"], "weight_division_id" => $this->division["heavy"]],
            ['boxer_id' => $this->redBoxer->id, "organization_id" => $this->organization["IBF"], "weight_division_id" => $this->division["heavy"]],
        ];

        //? リクエスト送信 redの勝利
        $response = $this->post('/api/match/result', compact("match_id", "result", "detail", "round"));

        //? titlesテーブルに取得したタイトルが登録されているか
        foreach ($expectedTitle as $result) {
            $this->assertDatabaseHas('titles', [
                'boxer_id' => $result['boxer_id'],
                'organization_id' => $result['organization_id'],
                "weight_division_id" => $result['weight_division_id'],
            ]);
        }
        $response->assertStatus(200);
    }

    /**
     * @test
     * タイトルマッチ時に勝利ボクサーがタイトルを保持していない場合でも正常にタイトルがstoreされる
     */
    public function testNotHasTitle()
    {
        //? 試合作成
        $this->matchOnMiddle = BoxingMatch::factory()->create([
            'red_boxer_id' => $this->redBoxer->id,
            'blue_boxer_id' => $this->blueBoxer->id,
            'weight_id' => $this->division['middle'],
        ],);
        //? 試合のタイトルを登録
        $titleMatches = [
            ["match_id" => $this->matchOnMiddle->id, "organization_id" => $this->organization['WBA']],
            ["match_id" => $this->matchOnMiddle->id, "organization_id" => $this->organization['WBC']]
        ];
        TitleMatch::insert($titleMatches);

        // $this->assertDatabaseHas('title_matches', ['match_id' => $this->matchOnMiddle->id, 'organization_id' => $this->organization['WBA']]);
        $match_id = $this->matchOnMiddle->id;
        $result = "red";
        $detail = "ko";
        $round = 1;
        //? リクエスト送信 redの勝利
        $response = $this->post('/api/match/result', compact("match_id", "result", "detail", "round"));

        //? 試合に掛けられた全てのタイトルが勝者に付与されているか
        foreach ($titleMatches as $titles) {
            $this->assertDatabaseHas('titles', [
                'boxer_id' => $this->redBoxer->id,
                'organization_id' => $titles['organization_id'],
                'weight_division_id' => $this->division['middle']
            ]);
        }
    }
}
