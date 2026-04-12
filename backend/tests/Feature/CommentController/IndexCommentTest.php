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
        $this->beforeOneHourDateTime = Carbon::now()->subHour()->format('Y-m-d H:i:s');
        $commentsArray = [
            [
                'user_id' => $this->user->id,
                'match_id' => $this->match->id,
                'comment' => "test_comment",
                'created_at' => $this->currentDateTime
            ],
            [
                'user_id' => $this->user2->id,
                'match_id' => $this->match->id,
                'comment' => "test_comment2",
                'created_at' => $this->beforeOneHourDateTime
            ],
        ];
        $this->commentsCount = count($commentsArray);
        $this->comments = Comment::insert($commentsArray);
    }
    /**
     * @test
     * 存在しない試合のコメントをリクエストされたら正しいエラーハンドリングで404を返す
     */
    public function testCommentsFetchRequestWithNotExistsBoxingMatchId(): void
    {
        $response = $this->get('/api/comment?match_id=' . 100 . '&created_at=' . $this->currentDateTime . '&page=' . 1 . '&limit=' . 10); // 存在しない試合を指定

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
            '/api/comment?match_id=' . $this->match->id . '&created_at=' . $this->currentDateTime . '&page=' . 1 . '&limit=' . 10
        );
        $response->assertStatus(200);
        $response->assertJsonFragment(['postUserName' => 'testUserName2'])
            ->assertJsonFragment(['comment' => 'test_comment2']);
        $response->assertJsonCount($this->commentsCount, 'data');
    }
}
