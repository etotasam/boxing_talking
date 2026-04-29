---
name: frontend-test
description: React / TypeScript フロントエンドのテスト作成・確認時に参照する手順
---

# Frontend Test

## Purpose

React / TypeScript フロントエンド変更時に必要なテスト観点と実行手順を統一する。

## Scope

主に以下の変更時に参照する。

- `frontend/src/utils`
- `frontend/src/hooks`
- `frontend/src/components`
- `frontend/src/page`
- フォーム、認証、API 通信、一覧表示、状態分岐を含む UI

## Principles

- テストはユーザー視点の振る舞いを検証すること。
- 実装詳細ではなく、公開 API、画面表示、入力結果、副作用を基準に検証すること。
- 変更内容に応じて必要な観点だけを選び、過剰なテストを追加しないこと。
- テストを書く前に「このテストが何を保証するか」を明確にすること。

## Prohibited Patterns

- 内部 state を直接参照するテスト。
- 内部関数、DOM 構造、class 名に強く依存するテスト。
- 意図が薄いスナップショットテスト。
- モックしすぎて実際の利用時の挙動を検証できないテスト。
- カバレッジ率だけを上げるためのテスト。

## Test Location and Naming

- テストは実装近傍の `__test__` に配置する。
- コンポーネントは `Component.test.tsx` を使用する。
- 関数は `functions.test.ts` または対象名に対応した `xxx.test.ts` を使用する。
- カスタムフックは `useXxx.test.tsx` を使用する。

## Priority

- 最優先: validation、純関数、状態分岐の多い hooks。
- 高優先: 認証、フォーム送信、API 通信、エラーハンドリング。
- 中優先: 一覧表示、ページング、条件付き表示。
- 低優先: 単純な再 export、静的表示のみの薄い component。

## Checklist

- validation は `正常系` `異常系` `境界系` を確認する。
- hooks は変更内容に応じて、初期状態、成功、失敗、ローディング、再試行、依存値変化を確認する。
- UI は表示分岐、入力、送信成功、送信失敗、バリデーションエラーを確認する。
- 一覧 UI は変更内容に応じて、`0件` `通常表示` `最終ページ相当` `取得失敗` を確認する。
- API 通信を伴うテストでは、成功時だけでなく失敗時のユーザー表示も確認する。

## When Tests Can Be Skipped

以下は、既存テストで十分に担保されていれば新規テスト追加を省略してよい。

- 型定義だけの変更。
- 表示文言だけの軽微な変更。
- スタイルだけの変更。
- テスト対象の振る舞いが既存テストで既に検証されている変更。

## Commands

- `cd frontend && npm test`
- `cd frontend && npm run test:coverage`
- 必要に応じて `cd frontend && npm run lint`
- 必要に応じて `cd frontend && npm run build`

## Coverage Policy

- 数値だけを目的にしない。
- 変更箇所と重要ロジックの未カバー分岐を優先して埋める。
- coverage は大きなロジック変更、重要機能変更、テスト不足が疑われる場合に確認する。
