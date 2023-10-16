<?php

namespace Tests\Feature\AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
// use PHPUnit\Framework\TestCase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserAuthCheckTest extends TestCase
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

    $this->rightEmail = $this->user->email;
    $this->rightPassword = 'test';
    $this->notRightEmail = 'test123@test.com';
    $this->notRightPassword = 'test123';
  }

  /**
   * @test
   * 認証ありの場合
   */
  public function testHasAuthCheck()
  {
    $this->actingAs($this->user);
    $response = $this->get('/api/user');

    $response->assertSuccessful()
      ->assertJsonFragment(["name" => 'auth user name']);
  }

  /**
   * @test
   * 認証なしのテスト
   */
  public function testNoAuthCheck()
  {
    $response = $this->get('/api/user');
    $response->assertSuccessful();
    $content = $response->getContent();
    $this->assertEquals($content, null);
  }
}
