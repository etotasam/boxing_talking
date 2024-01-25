<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMatchResultsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('match_results', function (Blueprint $table) {
            $table->unsignedBigInteger('match_id')->primary();
            $table->foreign('match_id')->references('id')->on('boxing_matches')->onDelete('cascade');
            $table->enum('match_result', ['red', 'blue', 'draw', 'no-contest']);
            $table->enum('detail', ['ko', 'tko', 'ud', 'md', 'sd'])->nullable();
            $table->integer('round')->unsigned()->nullable();

            // $table->check('round >= 1 and round <= 12');
        });

        // DB::statement('ALTER TABLE match_result ADD CHECK (round >= 1 and round <= 12)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('match_result');
    }
}
