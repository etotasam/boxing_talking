<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTitlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('titles', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('match_id')->nullable();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('weight_division_id');

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('match_id')->references('id')->on('boxing_matches');
            $table->foreign('organization_id')->references('id')->on('organizations');
            $table->foreign('weight_division_id')->references('id')->on('weight_divisions');
        });

        DB::statement('ALTER TABLE titles ADD CONSTRAINT user_match_xor CHECK ((user_id IS NULL AND match_id IS NOT NULL) OR (user_id IS NOT NULL AND match_id IS NULL));');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('titles');
    }
}
