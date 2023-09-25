<?php

// namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Boxer;

class MatchControllerTest extends TestCase
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
            //? 以下は過去の試合(1週間以上前)
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-8 day'))],
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-2 week'))],
            ['red_boxer_id' => $boxers[2], 'blue_boxer_id' => $boxers[3], "match_date" => date('Y-m-d', strtotime('-2 week'))],
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
     */
    public function matchesFetch()
    {
        //?指定がない場合は過去の試合を取得しない(一週間前までの試合は取得)
        $response = $this->get('/api/match');
        $response->assertSuccessful()
            ->assertJsonFragment(["name" => 'boxer1'])
            ->assertJsonMissing(["name" => 'boxer3']);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(2, $data);

        //?過去の試合を取得(現在から一週間よりも前の試合)
        $response = $this->get('/api/match?range=past');
        $response->assertSuccessful()
            ->assertJsonFragment(["name" => 'boxer3'])
            ->assertJsonMissing(["name" => 'boxer1']);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(3, $data);
    }
}
