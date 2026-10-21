<?php

namespace Tests\Feature\Database;

use App\Models\Boxer;
use App\Models\BoxingMatch;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BoxerTitleSnapshotMigrationTest extends TestCase
{
    use RefreshDatabase;

    /** 新規構築後も、NULLの状態と4列の複合主キーによる重複拒否を保証する。 */
    public function testFreshSchemaKeepsNullableStateAndRejectsDuplicateSnapshots(): void
    {
        $snapshot = $this->createSnapshot();

        $this->assertFalse(Schema::hasColumn('boxer_title_snapshots', 'id'));
        $this->assertCompositePrimaryKey();
        $this->assertDatabaseHas('boxer_title_snapshots', $snapshot);
        $this->assertNull(DB::table('boxer_title_snapshots')->value('state'));

        $this->expectException(QueryException::class);
        DB::table('boxer_title_snapshots')->insert($snapshot);
    }

    /** データ入りで主キーを2回戻して再適用しても、行・NULL・制約を保持する。 */
    public function testPrimaryKeyRoundTripsKeepExistingSnapshotData(): void
    {
        $snapshot = $this->createSnapshot();
        require_once database_path('migrations/2024_12_23_234609_update_boxer_title_snapshots_table.php');
        $migration = new \UpdateBoxerTitleSnapshotsTable();

        for ($cycle = 0; $cycle < 2; $cycle++) {
            $migration->down();
            $this->assertTrue(Schema::hasColumn('boxer_title_snapshots', 'id'));
            $this->assertGreaterThan(0, DB::table('boxer_title_snapshots')->value('id'));
            $this->assertDatabaseHas('boxer_title_snapshots', $snapshot);

            $migration->up();
            $this->assertFalse(Schema::hasColumn('boxer_title_snapshots', 'id'));
            $this->assertCompositePrimaryKey();
            $this->assertCount(4, Schema::getForeignKeys('boxer_title_snapshots'));
            $this->assertSame($snapshot, (array) DB::table('boxer_title_snapshots')->first());
        }
    }

    /** 4つの参照先を削除した場合、それぞれ対応するスナップショットが連動削除される。 */
    public function testAllFourForeignKeysKeepCascadeDeletes(): void
    {
        $this->assertCount(4, Schema::getForeignKeys('boxer_title_snapshots'));

        foreach ([
            'match_id' => 'boxing_matches',
            'boxer_id' => 'boxers',
            'organization_id' => 'organizations',
            'weight_division_id' => 'weight_divisions',
        ] as $column => $table) {
            $snapshot = $this->createSnapshot();
            DB::table($table)->where('id', $snapshot[$column])->delete();
            $this->assertDatabaseMissing('boxer_title_snapshots', $snapshot);
        }
    }

    /** 既存仕様どおり4列が複合主キーになっていることを確認する。 */
    private function assertCompositePrimaryKey(): void
    {
        $primary = collect(Schema::getIndexes('boxer_title_snapshots'))->firstWhere('primary', true);
        $this->assertNotNull($primary);
        $this->assertSame(['match_id', 'boxer_id', 'organization_id', 'weight_division_id'], $primary['columns']);
    }

    /** 外部キー制約を満たす合成データを用意する。 */
    private function createSnapshot(): array
    {
        [$red, $blue, $snapshotBoxer] = Boxer::factory()->count(3)->create();
        $match = BoxingMatch::factory()->create([
            'red_boxer_id' => $red->id,
            'blue_boxer_id' => $blue->id,
            'grade_id' => null,
            'weight_id' => null,
        ]);
        $snapshot = [
            'match_id' => $match->id,
            'boxer_id' => $snapshotBoxer->id,
            'organization_id' => DB::table('organizations')->insertGetId(['name' => 'Migration Probe']),
            'weight_division_id' => DB::table('weight_divisions')->insertGetId(['weight' => 'Migration Probe']),
            'state' => null,
        ];
        DB::table('boxer_title_snapshots')->insert($snapshot);

        return $snapshot;
    }
}
