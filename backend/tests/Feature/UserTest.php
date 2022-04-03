<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private $attributes;

    /**
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp(); //setUp関数を使う場合は必ず呼び出す

        $this->attributes = [
            'name' => "てすと",
            'email' => "test@test.com",
            'password' => "test"
        ];
    }
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_データベースに登録ができる(): void
    {
        User::create($this->attributes);
        $this->assertDatabaseHas('users', $this->attributes);
    }
}
