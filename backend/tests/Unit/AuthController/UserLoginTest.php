<?php

namespace Tests\AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserLoginTest extends TestCase
{

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            "name" => 'auth user name',
            "email" => 'test@test.com',
            "password" => Hash::make("test")
        ]);

        $this->rightEmail = 'test@test.com';
        $this->rightPassword = 'test';
        $this->notRightEmail = 'test123@test.com';
        $this->notRightPassword = 'test123';
    }
    /**
     * @test
     *  emailが空の場合
     */
    public function testEmptyEmailInput()
    {
        $response = $this->post('/api/login', ['email' => '', 'password' => $this->rightPassword]);
        $response->assertStatus(422);
    }
    /**
     * @test
     *  emailが存在しない
     */
    public function testEmailNotExistsOnDB()
    {
        $response = $this->post('/api/login', ['email' => $this->notRightEmail, 'password' => $this->rightPassword]);
        $response->assertStatus(401);
    }
    /**
     * @test
     *  パスワードの間違い
     */
    public function testPasswordMistake()
    {
        $response = $this->post('/api/login', ['email' => $this->rightEmail, 'password' => $this->notRightPassword]);
        $response->assertStatus(401);
    }
    /**
     * @test
     * 成功
     */
    public function testLoginSuccess()
    {

        $response = $this->post('/api/login', ['email' => $this->rightEmail, 'password' => $this->rightPassword]);
        $response->assertStatus(200);
    }
}
