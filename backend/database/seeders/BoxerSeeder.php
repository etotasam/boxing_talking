<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boxer;
use App\Models\Title;
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
        Boxer::factory()
            ->count(10)
            ->create();
    }
}
