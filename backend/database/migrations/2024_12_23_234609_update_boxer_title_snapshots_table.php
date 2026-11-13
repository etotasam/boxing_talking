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
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('boxer_title_snapshots', function (Blueprint $table) {
                // SQLiteでは主キー列を直接削除できないため、再構築で自動採番と主キーを先に解除する。
                $table->unsignedBigInteger('id')->autoIncrement(false)->change();
                $table->dropPrimary();
            });
        }

        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // id主キーを削除してから複合主キーへ切り替える
            $table->dropColumn('id');
        });

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
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('boxer_title_snapshots', function (Blueprint $table) {
                $table->dropPrimary();
                $table->unsignedBigInteger('id')->nullable();
            });

            Schema::table('boxer_title_snapshots', function (Blueprint $table) {
                // 再構築でid主キーを採番する。削除前のid値は復元しない。
                $table->id()->change();
            });

            return;
        }

        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // 主キー切替中だけmatch_idの外部キー制約を外す
            $table->dropForeign(['match_id']);
        });

        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // 複合主キーを削除
            $table->dropPrimary(['match_id', 'boxer_id', 'organization_id', 'weight_division_id']);
        });

        Schema::table('boxer_title_snapshots', function (Blueprint $table) {
            // 元のid主キーを復元する（削除前のid値は復元しない）
            $table->id();
            // 外部キー制約と必要な索引を元の定義で復元する
            $table->foreign('match_id')->references('id')->on('boxing_matches')->onDelete('cascade');
        });
    }
}
