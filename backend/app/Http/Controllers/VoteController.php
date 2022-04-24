<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// controllers
use App\Models\User;

class VoteController extends Controller
{
    /**
     * fetch vote by auth user
     *
     * @param int user_id
     * @return \Illuminate\Http\Response
     */
    public function fetch($user_id)
    {
        $votes =User::find($user_id)->votes;
        return $votes;
    }
}
