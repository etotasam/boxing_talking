<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
// use PHPUnit\Framework\TestCase;
use Tests\TestCase;
use App\Models\Fighter;

class FighterControllerTest extends TestCase
{
    use RefreshDatabase;

    private $fighter;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fighter = Fighter::factory()->create([
            "name" => "tyson fury"
        ]);
    }

    /**
     * @test
     */
    // public function register_ファイター登録()
    // {
    //     $new_fighter_data = [
    //         "name" => "new fighter name",
    //         "country" => "Japan",
    //         "birth" => "1981-6-18",
    //         "stance" => "オーソドックス",
    //         "height" => 180,
    //         "win" => 0,
    //         "ko" => 0,
    //         "draw" => 0,
    //         "lose" => 0,
    //     ];
    //     $response = $this->post(route('fighter.register', $new_fighter_data));

    //     $response->assertOk();
    //     $this->assertDatabaseHas('fighters', ['name' => "new fighter name"]);
    // }

    // /**
    //  * @test
    //  */
    // public function fetch_ファイターの取得()
    // {


    //     $response = $this->get(route('fighter.fetch', ['limit' => 10, 'page' => 1]));

    //     $response->assertOk()
    //         ->assertJsonCount(1)
    //         ->assertJsonFragment(["name" => "tyson fury"]);
    // }

    // /**
    //  * @test
    //  */
    // public function delete_ファイターの削除()
    // {

    //     $response = $this->delete(route('fighter.delete', ['fighterId' => $this->fighter->id]));

    //     $response->assertOk();
    //     $this->assertEquals(0, Fighter::count());
    // }

    // /**
    //  * @test
    //  */
    // public function update_ファイター情報の更新()
    // {

    //     $id = $this->fighter->id;
    //     $update_fighter_data = ['id' => $id, 'name' => 'update name'];
    //     $response = $this->put(route('fighter.update', $update_fighter_data));

    //     $response->assertOk();
    //     $this->assertEquals('update name', Fighter::find($id)->name);
    // }
}
