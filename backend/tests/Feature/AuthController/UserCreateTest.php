<?php

namespace AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Firebase\JWT\JWT;
use App\Models\PreUser;

class UserCreateTest extends TestCase
{

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->preUser = PreUser::create([
            "name" => "set_up_pre_user",
            "email" => "set_up_pre_email@test.com",
            "password" => "set_up_pre_Password1"
        ]);

        $this->validPayload = [
            'user_id' => $this->preUser->id,
            'exp' => strtotime('+30 minutes'),
        ];

        $this->invalidPayload = [
            'user_id' => $this->preUser->id,
            'exp' => strtotime('-1 minutes'),
        ];
        $this->secretKey = config('const.jwt_secret_key');
    }

    /**
     * @test
     * トークンの期限切れ
     */
    public function expiredToken()
    {
        $this->assertDatabaseHas('pre_users', $this->preUser->toArray());

        //?jwtトークンの有効期限切れ
        $invalidToken = JWT::encode($this->invalidPayload, $this->secretKey, 'HS256');
        $response = $this->post('/api/user/create', ["token" => $invalidToken]);
        $response->assertStatus(500);
        $this->assertDatabaseMissing('users', ["id" => $this->preUser["id"], "email" => $this->preUser['email']]);
    }
    /**
     * @test
     * secretKeyが違う場合
     */
    public function unmatchedSecretKey()
    {
        $invalidToken = JWT::encode($this->validPayload, "invalid secret key", 'HS256');
        $response = $this->post('/api/user/create', ["token" => $invalidToken]);
        $response->assertStatus(500);
        $this->assertDatabaseMissing('users', ["id" => $this->preUser["id"], "email" => $this->preUser['email']]);
    }
    /**
     * @test
     * 成功
     */
    public function successUserCreate()
    {
        $validToken = JWT::encode($this->validPayload, $this->secretKey, 'HS256');
        $response = $this->post('/api/user/create', ["token" => $validToken]);
        $response->assertSuccessful();
        $this->assertDatabaseHas('users', ["email" => $this->preUser['email']])
            //違うpreUserの時とは違う新たなidになっている
            ->assertDatabaseMissing('users', ["id" => $this->preUser["id"]])
            //preUserの方のデータは削除する
            ->assertDatabaseMissing('pre_users', ["id" => $this->preUser["id"], "email" => $this->preUser['email']]);
    }
}
