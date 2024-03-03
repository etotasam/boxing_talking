<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropGradeAndWeightColumnOnBaxingMatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boxing_matches', function (Blueprint $table) {
            $table->dropColumn("grade");
            $table->dropColumn("weight");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('boxing_matches', function (Blueprint $table) {
            $table->string("grade");
            $table->string("weight");
        });
    }
}
