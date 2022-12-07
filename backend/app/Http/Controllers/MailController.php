<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Mail;

class MailController extends Controller
{
    /**
     * mail send
     *
     * @return \Illuminate\Http\Response
     */
    public function send()
    {
        $data = ["test" => "これはテストです"];

        // \Log::debug($data);

        Mail::send('email.test', $data, function($message) {
            $message->to("cye_ma_kun245@yahoo.co.jp", "Test")
            ->from("from@test.com", "Boxing Talking")
            ->subject('Boxint Taking Email確認');
        });
    }
}
