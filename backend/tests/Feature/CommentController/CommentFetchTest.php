<?php

namespace CommentController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\User;
use App\Models\GuestUser;

class CommentFetchTest extends TestCase
{

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            "name" => 'auth_user_name',
        ]);

        $this->guest = GuestUser::create([]);

        $this->boxers = Boxer::factory()->count(2)->create();

        $this->matches = BoxingMatch::factory()->create([
            'red_boxer_id' => $this->boxers[0]->id,
            'blue_boxer_id' => $this->boxers[1]->id
        ],);

        $this->comments = Comment::create([
            'user_id' => $this->user->id,
            'match_id' => $this->matches->id,
            'comment' => "コメント"
        ]);
    }
    /**
     * @test
     * 存在しない試合のコメントをリクエストされたら404を返す
     */
    public function commentsFetchRequestWithNotExistsBoxingMatchId(): void
    {
        $response = $this->get('/api/comment?match_id=' . 100);
        $response->assertStatus(404);
    }
    /**
     * @test
     * 通常
     */
    public function successCommentsFetch(): void
    {
        $response = $this->get('/api/comment?match_id=' . $this->matches->id);
        $response->assertStatus(200);
        $response->assertJsonFragment(['post_user_name' => 'auth_user_name']);
        $response->assertJsonFragment(['comment' => 'コメント']);
    }
}
