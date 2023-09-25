<?php

namespace AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\PreUser;
use Illuminate\Support\Facades\Hash;

class PreUserCreateTest extends TestCase
{
    use RefreshDatabase;
    /**
     * @test
     */
    public function preUserCreate()
    {
        //?成功(メールの送信は非同期なので別でテスト)
        // Mail::fake();

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
        // Mail::assertSent(Mailable::class, function ($mail) use ($preUser) {
        //   return $mail->hasTo($preUser['email']);
        // });
        $response->assertSuccessful();
    }
}
