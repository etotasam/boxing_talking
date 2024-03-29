<?php

namespace Tests\Feature\AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserLogoutTest extends TestCase
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
    }


    /**
     * @test
     * ログイン状態にない時にログアウトのリクエストは無効にする
     */
    public function testFailLogoutWhenNotBeLogin()
    {
        $response = $this->post('/api/logout');
        //middlewareの認証で引っかかる
        $response->assertStatus(401);
    }

    /**
     * @test
     * ログアウト成功
     */
    public function testLogoutSuccess()
    {
        $response = $this->actingAs($this->user)->post('/api/logout');
        $response->assertSuccessful();
        $isLogout = $response->getContent();
        $this->assertEquals($isLogout, true);
    }
}
