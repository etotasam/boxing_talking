<?php

namespace Tests\Feature\AuthController;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\GuestUser;


class GuestAuthTest extends TestCase
{

    use RefreshDatabase;


    protected function setUp(): void
    {
        parent::setUp();

        $this->guestUser = GuestUser::create();

        $this->user = User::factory()->create();
    }


    /**
     * guestでログインしていない場合はfalseを返す
     */
    public function testNoGuestAuthCheck()
    {
        $response = $this->get('/api/guest/user');
        //認証がなくてもステータスは成功を返す
        $response->assertSuccessful();
        $guest = $response->getContent();
        $this->assertEquals($guest, false);
    }
    /**
     * guestでログインしていない場合はtrueを返す
     */
    public function testHasGuestAuthCheck()
    {
        $response = $this->actingAs($this->guestUser, 'guest')
            ->get('/api/guest/user');
        $response->assertSuccessful();
        $guest = $response->getContent();
        $this->assertEquals($guest, true);
    }


    /**
     * ゲストログイン成功
     */
    public function testSuccessGuestLogin()
    {
        $newGuest = $this->attributes = [];
        //?成功
        $response = $this->post('/api/guest/login');
        GuestUser::create($newGuest);
        $this->assertDatabaseHas('guest_users', $newGuest);
        $response->assertSuccessful();
    }
}
