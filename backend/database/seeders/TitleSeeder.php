<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TitleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        DB::table('titles')->insert([
            [
                "boxer_id" => 1,
                "organization_id" => 1,
                "weight_division_id" => 1
            ],
        ]);
    }
}
