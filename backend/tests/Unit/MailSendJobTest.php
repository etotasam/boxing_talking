<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use App\Jobs\MailSendJob;
use App\Models\PreUser;
use App\Mail\Mailer;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Contracts\Queue\Job;
use Illuminate\Support\Facades\Log;
use Mockery;
use RuntimeException;


class MailSendJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Mail::fake();
    }
    public function testMailQueueSetToJob()
    {
        $preUser = PreUser::create([
            "name" => "testName",
            "email" => "testEmail@test.com",
            "password" => "PassWord1"
        ]);

        $queueName = "mailQueue";

        MailSendJob::dispatch($preUser->id, $preUser->name, $preUser->email)->onQueue($queueName);

        Queue::assertPushed(MailSendJob::class, function ($job) use ($preUser) {
            return $job->userId === $preUser->id && $job->name === $preUser->name && $job->email === $preUser->email;
        });
        Queue::assertPushedOn($queueName, MailSendJob::class);
    }

    /** 登録メールに本人の名前と署名付き・30分期限の確認リンクが含まれることを保証する。 */
    public function testHandleSendsRegistrationMailAndKeepsPreUser()
    {
        config(['const.jwt_secret_key' => 's1-mail-test-key-only', 'app.url' => 'http://localhost:13000']);
        $preUser = PreUser::create([
            'name' => 'Mail Test User',
            'email' => 'mail-test@example.test',
            'password' => 'Password1',
        ]);
        $before = time();

        (new MailSendJob($preUser->id, $preUser->name, $preUser->email))->handle();

        Mail::assertSent(Mailer::class, function ($mail) use ($preUser, $before) {
            $mail->build();
            $token = $mail->viewData['token'];
            $payload = JWT::decode($token, new Key(config('const.jwt_secret_key'), 'HS256'));
            $this->assertSame((string) $preUser->id, $payload->user_id);
            $this->assertGreaterThanOrEqual($before + 1800, $payload->exp);
            $this->assertLessThanOrEqual(time() + 1800, $payload->exp);
            $this->assertSame('BOXING TALKING 【アカウント作成】', $mail->subject);
            $html = app(\Illuminate\Mail\Markdown::class)->render('emails.register', $mail->viewData)->toHtml();
            $this->assertStringContainsString($preUser->name, $html);
            $this->assertStringContainsString('http://localhost:13000/identification?signup=' . $token, $html);
            return $mail->hasTo($preUser->email);
        });
        Mail::assertSent(Mailer::class, 1);
        $this->assertDatabaseHas('pre_users', ['id' => $preUser->id]);
    }

    /** SMTP例外時は対象だけ削除し、他の仮登録を保持してキュージョブを失敗させる。 */
    public function testHandleMailFailureDeletesOnlyItsPreUserAndFailsJob()
    {
        config(['const.jwt_secret_key' => 's1-mail-test-key-only']);
        $target = PreUser::create(['name' => 'Target', 'email' => 'target@example.test', 'password' => 'Password1']);
        $other = PreUser::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'Password1']);
        $exception = new RuntimeException('SMTP test failure');
        $pendingMail = Mockery::mock();
        $pendingMail->shouldReceive('send')->once()->with(Mockery::type(Mailer::class))->andThrow($exception);
        Mail::shouldReceive('to')->once()->with($target->email)->andReturn($pendingMail);
        Log::shouldReceive('error')->once()->with('Error in MailSendJob: SMTP test failure');
        $queuedJob = Mockery::mock(Job::class);
        $queuedJob->shouldReceive('fail')->once()->with($exception);
        $job = new MailSendJob($target->id, $target->name, $target->email);
        $job->setJob($queuedJob);

        $job->handle();

        $this->assertDatabaseMissing('pre_users', ['id' => $target->id]);
        $this->assertDatabaseHas('pre_users', ['id' => $other->id]);
    }

    /** 処理前に仮登録が消えていても、送信例外は別の例外にせずジョブ失敗として扱う。 */
    public function testHandleMailFailureWhenPreUserWasAlreadyDeleted()
    {
        config(['const.jwt_secret_key' => 's1-mail-test-key-only']);
        $exception = new RuntimeException('SMTP test failure');
        $pendingMail = Mockery::mock();
        $pendingMail->shouldReceive('send')->once()->andThrow($exception);
        Mail::shouldReceive('to')->once()->with('missing@example.test')->andReturn($pendingMail);
        Log::shouldReceive('error')->once();
        $queuedJob = Mockery::mock(Job::class);
        $queuedJob->shouldReceive('fail')->once()->with($exception);
        $job = new MailSendJob('00000000-0000-4000-8000-000000000001', 'Missing', 'missing@example.test');
        $job->setJob($queuedJob);

        $job->handle();

        $this->assertDatabaseCount('pre_users', 0);
    }
}
