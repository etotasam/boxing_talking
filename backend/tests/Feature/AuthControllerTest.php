<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
// use PHPUnit\Framework\TestCase;
use Tests\TestCase;
use App\Models\User;
use App\Models\GuestUser;
use App\Models\PreUser;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;


use function PHPUnit\Framework\isNull;

class AuthControllerTest extends TestCase
{

  use RefreshDatabase;

  private $user;

  protected function setUp(): void
  {
    parent::setUp();

    $this->user = User::factory()->create([
      "name" => 'auth user name',
      "email" => 'test@test.com',
      "password" => Hash::make("test")
    ]);

    $this->guestUser = GuestUser::create();
  }

  /**
   * @test
   */
  public function userAuthCheck()
  {
    // 認証なし
    // $response = $this->get(route('auth.user'));
    $response = $this->get('/api/user');
    $response->assertSuccessful();
    $content = $response->getContent();
    $this->assertEquals($content, null);


    // 認証あり
    $this->actingAs($this->user);
    $response = $this->get('/api/user');

    $response->assertSuccessful()
      ->assertJsonFragment(["name" => 'auth user name']);
  }


  /**
   * @test
   */
  public function loginFunctionTest()
  {
    $rightEmail = 'test@test.com';
    $rightPassword = 'test';
    $notRightEmail = 'test123@test.com';
    $notRightPassword = 'test123';
    //? 失敗
    $response = $this->post('/api/login', ['email' => '', 'password' => $rightPassword]);
    $response->assertStatus(422);

    $response = $this->post('/api/login', ['email' => $rightEmail, 'password' => $notRightPassword]);
    $response->assertStatus(401);

    $response = $this->post('/api/login', ['email' => $notRightEmail, 'password' => $rightPassword]);
    $response->assertStatus(401);


    //?成功
    $response = $this->post('/api/login', ['email' => $rightEmail, 'password' => $rightPassword]);
    $response->assertStatus(200);
  }

  /**
   * @test
   */
  public function logoutFunctionTest()
  {
    //? 失敗
    //ログインしてない状態でログアウトapiを投げると
    $response = $this->post('/api/logout');
    //middlewareの認証で引っかかる
    $response->assertStatus(401);

    //?成功
    $response = $this->actingAs($this->user)->post('/api/logout');
    $response->assertSuccessful();
    $isLogout = $response->getContent();
    $this->assertEquals($isLogout, true);
  }


  /**
   * @test
   */
  public function guestAuthCheck()
  {
    //?認証なし
    $response = $this->get('/api/guest/user');
    //?認証がなくてもステータスは成功
    $response->assertSuccessful();
    $guest = $response->getContent();
    $this->assertEquals($guest, false);

    //?認証あり
    $response = $this->actingAs($this->guestUser, 'guest')
      ->get('/api/guest/user');
    $response->assertSuccessful();
    $guest = $response->getContent();
    $this->assertEquals($guest, true);
  }



  /**
   * @test
   */
  public function guestLoginTest()
  {
    $newGuest = $this->attributes = [];
    //?成功
    $response = $this->post('/api/guest/login');
    GuestUser::create($newGuest);
    $this->assertDatabaseHas('guest_users', $newGuest);
    $response->assertSuccessful();

    //?失敗
    $response = $this->actingAs($this->user)->post('/api/guest/login');
    $response->assertStatus(400);
  }

  /**
   * @test
   */
  public function guestLogoutTest()
  {
    //?成功
    //まずguestとしてdbに保存されているかをチェック
    $this->assertDatabaseHas('guest_users', ['id' => $this->guestUser->id]);
    $response = $this->actingAs($this->guestUser, 'guest')->post('/api/guest/logout');
    $response->assertSuccessful();
    $this->assertDatabaseMissing('guest_users', ['id' => $this->guestUser->id]);


    //?失敗
    $response = $this->actingAs($this->user)->post('/api/guest/login');
    $response->assertStatus(400);
  }


  /**
   * @test
   */
  public function preUserCreateTest()
  {
    Mail::fake();

    $name = "testUser";
    $email = "testEmail@test.com";
    $password = "testPassword1";
    //リクエスト送信
    $response = $this->post('/api/user/pre_create', compact("name", "email", "password"));
    $preUser = PreUser::where('email', $email)->first();
    $hashedPasswordInDatabase =  $preUser->password;
    //データベースに登録されているか
    $this->assertDatabaseHas('pre_users', ["name" => $name, "email" => $email]);
    // passwordはハッシュ化されて登録されているか
    $this->assertTrue(Hash::check($password, $hashedPasswordInDatabase));
    //メールが送信されていて、宛先は正しいか
    Mail::assertSent(Mailable::class, function ($mail) use ($preUser) {
      return $mail->hasTo($preUser['email']);
    });
    $response->assertSuccessful();
  }

  /**
   * @test
   */
  public function userCreateTest()
  {
    $preUser = PreUser::create([
      "name" => "pre_user",
      "email" => "pre_email@test.com",
      "password" => "pre_Password1"
    ]);
    $secret_key = config('const.jwt_secret_key');

    $validPayload = [
      'user_id' => $preUser->id,
      'exp' => strtotime('+30 minutes'),
    ];
    $invalidPayload = [
      'user_id' => $preUser->id,
      'exp' => strtotime('-1 minutes'),
    ];
    //?jwtトークンの有効期限切れ
    $invalidToken = JWT::encode($invalidPayload, $secret_key, 'HS256');
    $response = $this->post('/api/user/create', ["token" => $invalidToken]);
    $response->assertStatus(500);
    $this->assertDatabaseMissing('users', ["email" => $preUser['email']]);
    $this->assertDatabaseHas('pre_users', ["email" => $preUser['email']]);
    //?secretKeyが違う場合
    $invalidToken = JWT::encode($validPayload, "invalid secret key", 'HS256');
    $response = $this->post('/api/user/create', ["token" => $invalidToken]);
    $response->assertStatus(500);
    $this->assertDatabaseMissing('users', ["email" => $preUser['email']]);
    $this->assertDatabaseHas('pre_users', ["email" => $preUser['email']]);

    //?成功
    $validToken = JWT::encode($validPayload, $secret_key, 'HS256');
    $response = $this->post('/api/user/create', ["token" => $validToken]);
    $response->assertSuccessful();
    $this->assertDatabaseHas('users', ["email" => $preUser['email']]);
    $this->assertDatabaseMissing('pre_users', ["email" => $preUser['email']]);
  }
}
