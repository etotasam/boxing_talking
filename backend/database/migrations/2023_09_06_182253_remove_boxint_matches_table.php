<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveBoxintMatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('boxing_matches');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('boxing_matches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('red_boxer_id');
            $table->foreign('red_boxer_id')->references('id')->on('boxers');
            $table->unsignedBigInteger('blue_boxer_id');
            $table->foreign('blue_boxer_id')->references('id')->on('boxers');
            $table->date('match_date');
            $table->string('country');
            $table->string('venue');
            $table->string('grade');
            $table->text('titles')->nullable();
            $table->string('weight');
            $table->integer("count_red")->default(0);
            $table->integer("count_blue")->default(0);
            $table->timestamps();
        });
    }
}
