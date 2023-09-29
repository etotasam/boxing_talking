<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Title;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('organizations')->insert([
            ['name' => "WBA"],
            ['name' => "WBC"],
            ['name' => "WBO"],
            ['name' => "IBF"],
            ['name' => "WBA暫定"],
            ['name' => "WBC暫定"],
            ['name' => "WBO暫定"],
        ]);
    }
}
