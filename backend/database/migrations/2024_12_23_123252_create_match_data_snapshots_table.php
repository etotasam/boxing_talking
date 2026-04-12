<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMatchDataSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('match_data_snapshots', function (Blueprint $table) {
            $table->foreignId('match_id')->constrained('boxing_matches')->onDelete('cascade');
            $table->foreignId('red_boxer_id')->constrained('boxers')->onDelete('cascade');
            $table->foreignId('blue_boxer_id')->constrained('boxers')->onDelete('cascade');
            $table->string('red_boxer_style', 20)->charset('utf8');
            $table->integer('red_boxer_win');
            $table->integer('red_boxer_ko');
            $table->integer('red_boxer_draw');
            $table->integer('red_boxer_lose');
            $table->string('blue_boxer_style', 20)->charset('utf8');
            $table->integer('blue_boxer_win');
            $table->integer('blue_boxer_ko');
            $table->integer('blue_boxer_draw');
            $table->integer('blue_boxer_lose');
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
        Schema::dropIfExists('match_data_snapshots');
    }
}
