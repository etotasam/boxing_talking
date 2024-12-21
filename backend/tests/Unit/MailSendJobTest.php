<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use App\Jobs\MailSendJob;
use App\Models\PreUser;
use App\Mail\Mailer;


class MailSendJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Mail::fake();
    }
    /**
     * @test
     */
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
}
