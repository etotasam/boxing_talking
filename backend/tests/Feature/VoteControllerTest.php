<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

// models
use App\Models\BoxingMatch;
use App\Models\Fighter;
use App\Models\User;
use App\Models\Vote;

class VoteControllerTest extends TestCase
{

    protected function setUp():void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            "name" => 'auth_user_name',
            // "email" => 'test@test.com',
            // "password" => Hash::make("test")
        ]);

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

        $this->vote = Vote::create([
            'user_id' => $this->user->id,
            'match_id' => $this->matches->id,
            'vote_for' => "red"
        ]);
    }

    use RefreshDatabase;
    /**
     * @test
     */
    public function fetch_ログインユーザーの選手への投票を取得()
    {
        $response = $this->get(route('vote.fetch', ['user_id' => $this->user->id]));
        $response->assertStatus(200)
            ->assertJsonFragment(['user_id' => $this->user->id])
            ->assertJsonFragment(['match_id' => $this->matches->id])
            ->assertJsonFragment(['vote_for' => "red"]);
    }
}
