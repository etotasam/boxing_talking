<?php

namespace Tests\Feature\MatchController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Helpers\TestHelper;
use App\Models\BoxingMatch;
use App\Models\Boxer;

class IndexMatchTest extends TestCase
{

    use RefreshDatabase;


    protected function setUp(): void
    {
        parent::setUp();

        $boxerNames = ["boxer1", "boxer2", "boxer3", "boxer4"];
        $boxers = [];
        foreach ($boxerNames as $name) {
            $boxer = Boxer::factory()->create(['name' => $name]);
            array_push($boxers, $boxer);
        }


        $matchesBoxers = [
            // ?まだ先の試合
            ['red_boxer_id' => $boxers[0], 'blue_boxer_id' => $boxers[1], "match_date" => date('Y-m-d', strtotime('2 week'))],
            ['red_boxer_id' => $boxers[0], 'blue_boxer_id' => $boxers[1], "match_date" => date('Y-m-d', strtotime('1 week'))],
            //? 以下は過去の試合(2週間以上前)
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-8 day'))],
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-2 week'))],
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-2 week'))],
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-3 week'))],
        ];
        $matches = [];
        foreach ($matchesBoxers as $matchBoxers) {
            $match = BoxingMatch::factory()->create(
                [
                    'red_boxer_id' => $matchBoxers['red_boxer_id'],
                    'blue_boxer_id' => $matchBoxers['blue_boxer_id'],
                    'match_date' => $matchBoxers['match_date'],
                ]
            );
            array_push($matches, $match);
        }
    }

    /**
     * @test
     * setupでセットした数のボクサーがちゃんとDBに入ってるかテスト
     */
    public function testSetUp()
    {
        $count = BoxingMatch::count();
        $this->assertSame(6, $count);
    }

    /**
     * @test
     * 指定がない場合は過去の試合を取得しない(2週間前までの試合は取得)
     */
    public function testFetchMatchesDefault()
    {
        $response = $this->get('/api/match');
        $response->assertSuccessful()
            ->assertJsonFragment(["name" => 'boxer1'])
            ->assertJsonFragment(["name" => 'boxer3']);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(5, $data['data']);
    }

    /**
     * @test
     * 過去の試合を取得(現在から2週間よりも前の試合)
     */
    public function testFetchPastMatches()
    {
        $response = $this->get('/api/match?range=past');
        $response->assertSuccessful()
            ->assertJsonFragment(["name" => 'boxer3'])
            ->assertJsonMissing(["name" => 'boxer1']);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(1, $data['data']);
    }

    /**
     * @test
     * すべての試合の取得(admin認証なしのユーザー)
     */
    public function testFetchAllMatchesWithoutAdminAuth()
    {
        $this->actingAs(TestHelper::createUser()); // 通常のuser
        $response = $this->get('/api/match?range=all');
        $response->assertStatus(401);
    }

    /**
     * @test
     * すべての試合の取得(admin認証あり)
     */
    public function testFetchAllMatchesWithAdminAuth()
    {
        $this->actingAs(TestHelper::createAdminUser());
        $response = $this->get('/api/match?range=all');
        $response->assertStatus(200)
            ->assertJsonFragment(["name" => 'boxer1'])
            ->assertJsonFragment(["name" => 'boxer3']);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(6, $data['data']);
    }
}
