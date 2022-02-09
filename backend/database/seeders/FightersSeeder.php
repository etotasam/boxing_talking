<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FightersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        DB::table('fighters')->insert([
            'name' => "Crawford",
            'country' => "USA",
            'win' => 38,
            'draw' => 0,
            'lose' => 0,
            'ko' => 29,
        ]);
        DB::table('fighters')->insert([
            'name' => "Saul Alvarez",
            'country' => "Mexico",
            'win' => 57,
            'draw' => 2,
            'lose' => 1,
            'ko' => 39,
        ]);
        DB::table('fighters')->insert([
            'name' => "Naoya Inoue",
            'country' => "Japan",
            'win' => 22,
            'draw' => 0,
            'lose' => 0,
            'ko' => 19,
        ]);
    }
}
