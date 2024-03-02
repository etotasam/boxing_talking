<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBoxingMatchesTableWeightIdAndGradeIdColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boxing_matches', function (Blueprint $table) {
            $table->unsignedBigInteger('weight_id')->nullable()->after('weight');
            $table->unsignedBigInteger('grade_id')->nullable()->after('grade');
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
            $table->dropColumn('weight_id');
            $table->dropColumn('grade_id');
        });
    }
}
