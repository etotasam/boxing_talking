<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BoxerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // User::factory()->count(10)->create();
        DB::table('boxers')->insert([
            [
                'name' => "ボクサー1",
                'eng_name' => "boxer1",
                'country' => "Japan",
                'birth' => "1981-06-18",
                'height' => "179",
                'reach' => "181",
                'style' => "southpaw",
                'ko' => 1,
                'win' => 1,
                'lose' => 0,
                'draw' => 1,
            ],
            [
                'name' => "ボクサー2",
                'eng_name' => "boxer2",
                'country' => "USA",
                'birth' => "1981-01-01",
                'height' => "179",
                'reach' => "179",
                'style' => "southpaw",
                'ko' => 1,
                'win' => 1,
                'lose' => 0,
                'draw' => 1,
            ]
        ]);
    }
}
