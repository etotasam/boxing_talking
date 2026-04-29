---
name: php-test
description: Laravel バックエンドのテスト作成・確認時に参照する手順
---

# PHP Test

## Purpose

Laravel バックエンド変更時の Feature / Unit テスト方針を統一する。

## Test Location and Naming

- Feature Test は `backend/tests/Feature/...` に配置する。
- Unit Test は `backend/tests/Unit/...` に配置する。
- テストクラス名は `*Test.php` を使用する。

## Execution Rules

- テストは必ず `docker compose exec php php artisan test` で実行する。
- ローカルの `php` や `./vendor/bin/phpunit` は使用しない。

## Feature Test Checklist

- `正常系` を確認する。
- `認証/認可異常系` を確認する。
- `入力異常系` を確認する。
- 一覧系は `0件` `最終ページ` `取得失敗` を確認する。

## Unit Test Checklist

- Service / Utility / 例外分岐 / 境界値を確認する。
- 副作用のある処理は、期待する状態変化を確認する。

## Comment Rules

- テストコードの説明コメントは日本語で記述する。

## Coverage Policy

- `Service` `Utility` は高めのカバレッジを目指す。
- Controller は coverage の数値よりも Feature Test のシナリオ網羅を優先する。
