# バックエンド開発規約

## 対象範囲

`backend/` の調査・設計・変更・レビューに適用する。
共通の承認ルール・作業手順・制限事項は、ルートの `AGENTS.md` に従う。
文中のパスはリポジトリルートを基準とする。

## ディレクトリ構成

- アプリケーション実装: `backend/app`
- ルート: `backend/routes`
- マイグレーション・Seeder: `backend/database`
- PHP テスト: `backend/tests`

## 命名・クラス構成

- Controller・Service・Model・Repository は `PascalCase` を使用すること
- 1 ファイル 1 クラスで管理すること

## コメント

- 公開メソッド・複雑な処理・意図が読み取りにくい関数には、日本語コメントを入れること

## PHPコマンドの実行

- バックエンドの PHP / artisan / PHPUnit コマンドは、必ず Docker 経由で実行すること
- ローカルの `php` や `./vendor/bin/phpunit` を直接実行しないこと
- 以下のコマンドはリポジトリルートで実行すること

| コマンド | 用途 |
| --- | --- |
| `docker compose exec php php artisan test` | バックエンドテストの実行 |
| `docker compose exec php php artisan migrate` | マイグレーションの実行 |

## エラーコード

エラーコードの追加・変更時は、`docs/development/frontend.md` も必ず読むこと。

1. `backend/app/Exceptions/CustomErrorCodes.php` を編集する
2. リポジトリルートで `npm run backend:generate-error-codes` を実行する
3. フロントエンド側の `frontend/src/constants/customErrorCodes.ts` を生成する

## テスト

テスト方針はルートの `AGENTS.md` に従う。
テスト作成・更新時は `.agents/skills/tester/SKILL.md` を参照すること。
バックエンドテストは、上記の Docker コマンドで実行すること。
