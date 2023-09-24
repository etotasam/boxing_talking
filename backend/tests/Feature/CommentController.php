<?php

// namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\User;
use App\Models\GuestUser;

class CommentControllerTest extends TestCase
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
     */
    public function commentsFetch(): void
    {
        //?存在しない試合IDを指定された場合
        $response = $this->get('/api/comment?match_id=' . 100);
        $response->assertStatus(404);

        //?成功
        $response = $this->get('/api/comment?match_id=' . $this->matches->id);
        $response->assertStatus(200);
        $response->assertJsonFragment(['post_user_name' => 'auth_user_name']);
        $response->assertJsonFragment(['comment' => 'コメント']);
    }

    /**
     * @test
     */
    public function commentPost(): void
    {
        //?認証なしでの投稿
        $response = $this
            ->post(
                '/api/comment',
                [
                    'user_id' => null,
                    'match_id' => $this->matches->id,
                    'comment' => '認証なし投稿'
                ]
            );
        $response->assertStatus(401);
        $this->assertDatabaseMissing('comments', ['match_id' => $this->matches->id, 'comment' => '認証なし投稿']);

        //?ログインユーザーによるコメント投稿
        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'match_id' => $this->matches->id,
                    'comment' => 'コメント投稿'
                ]
            );
        $response->assertSuccessful(200);
        $this->assertDatabaseHas('comments', ['user_id' => $this->user->id, 'match_id' => $this->matches->id, 'comment' => 'コメント投稿']);

        //?ゲストユーザーによるコメント投稿
        $response = $this->actingAs($this->guest, 'guest')
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->guest->id,
                    'match_id' => $this->matches->id,
                    'comment' => 'ゲストの投稿'
                ]
            );
        $response->assertSuccessful(200);
        $this->assertDatabaseHas('comments', ['user_id' => $this->guest->id, 'match_id' => $this->matches->id, 'comment' => 'ゲストの投稿']);
    }
}
