<?php

// P5専用。通常アプリのSeeder・設定を変更せず、合成DBだけを操作する。
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

function ensure(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function identifier(string $name): string
{
    ensure((bool) preg_match('/^[a-zA-Z0-9_]+$/D', $name), 'Invalid identifier');
    return '`'.$name.'`';
}

try {
    $mode = $argv[1] ?? 'preflight';
    ensure(in_array($mode, ['preflight', 'migrate', 'seed', 'verify'], true), 'Unknown operation');
    // 起動処理より先に、元DBに向かう設定を拒否する。
    foreach (['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_HOST' => 'db80',
        'DB_DATABASE' => 'boxing_p5_baseline', 'DB_USERNAME' => 'boxing_p5_app',
        'DATABASE_URL' => '', 'DB_SOCKET' => ''] as $key => $value) {
        ensure(getenv($key) === $value, 'Refused environment: '.$key);
    }
    require '/var/www/html/vendor/autoload.php';
    $app = require '/var/www/html/bootstrap/app.php';
    $app->make(Kernel::class)->bootstrap();
    ensure(app()->environment('testing'), 'Refused application environment');
    ensure(config('database.default') === 'mysql', 'Refused connection');
    foreach (['host' => 'db80', 'database' => 'boxing_p5_baseline', 'username' => 'boxing_p5_app',
        'url' => '', 'unix_socket' => ''] as $key => $value) {
        ensure(config('database.connections.mysql.'.$key) === $value, 'Refused effective config: '.$key);
    }
    $server = DB::selectOne('SELECT @@version AS version, @@hostname AS hostname, DATABASE() AS db');
    ensure($server->version === '8.0.21' && $server->hostname === 'p5-baseline-db80'
        && $server->db === 'boxing_p5_baseline', 'Refused server identity');
    DB::statement("SET time_zone = '+00:00'");
    $expected = [
        'administrators' => 1, 'boxer_title_snapshots' => 4, 'boxers' => 4,
        'boxing_matches' => 3, 'comments' => 3, 'failed_jobs' => 0, 'grades' => 6,
        'guest_users' => 2, 'jobs' => 0, 'match_boxer_snapshots' => 4, 'match_results' => 1,
        'organizations' => 7, 'personal_access_tokens' => 0, 'pre_users' => 1,
        'title_matches' => 2, 'titles' => 2, 'users' => 3, 'weight_divisions' => 17,
        'win_loss_predictions' => 4,
    ];
    $tables = array_map(fn ($row) => array_values((array) $row)[0], DB::select('SHOW TABLES'));
    sort($tables);
    if ($mode === 'preflight') {
        echo json_encode(['environment' => 'testing', 'version' => $server->version,
            'host' => $server->hostname, 'database' => $server->db, 'tables' => count($tables)], JSON_THROW_ON_ERROR)."\n";
        exit(0);
    }
    if ($mode === 'migrate') {
        ensure($tables === [], 'Migration refused: database is not empty');
        $exit = Artisan::call('migrate', ['--no-interaction' => true]);
        echo Artisan::output();
        ensure($exit === 0, 'Migration failed');
        echo "P5 migration completed.\n";
        exit(0);
    }
    $expectedTables = array_keys($expected);
    $expectedTables[] = 'migrations';
    sort($expectedTables);
    ensure($tables === $expectedTables, 'Unexpected table inventory');
    $migrationNames = array_map(fn ($path) => basename($path, '.php'), glob('/var/www/html/database/migrations/*.php'));
    sort($migrationNames);
    $applied = DB::table('migrations')->orderBy('migration')->pluck('migration')->all();
    ensure(count($applied) === 35 && $applied === $migrationNames, 'Migration inventory mismatch');

    if ($mode === 'seed') {
        foreach ($expected as $table => $_) {
            ensure(DB::table($table)->count() === 0, 'Seed refused: nonempty table '.$table);
        }
        DB::transaction(function (): void {
            (new Database\Seeders\OrganizationSeeder())->run();
            (new Database\Seeders\WeightDivisionSeeder())->run();
            (new Database\Seeders\GradeSeeder())->run();
            $stamp = ['created_at' => '2026-11-02 00:00:00', 'updated_at' => '2026-11-02 00:00:00'];
            $users = ['00000000-0000-4000-8000-000000000001',
                '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003'];
            $guest = '00000000-0000-4000-8000-000000000004';
            // 実在の資格情報を使わず、ログにも出さない合成パスワードを設定する。
            $password = Hash::make(bin2hex(random_bytes(32)));
            foreach ($users as $index => $id) {
                DB::table('users')->insert($stamp + ['id' => $id,
                    'name' => ['P5 Admin', 'P5 Normal', '検証ユーザー🙂'][$index],
                    'email' => 'p5-user-'.($index + 1).'@example.invalid', 'password' => $password]);
            }
            DB::table('administrators')->insert($stamp + ['user_id' => $users[0]]);
            DB::table('guest_users')->insert([
                $stamp + ['id' => $guest, 'deleted_at' => null],
                $stamp + ['id' => '00000000-0000-4000-8000-000000000005', 'deleted_at' => '2026-11-02 01:00:00'],
            ]);
            DB::table('pre_users')->insert($stamp + ['id' => '00000000-0000-4000-8000-000000000006',
                'name' => 'P5 Pending', 'email' => 'p5-pending@example.invalid', 'password' => $password]);
            foreach (['赤選手A', '青選手B', '赤選手C', '青選手D'] as $index => $name) {
                DB::table('boxers')->insert($stamp + ['id' => $index + 1, 'name' => 'P5 '.$name,
                    'eng_name' => 'P5 Boxer '.($index + 1), 'country' => 'Japan',
                    'birth' => '1990-01-01', 'height' => 170 + $index, 'reach' => 175 + $index,
                    'style' => $index % 2 ? 'southpaw' : 'orthodox',
                    'win' => 10 + $index, 'ko' => 5, 'draw' => 0, 'lose' => 1]);
            }
            foreach (['2026-11-01', '2026-11-02', '2026-11-09'] as $index => $date) {
                DB::table('boxing_matches')->insert($stamp + ['id' => $index + 1, 'match_date' => $date,
                    'country' => 'Japan', 'red_boxer_id' => $index === 1 ? 3 : 1,
                    'blue_boxer_id' => $index === 1 ? 4 : 2, 'venue' => 'P5検証会場',
                    'weight_id' => 13, 'grade_id' => $index === 1 ? 3 : 1]);
            }
            DB::table('titles')->insert([
                ['boxer_id' => 1, 'organization_id' => 1, 'weight_division_id' => 13],
                ['boxer_id' => 2, 'organization_id' => 2, 'weight_division_id' => 13],
            ]);
            DB::table('title_matches')->insert([
                ['match_id' => 1, 'organization_id' => 1], ['match_id' => 3, 'organization_id' => 2],
            ]);
            DB::table('match_results')->insert(['match_id' => 1, 'match_result' => 'red', 'detail' => 'ko', 'round' => 5]);
            foreach ([[1, 1], [1, 2], [2, 3], [2, 4]] as [$match, $boxer]) {
                DB::table('match_boxer_snapshots')->insert(['match_id' => $match, 'boxer_id' => $boxer,
                    'style' => $boxer % 2 ? 'orthodox' : 'southpaw', 'win' => 10 + $boxer - 1,
                    'ko' => 5, 'draw' => 0, 'lose' => 1]);
            }
            foreach ([[1, 1, 1, 'still'], [1, 2, 2, 'fall'], [3, 1, 1, null], [3, 2, 2, 'new']] as [$match, $boxer, $org, $state]) {
                DB::table('boxer_title_snapshots')->insert(['match_id' => $match, 'boxer_id' => $boxer,
                    'organization_id' => $org, 'weight_division_id' => 13, 'state' => $state]);
            }
            foreach (['P5 合成コメント🙂', "P5 複数行\n検証コメント", str_repeat('検', 1000)] as $index => $comment) {
                DB::table('comments')->insert($stamp + ['user_id' => $users[$index], 'match_id' => 1, 'comment' => $comment]);
            }
            foreach ([[$users[1], 1, 'red'], [$users[2], 1, 'blue'], [$guest, 2, 'red'], [$users[0], 3, 'blue']] as [$id, $match, $prediction]) {
                DB::table('win_loss_predictions')->insert($stamp + ['user_id' => $id, 'match_id' => $match, 'prediction' => $prediction]);
            }
            // tokenable_idは数値、users.idはUUIDという既存定義のため、token行は作らない。
            // UUIDを数値へ変換したり、存在しないユーザーへのtokenを挿入したりしない。
        });
    }

    // データ保持を確認する読み取り処理。baselineの初期化・削除は行わない。
    foreach ($expected as $table => $count) {
        ensure(DB::table($table)->count() === $count, 'Unexpected row count: '.$table);
    }
    $foreignKeys = DB::select('SELECT TABLE_NAME AS child, COLUMN_NAME AS col,
        REFERENCED_TABLE_NAME AS parent, REFERENCED_COLUMN_NAME AS ref
        FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL');
    foreach ($foreignKeys as $fk) {
        $child = identifier($fk->child); $parent = identifier($fk->parent);
        $col = identifier($fk->col); $ref = identifier($fk->ref);
        $row = DB::selectOne("SELECT COUNT(*) AS n FROM $child c LEFT JOIN $parent p ON c.$col = p.$ref WHERE c.$col IS NOT NULL AND p.$ref IS NULL");
        ensure((int) $row->n === 0, 'Orphan foreign key: '.$fk->child);
    }
    $ids = array_merge(DB::table('users')->pluck('id')->all(), DB::table('guest_users')->pluck('id')->all());
    foreach (['comments', 'win_loss_predictions', 'administrators'] as $table) {
        ensure(DB::table($table)->whereNotIn('user_id', $ids)->count() === 0, 'Orphan user reference');
    }
    foreach (['comments', 'win_loss_predictions'] as $table) {
        ensure(DB::table($table)->whereNotIn('match_id', DB::table('boxing_matches')->select('id'))->count() === 0,
            'Orphan match reference');
    }
    ensure(DB::table('boxer_title_snapshots')->whereNull('state')->count() === 1, 'NULL state not preserved');
    ensure(DB::table('guest_users')->whereNotNull('deleted_at')->count() === 1, 'Soft deletion not preserved');
    $expires = DB::selectOne("SELECT IS_NULLABLE AS nullable FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'personal_access_tokens' AND COLUMN_NAME = 'expires_at'");
    ensure($expires !== null && $expires->nullable === 'YES', 'Nullable token expiration column missing');
    ensure(DB::table('users')->where('name', '検証ユーザー🙂')->count() === 1, 'UTF8 user not preserved');
    ensure(DB::table('comments')->whereRaw('CHAR_LENGTH(comment) = 1000')->count() === 1, 'Boundary comment not preserved');
    $snapshot = ['version' => $server->version, 'database' => $server->db,
        'migration_count' => count($applied), 'foreign_key_columns_checked' => count($foreignKeys), 'tables' => []];
    foreach ($tables as $table) {
        $rows = [];
        foreach (DB::table($table)->get() as $row) {
            $data = (array) $row; ksort($data);
            $rows[] = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        }
        sort($rows, SORT_STRING);
        $schema = array_values((array) DB::select('SHOW CREATE TABLE '.identifier($table))[0])[1];
        $snapshot['tables'][$table] = ['count' => count($rows),
            'content_sha256' => hash('sha256', json_encode($rows, JSON_THROW_ON_ERROR)),
            'schema_sha256' => hash('sha256', $schema)];
    }
    echo json_encode($snapshot, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)."\n";
} catch (Throwable $error) {
    // 接続情報やSQL値を画面に出さず、非公開の検証領域だけに詳細を保存する。
    if (is_dir('/p5-evidence')) {
        file_put_contents('/p5-evidence/last-error.txt', (string) $error);
        chmod('/p5-evidence/last-error.txt', 0600);
    }
    fwrite(STDERR, 'P5 refused or failed: '.get_class($error)."\n");
    exit(1);
}
