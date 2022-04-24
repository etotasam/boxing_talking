<?php

namespace Tests\Unit;

// use PHPUnit\Framework\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class UsersTest extends TestCase
{

    use RefreshDatabase;
    /**
     * @test
     */
    public function test_example(): void
    {
        $user = User::factory()->create([
            "name" => "terashima"
        ]);
        $result = $user->name;
        $this->assertEquals("terashima", $result);
    }
}
