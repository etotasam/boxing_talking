<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateBoxerTitleSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // 複合主キーを追加
            $table->primary(['match_id', 'boxer_id', 'organization_id', 'weight_division_id'], 'title_snapshot_primary_key');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // 複合主キーを削除
            $table->dropPrimary(['match_id', 'boxer_id', 'organization_id', 'weight_division_id']);
        });
    }
}
