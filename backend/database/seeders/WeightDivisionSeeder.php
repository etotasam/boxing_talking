<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WeightDivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('weight_divisions')->insert([
            ['weight' => "ヘビー"],
            ['weight' => "クルーザー"],
            ['weight' => "Lヘビー"],
            ['weight' => "Sミドル"],
            ['weight' => "ミドル"],
            ['weight' => "Sウェルター"],
            ['weight' => "ウェルター"],
            ['weight' => "Sライト"],
            ['weight' => "ライト"],
            ['weight' => "Sフェザー"],
            ['weight' => "フェザー"],
            ['weight' => "Sバンタム"],
            ['weight' => "バンタム"],
            ['weight' => "Sフライ"],
            ['weight' => "フライ"],
            ['weight' => "Lフライ"],
            ['weight' => "ミニマム"],
        ]);
    }
}
