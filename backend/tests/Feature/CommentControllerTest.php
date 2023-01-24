<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Fighter;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CommentControllerTest extends TestCase
{

    use RefreshDatabase;

    private $user;
    private $comments;
    private $matches;
    private $fighter_1;
    private $fighter_2;
    private $fighter_3;

    protected function setUp():void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            "name" => 'auth_user_name',
            // "email" => 'test@test.com',
            // "password" => Hash::make("test")
        ]);

        $this->fighter_1 = Fighter::factory()->create([
            "name" => "fighter_name_1",
        ]);
        $this->fighter_2 = Fighter::factory()->create([
            "name" => "fighter_name_2",
        ]);
        $this->fighter_3 = Fighter::factory()->create([
            "name" => "fighter_name_3",
        ]);

        $this->matches = BoxingMatch::factory()->create([
            'red_fighter_id' => $this->fighter_1->id,
            'blue_fighter_id' => $this->fighter_2->id
        ],);

        $this->comments = Comment::create([
            'user_id' => $this->user->id,
            'match_id' => $this->matches->id,
            'comment' => "user_1_of_comment_on_match_of_1"
        ]);
    }

    /**
     * @test
     */
    public function fetch_コメントの取得():void
    {
        $response = $this->get(route('comment.fetch', ['match_id' => $this->matches->id]));
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'auth_user_name']);
        $response->assertJsonFragment(['comment' => 'user_1_of_comment_on_match_of_1']);
    }

    /**
     * @test
     */
    public function post_コメントの投稿():void
    {
        $response = $this->post(route('comment.post', ['user_id' => $this->user->id ,'match_id' => $this->matches->id, 'comment' => 'new comment']));
        $response->assertStatus(200);
        $this->assertDatabaseHas('comments',['user_id' => $this->user->id]);
        $this->assertDatabaseHas('comments',['comment' => 'new comment']);
    }

    /**
     * @test
     */
    public function delete_コメントの削除():void
    {
        //? 削除対象コメントが存在している
        $this->assertDatabaseHas('comments',['comment' => 'user_1_of_comment_on_match_of_1']);

        //? 削除対象コメントの削除実行
        $this->actingAs($this->user);
        $response = $this->delete(route('comment.delete', ['user_id' => $this->user->id ,'comment_id' => $this->comments->id]));
        $response->assertStatus(200);
        $this->assertDatabaseMissing('comments',['comment' => 'user_1_of_comment_on_match_of_1']);
    }
}
