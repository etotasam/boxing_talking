<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveMatchResultColumnFromBoxingMatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boxing_matches', function (Blueprint $table) {
            $table->dropColumn("match_result");
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
            $table->enum('match_result', ['red', 'blue', 'draw', 'no-contest'])->nullable()->after('count_blue');
        });
    }
}
