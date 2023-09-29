<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyTitleMatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('title_matches', function (Blueprint $table) {
            $table->foreign('match_id')->references('id')->on('boxing_matches');
            $table->foreign('organization_id')->references('id')->on('organizations');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('title_matches', function (Blueprint $table) {
            $table->dropForeign(['match_id']);
            $table->dropForeign(['organization_id']);
        });
    }
}
