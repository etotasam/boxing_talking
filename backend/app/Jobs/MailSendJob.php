<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\Mailer;
use Firebase\JWT\JWT;
use Exception;
use App\Models\PreUser;


class MailSendJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    protected $userID;
    protected $name;
    protected $email;
    /**
     * Create a new job instance.
     *
     * @param  int  $userId
     * @param  string  $name
     * @param  string  $email
     * @return void
     */
    public function __construct($userID, $name, $email)
    {
        $this->userID = $userID;
        $this->name = $name;
        $this->email = $email;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {

        try {
            $payload = [
                'user_id' => $this->userID,
                'exp' => strtotime('+30 minutes'),
            ];
            $secretKey = config('const.jwt_secret_key');
            $token = JWT::encode($payload, $secretKey, 'HS256');
            Mail::to($this->email)->send(new Mailer($this->name,  $token));
        } catch (Exception $e) {
            $preUser = PreUser::find($this->userID);
            if ($preUser) {
                $preUser->delete();
            }
            \Log::error("Error in MailSendJob: " . $e->getMessage());
            $this->fail($e);
        }
    }
}
