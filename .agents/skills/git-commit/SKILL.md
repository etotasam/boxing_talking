---
name: git-commit
description: git に今回の変更だけを安全に保存する
---

# Git Commit

## Purpose

- 今回の変更だけを確認・テストして `git commit` する。

## Workflow

1. `git status --short` で変更ファイルを確認する。
2. 変更が複数の目的に分かれている場合は、今回 commit する対象をユーザーに確認する。
3. 対象ファイルの diff を確認し、秘密情報・生成物・無関係な変更が含まれていないか見る。
4. 対象ファイルだけを `git add <path>` で stage する。`git add .` は使わない。
5. 差分に応じた関連テストを実行する。
6. `git diff --cached` を確認し、Conventional Commits 形式の日本語 commit message を提案する。
7. ユーザー承認後に `git commit -m "<message>"` を実行する。
8. commit 後に `git status --short` を確認し、未コミット差分が残っていれば説明する。

## Safety Rules

- unrelated な差分を勝手に stage / commit しない。
- 既に stage されている変更がある場合も、今回の対象か確認する。
- テスト失敗時は commit せず、失敗内容と次の対応案を出す。
- `.env`、秘密情報、`node_modules/`、`frontend/dist/` は含めない。
- `git reset --hard` や `git checkout --` などの破壊的操作は行わない。

## Test Selection

- frontend 差分: 関連する Vitest、`npm run lint`、必要に応じて `npm run build` / `npx tsc --noEmit`。
- backend 差分: 関連する PHPUnit、必要に応じて `cd backend && npm test`。
- ドキュメント・skill のみの差分: `git diff --check` など、内容に合う軽い検証を優先する。

## Commit Message

- 形式: `<type>(<scope>): <description>`
- `scope` は変更対象を簡潔に示す。不要な場合は省略してよい。
- `description` は日本語を使用する。

### Allowed `type` Values

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト
- `chore`: 雑務・設定変更

### Examples

- `feat(frontend): ログインフォームを追加`
- `fix(backend): ユーザー認証の不具合を修正`
- `docs(readme): 環境構築手順を更新`
- `test(frontend): ログイン画面のテストを追加`
