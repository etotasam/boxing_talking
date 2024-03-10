<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBoxersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('boxers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 50)->charset('utf8');
            $table->string('eng_name', 50)->charset('utf8');
            $table->string('country', 100);
            $table->date('birth')->default('1970-01-01');
            $table->integer('height')->default(170);
            $table->integer('reach')->default(170);
            $table->string('style', 20)->charset('utf8');
            $table->integer('ko');
            $table->integer('win');
            $table->integer('draw');
            $table->integer('lose');
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
        Schema::dropIfExists('boxers');
    }
}
