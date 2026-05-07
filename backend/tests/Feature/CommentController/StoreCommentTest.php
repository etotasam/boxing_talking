<?php

namespace Tests\Feature\CommentController;


use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\GuestUser;
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Repositories\CommentRepository;

class StoreCommentTest extends TestCase
{
    use RefreshDatabase;

    // protected CommentRepositoryInterface $mockCommentRepository;
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
        // $this->mockCommentRepository = \Mockery::mock(CommentRepositoryInterface::class);
    }

    /**
     * @test
     * 認証なしでのコメント投稿
     */
    public function testPostWithNoAuth(): void
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
     * コメント投稿の失敗
     */
    public function testFailedPostComment()
    {
        /**
         * @var CommentRepository|\Mockery\MockInterface $mockCommentRepository
         */
        $mockCommentRepository = \Mockery::mock(CommentRepository::class);
        $mockCommentRepository->shouldReceive('postComment')->andReturn(false);
        //モックをbind
        $this->app->instance(CommentRepository::class, $mockCommentRepository);

        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'match_id' => $this->matches->id,
                    'comment' => 'コメント投稿'
                ]
            );
        $response->assertStatus(500);
        $this->assertDatabaseMissing('comments', ['match_id' => $this->matches->id, 'comment' => 'コメント投稿']);
    }

    /**
     * @test
     * ログインユーザーによるコメント投稿
     */
    public function testPostByLoginUser(): void
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
        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', ['user_id' => $this->user->id, 'match_id' => $this->matches->id, 'comment' => 'コメント投稿']);
    }

    /**
     * @test
     * ログインユーザーが1000文字ちょうどのコメントを投稿できる
     */
    public function testPostByLoginUserWithMaxLengthComment(): void
    {
        $comment = str_repeat('a', 1000);

        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'match_id' => $this->matches->id,
                    'comment' => $comment
                ]
            );

        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', ['user_id' => $this->user->id, 'match_id' => $this->matches->id, 'comment' => $comment]);
    }

    /**
     * @test
     * ログインユーザーが空コメントを投稿した場合はバリデーションエラー
     */
    public function testPostByLoginUserWithEmptyComment(): void
    {
        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'match_id' => $this->matches->id,
                    'comment' => ''
                ]
            );

        $response->assertStatus(422);
        $this->assertDatabaseMissing('comments', ['user_id' => $this->user->id, 'match_id' => $this->matches->id, 'comment' => '']);
    }

    /**
     * @test
     * ログインユーザーが1001文字のコメントを投稿した場合はバリデーションエラー
     */
    public function testPostByLoginUserWithTooLongComment(): void
    {
        $comment = str_repeat('a', 1001);

        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'match_id' => $this->matches->id,
                    'comment' => $comment
                ]
            );

        $response->assertStatus(422);
        $this->assertDatabaseMissing('comments', ['user_id' => $this->user->id, 'match_id' => $this->matches->id, 'comment' => $comment]);
    }

    /**
     * @test
     * ログインユーザーがmatch_idなしで投稿した場合はバリデーションエラー
     */
    public function testPostByLoginUserWithoutMatchId(): void
    {
        $response = $this->actingAs($this->user)
            ->post(
                '/api/comment',
                [
                    'user_id' => $this->user->id,
                    'comment' => 'コメント投稿'
                ]
            );

        $response->assertStatus(422);
        $this->assertDatabaseMissing('comments', ['user_id' => $this->user->id, 'comment' => 'コメント投稿']);
    }
    /**
     * @test
     * ゲストによるコメント投稿
     */
    public function testPostByGuestUser(): void
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
        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', ['user_id' => $this->guest->id, 'match_id' => $this->matches->id, 'comment' => 'ゲストの投稿']);
    }
}
