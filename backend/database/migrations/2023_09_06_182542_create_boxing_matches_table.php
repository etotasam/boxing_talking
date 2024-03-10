<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBoxingMatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('boxing_matches', function (Blueprint $table) {
            $table->id();
            $table->date('match_date');
            $table->string('country');
            $table->unsignedBigInteger('red_boxer_id');
            $table->foreign('red_boxer_id')->references('id')->on('boxers');
            $table->unsignedBigInteger('blue_boxer_id');
            $table->foreign('blue_boxer_id')->references('id')->on('boxers');
            $table->string('venue');
            $table->string('grade');
            $table->string('weight');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('boxing_matches');
    }
}
