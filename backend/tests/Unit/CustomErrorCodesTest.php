<?php

namespace Tests\Unit;

use App\Exceptions\CustomErrorCodes;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class CustomErrorCodesTest extends TestCase
{
  /**
   * CustomErrorCodesの数値が重複していないことを確認する
   */
  public function testCustomErrorCodesAreUnique()
  {
    $reflection = new ReflectionClass(CustomErrorCodes::class);
    $codes = $reflection->getConstants();

    $groupedByValue = [];

    // 同じ数値に紐づく定数名をまとめ、重複時に原因を特定しやすくする
    foreach ($codes as $name => $value) {
      $groupedByValue[$value][] = $name;
    }

    $duplicates = array_filter(
      $groupedByValue,
      fn ($names) => count($names) > 1
    );

    $this->assertSame([], $duplicates);
  }

  /**
   * フロントエンドのCustomErrorCodesがバックエンドの定義と一致していることを確認する
   */
  public function testFrontendCustomErrorCodesAreSynced()
  {
    $frontendPath = dirname(__DIR__, 3) . '/frontend/src/constants/customErrorCodes.ts';

    // 通常のPHPコンテナではfrontendをマウントしないため、codegen用の実行時だけ同期を確認する
    if (!file_exists($frontendPath)) {
      $this->markTestSkipped('frontend is not mounted.');
    }

    $this->assertSame(
      $this->buildExpectedTypescriptContent(),
      file_get_contents($frontendPath)
    );
  }

  private function buildExpectedTypescriptContent(): string
  {
    $reflection = new ReflectionClass(CustomErrorCodes::class);
    $codes = $reflection->getConstants();

    $lines = [
      'export const CUSTOM_ERROR_CODE = {',
    ];

    // バックエンドの定義順でTypeScriptの定数を組み立てる
    foreach ($codes as $name => $value) {
      $lines[] = "  {$name}: {$value},";
    }

    $lines[] = '} as const;';
    $lines[] = '';

    return implode(PHP_EOL, $lines);
  }
}
