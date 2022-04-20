<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBirthHeightStanceToFightersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('fighters', function (Blueprint $table) {
            $table->date('birth')->after('country')->default('1970-01-01');
            $table->integer('height')->after('birth')->default(170);
            $table->string('stance', 20)->charset('utf8')->after('height')->default("southpaw");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('fighters', function (Blueprint $table) {
            $table->dropColumn("birth");
            $table->dropColumn("height");
            $table->dropColumn("stance");
        });
    }
}
