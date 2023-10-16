<?php

namespace Tests\BoxerController;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;

class IndexBoxerTest extends TestCase
{

  use RefreshDatabase;

  protected $boxerCount;
  protected $limit;
  protected function setUp(): void
  {
    parent::setUp();
    $this->boxerCount = 20;
    $this->boxers = Boxer::factory()->count($this->boxerCount)->create();
  }

  /**
   * ボクサーデータの一覧を取得(limitの設定なし)
   */
  public function testBoxerFetchDefault()
  {
    $response = $this->get('/api/boxer');
    $response->assertStatus(200);
    $data = json_decode($response->getContent(), true);
    $this->assertCount(15, $data['data']['boxers']); // 15はlimitの設定がない時のデフォルト値
    $this->assertEquals($this->boxerCount, $data['data']['count']);
  }
  /**
   * ボクサーデータの一覧を取得(limitの設定あり)
   * @test
   */
  public function testBoxerFetchWithLimit()
  {
    $limit = 10;
    $response = $this->get('/api/boxer?limit=' . $limit);
    $response->assertStatus(200);
    $data = json_decode($response->getContent(), true);
    $this->assertCount($limit, $data['data']['boxers']);
    $this->assertEquals($this->boxerCount, $data['data']['count']);
  }

  /**
   * ボクサーデータの一覧を取得(pageの指定がある場合)
   */
  public function testBoxerFetchWithAssignPageNum()
  {
    $limit = 17;
    $page = 2;
    $response = $this->get('/api/boxer?limit=' . $limit . '&page=' . $page);
    $response->assertStatus(200);
    $data = json_decode($response->getContent(), true);
    $this->assertCount(3, $data['data']['boxers']); // boxerデータは20件でlimit=17の2page目なので3
    $this->assertEquals($this->boxerCount, $data['data']['count']);
  }
}
