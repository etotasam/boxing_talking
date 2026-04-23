# Repository Guidelines

## AI Instructions

- 変更前に必ず提案をしてください。
- 変更する際は必ず承認を得てください。
- 変更後は必ずテストを行う。

## Project Structure

- フロントエンドは `frontend/`、バックエンドは `backend/` にあります。
- フロントエンド実装は `frontend/src`、Cypress は `frontend/cypress/e2e`、ユニットテストは各機能近くの `__test__` に配置します。
- バックエンドのアプリ本体は `backend/app`、ルートは `backend/routes`、マイグレーションと Seeder は `backend/database`、PHP テストは `backend/tests` にあります。
- Docker 関連のファイルは `docker/` にあり、起動定義はルートの `docker-compose.yml` です。

## Commands

- `docker compose up --build`: Nginx、PHP、MySQL、フロント開発サーバーをまとめて起動します。
- `cd frontend && npm run dev`: Vite 開発サーバーを起動します。
- `cd frontend && npm run build`: TypeScript の型検査と本番ビルドを実行します。
- `cd frontend && npm run lint`: `ts` / `tsx` を ESLint で検査します。
- `cd frontend && npm test`: Vitest を実行します。
- `cd frontend && npm run test:coverage`: カバレッジ付きで Vitest を実行します。
- `cd frontend && npm run cy`: Cypress を起動します。
- `docker compose exec php php artisan test`: バックエンドの PHPUnit / Laravel テストを Docker 経由で実行します。
- `npm run backend:generate-error-codes`: バックエンドの `CustomErrorCodes` からフロントエンドのエラーコード定数を生成します。

## Frontend Rules

- フロントエンドは TypeScript を使用すること
- コードフォーマットは `frontend/.prettierrc` に必ず従うこと
  - シングルクォート
  - `printWidth: 100`

- React コンポーネント・ページ
  - ファイル名・コンポーネント名ともに `PascalCase` を使用する
  - 例) `UserInfo.tsx`, `LoginPage.tsx`

- カスタムフック
  - `use` で始まる `camelCase` を使用する
  - 例) `useUserData.ts`, `useComments.ts`

- `any` 型の使用は禁止（やむを得ない場合は理由をコメントで明示すること）
- `console.error` 以外の `console` は使用しないこと（デバッグ用途も含む）
- 共有定数は `frontend/src/constants` に配置すること

## Backend Rules

- Controller・Service・Model・Repository は `PascalCase`
- 1 ファイル 1 クラスで管理する
- バックエンドの PHP / artisan / PHPUnit コマンドは Docker 経由で実行すること
  - テスト: `docker compose exec php php artisan test`
  - マイグレーション: `docker compose exec php php artisan migrate`
  - ローカルの `php` や `./vendor/bin/phpunit` を直接実行しない
- エラーコードを追加・変更する時は `backend/app/Exceptions/CustomErrorCodes.php` を編集し、`npm run backend:generate-error-codes` でフロントエンド側の `frontend/src/constants/customErrorCodes.ts` を生成すること
- 関数には何をしている関数なのかを日本語でコメントを入れる

## Testing

- カバレッジは全体率だけを目的にせず、変更箇所と重要機能のシナリオ網羅を優先してください。
- 当面のカバレッジ目安は、全体で `30-40%`、将来的には `50-60%` を目指してください。
- バリデーション関数・純関数は `90%+`、カスタムフック・Service・Utility は `80%+`、UI コンポーネントは `60-80%` を目安にしてください。
- テストは責務に応じて `正常系` `異常系` `境界系` を意識して作成してください。
- 認証・フォーム送信・API 通信を変更した場合は、必ず関連テストを追加または更新してください。
- 一覧取得・ページングは、正常系に加えて `0件` `最終ページ` `取得失敗` を確認してください。
- 変更後は必ず関連テストを実行し、必要に応じて coverage も確認してください。
- フロントエンドの詳細手順は `frontend/.agents/skills/frontend-test/SKILL.md` を参照してください。
- バックエンドの詳細手順は `backend/.agents/skills/php-test/SKILL.md` を参照してください。

## Commit Rules

- 変更内容が一目で分かるメッセージにしてください。
- コミットメッセージは Conventional Commits の形式で書いてください。
- 詳細は `./.agents/skills/git-commit/SKILL.md` を参照してください。

## Restrictions

- 生成物である `frontend/dist/` は手動で編集しないでください。
- 依存パッケージの `node_modules/` は手動で編集しないでください。
- 環境変数や秘密情報はコミットしないでください。
- 新しい設定値を追加した場合は、対応する README も更新してください。
