<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBoxerTitleSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('boxer_title_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('boxing_matches')->onDelete('cascade');
            $table->foreignId('boxer_id')->constrained('boxers')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('weight_division_id')->constrained('weight_divisions')->onDelete('cascade');
            $table->string('state')->nullable(false);  // 'new', 'still', 'fall'
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('boxer_title_snapshots');
    }
}
