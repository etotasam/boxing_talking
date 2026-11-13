<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\DbDataToCsvController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DbDataToCsvControllerTest extends TestCase
{
    use RefreshDatabase;

    /** CSVの区切り・引用符・バックスラッシュ・改行・空値を従来形式のまま保存する。 */
    public function testExportPreservesExistingCsvFormat(): void
    {
        DB::table('users')->insert([
            ['id' => '00000000-0000-4000-8000-000000000001', 'name' => "日本語,引用\"と\\\"slash\n次行", 'email' => 'csv@example.test', 'password' => 'placeholder', 'created_at' => null, 'updated_at' => null],
            ['id' => '00000000-0000-4000-8000-000000000002', 'name' => '', 'email' => 'empty@example.test', 'password' => 'placeholder', 'created_at' => '2026-01-02 03:04:05', 'updated_at' => '2026-01-02 03:04:05'],
        ]);
        // 実データのCSV保存先と分け、公開outputメソッドによるファイルを確認する。
        $this->app->useStoragePath(storage_path('framework/testing/csv-export'));
        $response = (new DbDataToCsvController)->output();

        $this->assertSame(['message' => 'Success save DB data to csv'], $response->getData(true));
        // PHP8.3の更新前outputで取得したバイト列を固定する。
        $expected = <<<'CSV'
id,name,email,password,created_at,updated_at
00000000-0000-4000-8000-000000000001,"日本語,引用""と\"slash
次行",csv@example.test,placeholder,,
00000000-0000-4000-8000-000000000002,,empty@example.test,placeholder,"2026-01-02 03:04:05","2026-01-02 03:04:05"
CSV;
        $this->assertSame($expected . "\n", file_get_contents(storage_path('csv/' . date('Ymd') . '/users.csv')));
    }
}
