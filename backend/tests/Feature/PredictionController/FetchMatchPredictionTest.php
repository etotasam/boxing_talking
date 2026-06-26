<?php

namespace Tests\Feature\PredictionController;

use App\Models\Boxer;
use App\Models\BoxingMatch;
use App\Models\GuestUser;
use App\Models\User;
use App\Models\WinLossPrediction;
use Carbon\Carbon;
use Database\Seeders\GradeSeeder;
use Database\Seeders\WeightDivisionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FetchMatchPredictionTest extends TestCase
{
    use RefreshDatabase;

    private BoxingMatch $futureMatch;
    private BoxingMatch $todayMatch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            GradeSeeder::class,
            WeightDivisionSeeder::class
        ]);

        $boxers = Boxer::factory()->count(2)->create();
        $matchData = [
            'red_boxer_id' => $boxers[0]->id,
            'blue_boxer_id' => $boxers[1]->id,
        ];

        $this->futureMatch = BoxingMatch::factory()->create([
            ...$matchData,
            'match_date' => Carbon::tomorrow()->format('Y-m-d'),
        ]);
        $this->todayMatch = BoxingMatch::factory()->create([
            ...$matchData,
            'match_date' => Carbon::today()->format('Y-m-d'),
        ]);
    }

    /**
     * 未認証かつ未投票の場合は試合前の集計結果を開示しない
     */
    public function testFutureMatchPredictionsAreHiddenFromAnonymousUser(): void
    {
        $this->storeVotes($this->futureMatch->id);

        $response = $this->get('/api/match/prediction?match_id=' . $this->futureMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', false)
            ->assertJsonPath('data.totalVotes', null)
            ->assertJsonPath('data.red', null)
            ->assertJsonPath('data.blue', null);
    }

    /**
     * 通常ユーザーが未投票の場合は試合前の集計結果を開示しない
     */
    public function testFutureMatchPredictionsAreHiddenFromUnvotedUser(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->storeVotes($this->futureMatch->id);

        $response = $this->actingAs($user)
            ->get('/api/match/prediction?match_id=' . $this->futureMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', false)
            ->assertJsonPath('data.totalVotes', null);
    }

    /**
     * ゲストユーザーが未投票の場合は試合前の集計結果を開示しない
     */
    public function testFutureMatchPredictionsAreHiddenFromUnvotedGuest(): void
    {
        $guest = GuestUser::create([]);
        $this->storeVotes($this->futureMatch->id);

        $response = $this->actingAs($guest, 'guest')
            ->get('/api/match/prediction?match_id=' . $this->futureMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', false)
            ->assertJsonPath('data.totalVotes', null);
    }

    /**
     * 通常ユーザーが投票済みの場合は試合前でも集計結果を開示する
     */
    public function testFutureMatchPredictionsAreVisibleToVotedUser(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->storeVotes($this->futureMatch->id, $user->id);

        $response = $this->actingAs($user)
            ->get('/api/match/prediction?match_id=' . $this->futureMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', true)
            ->assertJsonPath('data.totalVotes', 3)
            ->assertJsonPath('data.red', 2)
            ->assertJsonPath('data.blue', 1);
    }

    /**
     * ゲストユーザーが投票済みの場合は試合前でも集計結果を開示する
     */
    public function testFutureMatchPredictionsAreVisibleToVotedGuest(): void
    {
        $guest = GuestUser::create([]);
        $this->storeVotes($this->futureMatch->id, $guest->id);

        $response = $this->actingAs($guest, 'guest')
            ->get('/api/match/prediction?match_id=' . $this->futureMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', true)
            ->assertJsonPath('data.totalVotes', 3);
    }

    /**
     * 試合当日以降は未投票でも集計結果を開示する
     */
    public function testTodayMatchPredictionsAreVisibleToAnonymousUser(): void
    {
        $this->storeVotes($this->todayMatch->id);

        $response = $this->get('/api/match/prediction?match_id=' . $this->todayMatch->id);

        $response->assertSuccessful()
            ->assertJsonPath('data.isVisible', true)
            ->assertJsonPath('data.totalVotes', 3)
            ->assertJsonPath('data.red', 2)
            ->assertJsonPath('data.blue', 1);
    }

    /**
     * 存在しない試合IDの場合は404を返す
     */
    public function testNotFoundIsReturnedForMissingMatch(): void
    {
        $response = $this->get('/api/match/prediction?match_id=999999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'Match is not exists');
    }

    private function storeVotes(int $matchId, ?string $viewerId = null): void
    {
        $redVoter = $viewerId ?? User::factory()->create()->id;
        $otherRedVoter = User::factory()->create()->id;
        $blueVoter = User::factory()->create()->id;

        WinLossPrediction::create([
            'user_id' => $redVoter,
            'match_id' => $matchId,
            'prediction' => 'red',
        ]);
        WinLossPrediction::create([
            'user_id' => $otherRedVoter,
            'match_id' => $matchId,
            'prediction' => 'red',
        ]);
        WinLossPrediction::create([
            'user_id' => $blueVoter,
            'match_id' => $matchId,
            'prediction' => 'blue',
        ]);
    }
}
