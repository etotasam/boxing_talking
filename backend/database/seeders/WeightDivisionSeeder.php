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
            ['weight' => "ライトヘビー"],
            ['weight' => "スーパーミドル"],
            ['weight' => "ミドル"],
            ['weight' => "スーパーウェルター"],
            ['weight' => "ウェルター"],
            ['weight' => "スーパーライト"],
            ['weight' => "ライト"],
            ['weight' => "スーパーフェザー"],
            ['weight' => "フェザー"],
            ['weight' => "スーパーバンタム"],
            ['weight' => "バンタム"],
            ['weight' => "スーパーフライ"],
            ['weight' => "フライ"],
            ['weight' => "ライトフライ"],
            ['weight' => "ミニマム"],
        ]);
    }
}
