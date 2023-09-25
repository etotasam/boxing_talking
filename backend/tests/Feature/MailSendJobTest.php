<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use App\Jobs\MailSendJob;
use App\Models\PreUser;
use App\Mail\Mailer;
use Illuminate\Queue\SyncQueue;

class MailSendJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Mail::fake();

        $this->preUser = PreUser::create([
            "name" => "testName",
            "email" => "testEmail@test.com",
            "password" => "PassWord1"
        ]);
    }
    /**
     * @test
     */
    public function mailSend()
    {
        $preUser = $this->preUser;

        MailSendJob::dispatch($preUser->id, $preUser->name, $preUser->email)->onQueue("mailQueue");

        Queue::assertPushed(MailSendJob::class, function ($job) use ($preUser) {
            return $job->userID === $preUser->id && $job->name === $preUser->name && $job->email === $preUser->email;
        });
        Queue::assertPushedOn("mailQueue", MailSendJob::class);
        Mail::assertSent(Mailer::class, function ($mail) use ($preUser) {
            return $mail->to == $preUser->email;
        });
    }
}
