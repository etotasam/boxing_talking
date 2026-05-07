<?php

namespace Tests\Feature\CommentController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\BoxingMatch;
use App\Models\Boxer;
use App\Models\Comment;
use App\Models\User;
use App\Models\GuestUser;
use Carbon\Carbon;

class IndexCommentTest extends TestCase
{

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(["name" => 'testUserName']);
        $this->user2 = User::factory()->create(["name" => 'testUserName2']);
        $this->user3 = User::factory()->create(["name" => 'testUserName3']);

        $this->guest = GuestUser::create([]);

        $this->boxers = Boxer::factory()->count(2)->create();

        $this->match = BoxingMatch::factory()->create([
            'red_boxer_id' => $this->boxers[0]->id,
            'blue_boxer_id' => $this->boxers[1]->id
        ],);



        $this->currentDateTime = Carbon::now()->format('Y-m-d H:i:s');
        $commentsArray = collect(range(1, 12))->map(function ($number) {
            return [
                'user_id' => $number % 2 === 0 ? $this->user2->id : $this->user->id,
                'match_id' => $this->match->id,
                'comment' => "test_comment{$number}",
                'created_at' => Carbon::now()->subMinutes($number)->format('Y-m-d H:i:s')
            ];
        })->all();
        $this->commentsCount = count($commentsArray);
        $this->comments = Comment::insert($commentsArray);
    }
    /**
     * @test
     * 存在しない試合のコメントをリクエストされたら正しいエラーハンドリングで404を返す
     */
    public function testCommentsFetchRequestWithNotExistsBoxingMatchId(): void
    {
        $response = $this->get('/api/comment?match_id=' . 100); // 存在しない試合を指定

        $response->assertStatus(404);

        // 適切なエラーハンドリングをしているか
        $responseData = $response->json();
        $this->assertEquals('Match not found', $responseData['message']);
    }
    /**
     * @test
     * 通常
     */
    public function testSuccessCommentsFetch(): void
    {
        $response = $this->get(
            '/api/comment?match_id=' . $this->match->id
        );
        $response->assertStatus(200);
        $response->assertJsonFragment(['postUserName' => 'testUserName'])
            ->assertJsonFragment(['comment' => 'test_comment1'])
            ->assertJsonPath('meta.hasMore', true);
        $response->assertJsonCount(10, 'data');
    }

    /**
     * @test
     * cursor指定時は次のコメントを取得する
     */
    public function testSuccessCommentsFetchWithCursor(): void
    {
        $firstResponse = $this->get('/api/comment?match_id=' . $this->match->id);
        $cursor = $firstResponse->json('meta.nextCursor');

        $response = $this->get('/api/comment?match_id=' . $this->match->id . '&cursor=' . $cursor);

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['comment' => 'test_comment11'])
            ->assertJsonFragment(['comment' => 'test_comment12'])
            ->assertJsonPath('meta.hasMore', false)
            ->assertJsonPath('meta.nextCursor', null);
    }

    /**
     * @test
     * limitを指定されてもバックエンド固定件数を超えて取得しない
     */
    public function testCommentsFetchIgnoresLimitParameter(): void
    {
        $response = $this->get('/api/comment?match_id=' . $this->match->id . '&limit=100');

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
    }
}
