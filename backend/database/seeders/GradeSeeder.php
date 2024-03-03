<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Title;

class GradeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('grades')->insert([
            ['grade' => "タイトルマッチ"],
            ['grade' => "12R"],
            ['grade' => "10R"],
            ['grade' => "8R"],
            ['grade' => "6R"],
            ['grade' => "4R"],
        ]);
    }
}
