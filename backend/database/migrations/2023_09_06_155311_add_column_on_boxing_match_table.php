<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnOnBoxingMatchTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boxing_matches', function (Blueprint $table) {
            $table->string('country');
            $table->string('venue');
            $table->string('grade');
            $table->text('titles')->nullable();
            $table->string('weight');
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
            $table->dumpColumn('country');
            $table->dumpColumn('venue');
            $table->dumpColumn('grade');
            $table->dumpColumn('titles');
            $table->dumpColumn('weight');
        });
    }
}
