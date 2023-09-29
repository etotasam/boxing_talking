<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyTitlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('titles', function (Blueprint $table) {
            $table->foreign('boxer_id')->references('id')->on('boxers');
            $table->foreign('organization_id')->references('id')->on('organizations');
            $table->foreign('weight_division_id')->references('id')->on('weight_divisions');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('titles', function (Blueprint $table) {
            $table->dropForeign(['boxer_id']);
            $table->dropForeign(['organization_id']);
            $table->dropForeign(['weight_division_id']);
        });
    }
}
