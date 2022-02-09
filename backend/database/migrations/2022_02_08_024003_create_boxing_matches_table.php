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
            $table->unsignedBigInteger('red_fighter_id');
            $table->foreign('red_fighter_id')->references('id')->on('fighters');
            $table->unsignedBigInteger('blue_fighter_id');
            $table->foreign('blue_fighter_id')->references('id')->on('fighters');
            $table->date('match_date');
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
