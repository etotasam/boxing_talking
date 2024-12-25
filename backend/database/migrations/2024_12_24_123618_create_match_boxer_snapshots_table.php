<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMatchBoxerSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('match_boxer_snapshots', function (Blueprint $table) {
            $table->foreignId('match_id')->constrained('boxing_matches')->onDelete('cascade');
            $table->foreignId('boxer_id')->constrained('boxers')->onDelete('cascade');
            $table->string('style', 20)->charset('utf8');
            $table->integer('win');
            $table->integer('ko');
            $table->integer('draw');
            $table->integer('lose');

            // 複合キー
            $table->primary(['match_id', 'boxer_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('match_boxer_snapshots', function (Blueprint $table) {

            $table->dropPrimary(['match_id', 'boxer_id']);
        });
    }
}
