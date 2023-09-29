<?php

namespace CommentController;


use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\GuestUser;
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;

class CommentPostTest extends TestCase
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
     * 認証なしでのコメント投稿
     */
    public function postWithNoAuth(): void
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
    }

    /**
     * @test
     * ログインユーザーによるコメント投稿
     */
    public function postByLoginUser(): void
    {
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
    }
    /**
     * @test
     * ゲストによるコメント投稿
     */
    public function postByGuestUser(): void
    {
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
