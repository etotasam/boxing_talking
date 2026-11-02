<?php

// 承認された隔離DBだけから、データ内容を公開せず比較用の記録を取得する。
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

function requireP5(bool $condition, string $reason): void
{
    if (!$condition) {
        throw new RuntimeException($reason);
    }
}

try {
    $targets = [
        'db80' => ['8.0.21', 'p5-baseline-db80', 'boxing_p5_baseline'],
        'restore80' => ['8.0.21', 'p5-restore-db80', 'boxing_p5_restore80'],
        'relay80' => ['8.0.46', 'p5-relay-db80', 'boxing_p5_relay80'],
        'db84' => ['8.4.13', 'p5-migrated-db84', 'boxing_p5_migrated84'],
        'restore84' => ['8.4.13', 'p5-restore-db84', 'boxing_p5_restore84'],
    ];
    $target = $argv[1] ?? '';
    $mode = $argv[2] ?? 'snapshot';
    requireP5(isset($targets[$target]) && in_array($mode, ['snapshot', 'empty'], true), 'Unknown target/mode');
    [$version, $hostname, $database] = $targets[$target];
    foreach (['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_HOST' => $target,
        'DB_DATABASE' => $database, 'DB_USERNAME' => 'boxing_p5_app', 'DATABASE_URL' => '', 'DB_SOCKET' => ''] as $key => $value) {
        requireP5(getenv($key) === $value, 'Refused environment: '.$key);
    }
    require '/var/www/html/vendor/autoload.php';
    $app = require '/var/www/html/bootstrap/app.php';
    $app->make(Kernel::class)->bootstrap();
    requireP5(app()->environment('testing') && config('database.default') === 'mysql', 'Refused runtime');
    foreach (['host' => $target, 'database' => $database, 'username' => 'boxing_p5_app', 'url' => '', 'unix_socket' => ''] as $key => $value) {
        requireP5(config('database.connections.mysql.'.$key) === $value, 'Refused effective config: '.$key);
    }
    $identity = DB::selectOne('SELECT @@version AS version, @@hostname AS host, DATABASE() AS db');
    requireP5($identity->version === $version && $identity->host === $hostname && $identity->db === $database,
        'Refused server identity');
    DB::statement("SET time_zone = '+00:00'");
    // PDOの数値取得形式の違いでデータ差と誤判定しない。NULLはNULLのまま保持する。
    DB::connection()->getPdo()->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, true);
    $tables = array_map(fn ($row) => array_values((array) $row)[0], DB::select('SHOW TABLES'));
    sort($tables);
    if ($mode === 'empty') {
        requireP5($target !== 'db80' && $tables === [], 'Import refused: destination is not empty');
        echo json_encode(['target' => $target, 'version' => $version, 'empty' => true], JSON_THROW_ON_ERROR)."\n";
        exit(0);
    }
    requireP5(count($tables) === 20 && DB::table('migrations')->count() === 35, 'Unexpected schema inventory');
    $result = ['target' => $target, 'version' => $version, 'tables' => []];
    foreach ($tables as $table) {
        requireP5((bool) preg_match('/^[a-z0-9_]+$/D', $table), 'Invalid table name');
        $rows = [];
        foreach (DB::table($table)->get() as $row) {
            $values = (array) $row; ksort($values);
            $rows[] = json_encode($values, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        }
        sort($rows, SORT_STRING);
        $columns = DB::select('SELECT ORDINAL_POSITION, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE,
            COLUMN_DEFAULT, EXTRA, CHARACTER_SET_NAME, COLLATION_NAME, GENERATION_EXPRESSION
            FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION', [$table]);
        // utf8/utf8mb3の表記差だけを正規化し、文字集合の実際の変更とは区別する。
        foreach ($columns as $column) {
            if ($column->CHARACTER_SET_NAME === 'utf8') {
                $column->CHARACTER_SET_NAME = 'utf8mb3';
            }
            if (is_string($column->COLLATION_NAME) && str_starts_with($column->COLLATION_NAME, 'utf8_')) {
                $column->COLLATION_NAME = 'utf8mb3_'.substr($column->COLLATION_NAME, 5);
            }
        }
        $indexes = DB::select('SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME, COLLATION,
            SUB_PART, INDEX_TYPE, IS_VISIBLE, EXPRESSION FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY INDEX_NAME, SEQ_IN_INDEX', [$table]);
        $foreign = DB::select('SELECT k.CONSTRAINT_NAME, k.COLUMN_NAME, k.ORDINAL_POSITION,
            k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE
            FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r
            ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
            AND r.TABLE_NAME = k.TABLE_NAME WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = ?
            ORDER BY k.CONSTRAINT_NAME, k.ORDINAL_POSITION', [$table]);
        $state = DB::selectOne('SELECT ENGINE, AUTO_INCREMENT, TABLE_COLLATION
            FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', [$table]);
        requireP5($state->ENGINE === 'InnoDB', 'Nontransactional table detected');
        if (str_starts_with($state->TABLE_COLLATION, 'utf8_')) {
            $state->TABLE_COLLATION = 'utf8mb3_'.substr($state->TABLE_COLLATION, 5);
        }
        $schema = ['columns' => $columns, 'indexes' => $indexes, 'foreign_keys' => $foreign, 'state' => $state];
        $result['tables'][$table] = ['count' => count($rows),
            'data_sha256' => hash('sha256', json_encode($rows, JSON_THROW_ON_ERROR)),
            'schema_sha256' => hash('sha256', json_encode($schema, JSON_THROW_ON_ERROR)), 'schema' => $schema];
    }
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)."\n";
} catch (Throwable $error) {
    if (is_dir('/p5-evidence')) {
        file_put_contents('/p5-evidence/snapshot-error.txt', (string) $error);
        chmod('/p5-evidence/snapshot-error.txt', 0600);
    }
    fwrite(STDERR, 'P5 snapshot refused or failed: '.get_class($error)."\n");
    exit(1);
}
