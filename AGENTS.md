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

## Testing

- フロントエンドのテストは実装と近い場所に置き、ファイル名は `Component.test.tsx` や `functions.test.ts` のようにしてください。
- バックエンドの機能テストは `backend/tests/Feature/...` に配置してください。
- フォーム、認証、API 通信まわりを変更した場合は、関連テストまたはカバレッジ確認を必ず行ってください。

## Commit Rules

- 変更内容が一目で分かるメッセージにしてください。
- コミットメッセージは Conventional Commits の形式で書いてください。
- 詳細は `./.agents/skills/git-commit/SKILL.md` を参照してください。

## Restrictions

- 生成物である `frontend/dist/` は手動で編集しないでください。
- 依存パッケージの `node_modules/` は手動で編集しないでください。
- 環境変数や秘密情報はコミットしないでください。
- 新しい設定値を追加した場合は、対応する README も更新してください。
