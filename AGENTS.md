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
- `cd backend && npm test`: `./vendor/bin/phpunit` で PHPUnit を実行します。

## Coding Rules

- フロントエンドでは TypeScript を使い、`frontend/.prettierrc` に従ってください。
- シングルクォートと `printWidth: 100` を維持してください。
- React コンポーネントやページは `PascalCase`、hooks は `use` で始まる `camelCase` を使ってください。
- 共有定数は `frontend/src/assets` にまとめてください。
- `console.error` 以外の `console` は使用しないでください。
- バックエンドの Controller・Service・Model・Repository は `PascalCase`、1 ファイル 1 クラスで管理してください。

## Testing

- フロントエンドのテストは実装と近い場所に置き、ファイル名は `Component.test.tsx` や `functions.test.ts` のようにしてください。
- バックエンドの機能テストは `backend/tests/Feature/...` に配置してください。
- フォーム、認証、API 通信まわりを変更した場合は、関連テストまたはカバレッジ確認を必ず行ってください。

## Commit Rules

- 変更内容が一目で分かるメッセージにしてください。
- コミットメッセージは Conventional Commits の形式で書いてください。
- 詳細は `./.agents/skills/git-commit/SKILL.md` を参照してください。

使用する `type`:

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト
- `chore`: 雑務・設定変更

例:

- `feat(frontend): ログインフォームを追加`
- `fix(backend): ユーザー認証の不具合を修正`
- `docs(readme): 環境構築手順を更新`
- `test(frontend): ログイン画面のテストを追加`

## Restrictions

- 生成物である `frontend/dist/` は手動で編集しないでください。
- 依存パッケージの `node_modules/` は手動で編集しないでください。
- 環境変数や秘密情報はコミットしないでください。
- 新しい設定値を追加した場合は、対応する README も更新してください。
