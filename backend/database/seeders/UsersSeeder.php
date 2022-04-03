<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::factory()->count(10)->create();
        // DB::table('users')->insert([
        //     [
        //         'name' => "てらかど",
        //         'email' => "terakado@test.com",
        //         'password' => \Hash::make('test'),
        //     ],
        //     [
        //         'name' => "テラシマ",
        //         'email' => "terashima@test.com",
        //         'password' => \Hash::make('test'),
        //     ]
        // ]);
    }
}
