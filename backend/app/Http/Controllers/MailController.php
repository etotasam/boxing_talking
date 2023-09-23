<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Mail;
use Firebase\JWT\JWT;

class MailController extends Controller
{
    /**
     * mail send
     *
     * @return \Illuminate\Http\Response
     */
    public function send(Request $request)
    {
        // $user_id = $request->id;


        $payload = [
            'user_id' => "test-user-id",
            'exp' => strtotime('+1 day'),
        ];

        $secretKey = bin2hex(random_bytes(32));

        $token = JWT::encode($payload, $secretKey, 'HS256');
        $data = ["token" => $token];



        Mail::send('email.test', $data, function ($message) {
            $message->to("test@gmail.com", "Test")
                ->from("from@test.com", "Boxing Talking")
                ->subject('Boxing Taking Email確認');
        });
    }
}
