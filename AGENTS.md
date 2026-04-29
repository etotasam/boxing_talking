# リポジトリガイドライン

## AI 向け指示

- 変更前に必ず提案すること
- 変更する際は必ず承認を得ること
- 関連テストを実行し、実行できない場合は理由を報告すること
- 重要な変更では複数案を比較し、採用理由を明示したうえで最適案を選ぶこと

## エージェント選択ルール

- 小規模タスク（単一ファイル・単純修正）は単一エージェントで実行する
- 以下の場合は subagents の使用を検討する:
  - 設計が必要な場合
  - 複数ファイルにまたがる変更
  - テスト作成が含まれる場合
  - リファクタリング

## エージェント役割対応

- Explorer: コードベースの調査、関連ファイル、依存関係、影響範囲、想定リスクを根拠付きで整理する。詳細は `.agents/skills/explorer/SKILL.md` を参照すること
- Planner: 設計、影響範囲、複数案比較、実装方針、テスト方針を整理する。詳細は `.agents/skills/planner/SKILL.md` を参照すること
- Worker: 承認済み方針に沿って実装し、無関係な差分を触らない。詳細は `.agents/skills/worker/SKILL.md` を参照すること
- Tester: テスト追加・更新と関連テスト実行を担当する。詳細は `.agents/skills/tester/SKILL.md` を参照すること
- Reviewer: 差分、仕様適合性、テスト不足、リグレッションリスクを確認する。詳細は `.agents/skills/reviewer/SKILL.md` を参照すること

## ワークフロー

- 役割を分ける場合は、以下の流れを基本とする:
  1. 影響範囲や既存実装の確認が必要な場合は Explorer が調査すること
  2. 設計が必要な場合は Planner が Explorer の調査結果を踏まえて設計すること
  3. 実装は承認後に Worker が実装すること
  4. テスト追加・更新が必要な場合は Tester が作成すること
  5. 実装後は Reviewer が差分・仕様・テスト観点で確認すること
  6. 最後に関連テストを実行し、結果を報告すること

## プロジェクト構成

- フロントエンドは `frontend/`、バックエンドは `backend/` にあります
- フロントエンド実装は `frontend/src`、Cypress は `frontend/cypress/e2e`、ユニットテストは各機能近くの `__test__` に配置します
- バックエンドのアプリ本体は `backend/app`、ルートは `backend/routes`、マイグレーションと Seeder は `backend/database`、PHP テストは `backend/tests` にあります
- Docker 関連のファイルは `docker/` にあり、起動定義はルートの `docker-compose.yml` です

## コマンド

- `docker compose up --build`: Nginx、PHP、MySQL、フロント開発サーバーをまとめて起動します
- `cd frontend && npm run dev`: Vite 開発サーバーを起動します
- `cd frontend && npm run build`: TypeScript の型検査と本番ビルドを実行します
- `cd frontend && npm run lint`: `ts` / `tsx` を ESLint で検査します
- `cd frontend && npm test`: Vitest を実行します
- `cd frontend && npm run test:coverage`: カバレッジ付きで Vitest を実行します
- `cd frontend && npm run cy`: Cypress を起動します
- `docker compose exec php php artisan test`: バックエンドの PHPUnit / Laravel テストを Docker 経由で実行します
- `npm run backend:generate-error-codes`: バックエンドの `CustomErrorCodes` からフロントエンドのエラーコード定数を生成します

## フロントエンドルール

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

## バックエンドルール

- Controller・Service・Model・Repository は `PascalCase`
- 1 ファイル 1 クラスで管理する
- バックエンドの PHP / artisan / PHPUnit コマンドは Docker 経由で実行すること
  - テスト: `docker compose exec php php artisan test`
  - マイグレーション: `docker compose exec php php artisan migrate`
  - ローカルの `php` や `./vendor/bin/phpunit` を直接実行しない
- エラーコードを追加・変更する時は `backend/app/Exceptions/CustomErrorCodes.php` を編集し、`npm run backend:generate-error-codes` でフロントエンド側の `frontend/src/constants/customErrorCodes.ts` を生成すること
- 公開メソッド・複雑な処理・意図が読み取りにくい関数には日本語コメントを入れること

## テスト

- テストは、実装詳細ではなく公開される振る舞い・仕様・ユーザーから見える結果を検証すること
- テスト追加・更新の要否は変更リスクに応じて判断し、「何を保証するテストか」を明確にすること
- 認証・フォーム送信・API 通信・一覧取得・ページングを変更した場合は、関連テストの追加・更新を検討すること
- 変更後は関連テストを実行し、実行できない場合は理由を報告すること
- テスト作成・更新時は `.agents/skills/tester/SKILL.md` を参照すること

## コミットルール

- 変更内容が一目で分かるメッセージにすること
- コミットメッセージは Conventional Commits の形式で書くこと
- 詳細は `./.agents/skills/git-commit/SKILL.md` を参照すること

## 制限事項

- 生成物である `frontend/dist/` は手動で編集しない
- 依存パッケージの `node_modules/` は手動で編集しない
- 環境変数や秘密情報はコミットしない
- 新しい設定値を追加した場合は、対応する README も更新すること
