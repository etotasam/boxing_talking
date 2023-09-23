<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Fighter;

class MatchControllerTest extends TestCase
{

    use RefreshDatabase;
    use WithFaker;

    private $matches;
    private $fighter_1;
    private $fighter_2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fighter_1 = Fighter::factory()->create([
            "name" => "fighter 1",
        ]);
        $this->fighter_2 = Fighter::factory()->create([
            "name" => "fighter 2",
        ]);

        $this->matches = BoxingMatch::factory()->create([
            'red_fighter_id' => $this->fighter_1->id,
            'blue_fighter_id' => $this->fighter_2->id
        ]);
    }

    /**
     * @test
     */
    // public function fetch_全試合情報の取得()
    // {
    //     $this->markTestSkipped();

    //     $response = $this->get(route('match.fetch'));

    //     $response->assertStatus(200)
    //         ->assertJsonFragment(["name" => "fighter 1", 'id' => 1])
    //         ->assertJsonFragment(["name" => "fighter 2", 'id' => 2]);
    // }

    // /**
    //  * @test
    //  */
    // public function register_試合登録()
    // {
    //     $this->markTestSkipped();

    //     $fighter_3 = Fighter::factory()->create();
    //     $fighter_4 = Fighter::factory()->create();

    //     $new_match = [
    //         'red_fighter_id' => $fighter_3->id,
    //         'blue_fighter_id' => $fighter_4->id,
    //         'match_date' => $this->faker->dateTimeBetween('now', '1week')->format('Y-m-d'),
    //         'count_red' => 10,
    //         'count_blue' => 20,
    //     ];
    //     $response = $this->post(route('match.register', $new_match));
    //     $response->assertStatus(200);
    //     $this->assertDatabaseHas('boxing_matches', ['red_fighter_id' => $fighter_3->id]);
    //     $this->assertDatabaseHas('boxing_matches', ['blue_fighter_id' => $fighter_4->id]);
    // }

    // /**
    //  * @test
    //  */
    // public function delete_試合情報の削除()
    // {
    //     $this->markTestSkipped();

    //     // DBに対象データが存在する
    //     $this->assertDatabaseHas('boxing_matches', ['red_fighter_id' => $this->fighter_1->id]);
    //     $this->assertDatabaseHas('boxing_matches', ['blue_fighter_id' => $this->fighter_2->id]);

    //     // 対象データが削除される
    //     $response = $this->delete(route('match.delete', ['matchId' => $this->matches->id]));
    //     $response->assertStatus(200);
    //     $this->assertDatabaseMissing('boxing_matches', ['red_fighter_id' => $this->fighter_1->id]);
    //     $this->assertDatabaseMissing('boxing_matches', ['blue_fighter_id' => $this->fighter_2->id]);
    // }
}
