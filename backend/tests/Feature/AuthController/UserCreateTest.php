<?php

namespace Tests\Feature\AuthController;

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
     * トークンの期限切れ
     */
    public function testExpiredToken()
    {
        $this->assertDatabaseHas('pre_users', $this->preUser->toArray());

        //?jwtトークンの有効期限切れ
        $invalidToken = JWT::encode($this->invalidPayload, $this->secretKey, 'HS256');
        $response = $this->post('/api/user/create', ["token" => $invalidToken]);
        $response->assertStatus(401);
        $this->assertDatabaseMissing('users', ["id" => $this->preUser["id"], "email" => $this->preUser['email']]);
    }
    /**
     * secretKeyが違う場合
     */
    public function testUnmatchedSecretKey()
    {
        $invalidToken = JWT::encode($this->validPayload, "p2-intentionally-wrong-hs256-key-with-valid-length", 'HS256');
        $response = $this->post('/api/user/create', ["token" => $invalidToken]);
        $response->assertStatus(400);
        $this->assertDatabaseMissing('users', ["id" => $this->preUser["id"], "email" => $this->preUser['email']]);
    }
    /** 署名後にpayloadを書き換えたリンクは拒否し、仮登録を保持する。 */
    public function testTamperedToken()
    {
        $token = JWT::encode($this->validPayload, $this->secretKey, 'HS256');
        $segments = explode('.', $token);
        $tamperedPayload = $this->validPayload;
        $tamperedPayload['user_id'] = '00000000-0000-4000-8000-000000000099';
        $segments[1] = JWT::urlsafeB64Encode(json_encode($tamperedPayload));

        $this->post('/api/user/create', ['token' => implode('.', $segments)])->assertStatus(400);

        $this->assertDatabaseHas('pre_users', ['id' => $this->preUser->id]);
        $this->assertDatabaseMissing('users', ['email' => $this->preUser->email]);
    }

    /** JWT形式ではないリンクは拒否し、仮登録を保持する。 */
    public function testMalformedToken()
    {
        $this->post('/api/user/create', ['token' => 'not-a-jwt-token'])->assertStatus(400);

        $this->assertDatabaseHas('pre_users', ['id' => $this->preUser->id]);
        $this->assertDatabaseMissing('users', ['email' => $this->preUser->email]);
    }

    /**
     * 成功
     */
    public function testSuccessUserCreate()
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
