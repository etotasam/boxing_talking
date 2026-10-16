# フロントエンド開発規約

## 対象範囲

`frontend/` の調査・設計・変更・レビューに適用する。
共通の承認ルール・作業手順・制限事項は、ルートの `AGENTS.md` に従う。
文中のパスはリポジトリルートを基準とする。

## ディレクトリ構成

- アプリケーション実装: `frontend/src`
- ユニットテスト: 各機能近くの `__test__`
- 共有定数: `frontend/src/constants`

## 言語・フォーマット

- TypeScript を使用すること
- コードフォーマットは `frontend/.prettierrc` に必ず従うこと
  - シングルクォート
  - `printWidth: 100`
- `any` 型の使用は禁止する。やむを得ない場合は理由をコメントで明示すること

## 命名規則

- React コンポーネント・ページは、ファイル名・コンポーネント名ともに `PascalCase` を使用すること
  - 例: `UserInfo.tsx`、`LoginPage.tsx`
- カスタムフックは、`use` で始まる `camelCase` を使用すること
  - 例: `useUserData.ts`、`useComments.ts`

## PC/SP判定

- PC/SPによるコンポーネント表示・処理の分岐には、
  `frontend/src/store/isPcState.ts` の Recoil state から取得した `isPc` を必ず使用すること
- 同じ目的で `window.innerWidth`、`matchMedia`、独自の判定用 state・hook を追加しないこと
- PC/SPによるコンポーネントの表示・非表示を、CSSだけで独自に判定しないこと
- 余白・サイズ・配置など、CSSによるレスポンシブなレイアウト調整はこの制限の対象外とする

## ログ・共有定数

- `console.error` 以外の `console` は使用しないこと。デバッグ用途も含む
- 共有定数は `frontend/src/constants` に配置すること

## エラーコード

- エラーコードの追加・変更、または `frontend/src/constants/customErrorCodes.ts` を扱う場合は、
  `docs/development/backend.md` も必ず読むこと
- エラーコードの変更・生成手順は、バックエンド開発規約に従うこと

## 生成物の扱い

- 生成物である `frontend/dist/` は手動で編集しないこと

## 開発・検証コマンド

以下のコマンドは `frontend/` で実行する。

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | Vite 開発サーバーの起動 |
| `npm run build` | TypeScript の型検査と本番ビルド |
| `npm run lint` | `ts` / `tsx` の ESLint 検査 |
| `npm test` | Vitest の実行 |
| `npm run test:coverage` | カバレッジ付きの Vitest 実行 |

## テスト

- 現時点では Cypress E2E は使用せず、テストの追加・更新・実行の対象としない
- 自動テストには Vitest を使用すること
- テスト方針はルートの `AGENTS.md` に従うこと
- テスト作成・更新時は `.agents/skills/tester/SKILL.md` を参照すること
