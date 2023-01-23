<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProvisionalUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('provisional_users', function (Blueprint $table) {
            $table->uuid('uuid', 36)->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('token', 60);
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
        Schema::dropIfExists('provisional_users');
    }
}
