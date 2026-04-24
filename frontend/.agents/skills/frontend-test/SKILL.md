---
name: frontend-test
description: React / TypeScript フロントエンドのテスト作成・確認時に参照する手順
---

# Frontend Test

## 目的

React / TypeScript フロントエンド変更時に必要なテスト観点と実行手順を統一する。

## 対象

- `frontend/src/utils/validation`
- `frontend/src/hooks`
- `frontend/src/components/module`
- `frontend/src/page`

## テスト戦略（重要）

- テストはユーザー視点の振る舞いを検証すること
- 実装詳細（state, 内部関数, useState の値など）は直接テストしないこと
- UI は DOM/画面結果、hooks と純関数は公開 API の入力と出力・副作用を基準に検証する

## 禁止事項

- 内部 state を直接参照するテスト
- 実装に強く依存するテスト（class 名・構造依存）
- スナップショットテストは構造固定が目的の箇所に限定し、安易に全面採用しない
- モックしすぎて実際の挙動を検証していないテスト

## テスト配置・命名

- テストは実装近傍の `__test__` に配置する。
- コンポーネントは `Component.test.tsx` を使用する。
- 関数は `functions.test.ts` を使用する。
- カスタムフックは `useXxx.test.tsx` を使用する。

## 優先度

- 最優先は validation、純関数、状態分岐の多い hooks。
- 次優先はフォーム系 UI、API 連携 UI。
- 低優先は単純な再 export、表示だけの薄い component。

## 観点

- validation は `正常系` `異常系` `境界系` を原則必須とする。
- hooks は初期状態、成功、失敗、ローディング、再試行、依存値変化を確認する。
- UI は表示分岐、入力、送信成功、送信失敗、バリデーションエラーを確認する。
- 一覧 UI は `0件` `通常表示` `最終ページ相当` `取得失敗` を確認する。

## 実行コマンド

- `cd frontend && npm test`
- `cd frontend && npm run test:coverage`
- 必要に応じて `cd frontend && npm run lint`
- 必要に応じて `cd frontend && npm run build`

## カバレッジ運用

- 数値だけを目的にしない。
- 変更箇所と重要ロジックの未カバー分岐を優先して埋める。
