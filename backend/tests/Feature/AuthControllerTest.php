<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
// use PHPUnit\Framework\TestCase;
use Tests\TestCase;
use App\Models\User;

use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase {

  use RefreshDatabase;

  private $user;

  protected function setUp():void
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
   */
  public function user_ユーザの認証チェック()
  {
    // 認証なし
    $response = $this->get(route('auth.user'));
    $response->assertStatus(500);


    // 認証あり
    $this->actingAs($this->user);
    $response = $this->get(route('auth.user'));

    $response->assertStatus(200)
      ->assertJsonFragment(["name" => 'auth user name']);
  }

  /**
   * @test
   */
  public function check_ユーザの認証チェックの有無()
  {

    // 認証なし
    $response = $this->get(route('auth.check'));
    $response->assertStatus(500);

    // 認証あり
    $this->actingAs($this->user);
    $response = $this->get(route('auth.check'));
    $response->assertStatus(200);
  }

  /**
   * @test
   */
  public function login_ログイン機能()
  {
    $response = $this->post(route('auth.login', ['email' => 'test@test.com', 'password' => 'testa']));
    $response->assertStatus(401);

    $response = $this->post(route('auth.login', ['email' => 'test@test.com', 'password' => 'test']));
    $response->assertStatus(200);
  }

  /**
   * @test
   */
  public function logout_ログアウト機能()
  {
    $this->actingAs($this->user);
    $response = $this->post(route('auth.logout', ['user_id' => $this->user->id]));
    $response->assertStatus(200);
  }

}