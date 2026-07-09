# Prediction Cache Auth Boundary

## Goal

ユーザー A が勝敗予想に投票した後、ログアウトしてユーザー B でログインした場合に、A の投票状態や投票済み向け集計結果が B の試合詳細画面に表示されないようにする。

## Background / Context

`useFetchUsersPrediction` は `QUERY_KEY.PREDICTION` を固定キーとして利用し、`staleTime: Infinity` でユーザーの勝敗予想一覧を保持している。
そのため、認証ユーザーが切り替わっても前ユーザーの予想キャッシュが残ると、`MatchContainer` が前ユーザーの投票を現在ユーザーの `userPrediction` として扱う可能性がある。

`useMatchPredictions` は `userPrediction` を query key に含めている。
前ユーザーの `userPrediction` によって取得された公開済みの試合別集計キャッシュが残ると、未投票ユーザーに一時的に表示されるリスクがある。

## Scope

### In Scope

- 通常ログアウト成功時にユーザー固有の勝敗予想キャッシュを破棄する
- 通常ログイン成功時に、前ユーザー由来の勝敗予想キャッシュを破棄してから新ユーザーの予想を再取得する
- ゲストログイン / ゲストログアウト成功時も同じ認証境界としてキャッシュ破棄対象にする
- `QUERY_KEY.PREDICTION` の削除を必須対応にする
- `QUERY_KEY.MATCH_PREDICTIONS` の削除を、古い公開済み集計を再利用させない追加防御として行う
- 関連する認証 hook テストを更新し、成功時にキャッシュが削除されること、失敗時に削除されないことを保証する

### Out of Scope

- `PredictionSummary` の表示デザイン変更
- 勝敗予想 API の公開判定ルール変更
- 投票の作成・変更・取消仕様の変更
- バックエンド API / DB スキーマ変更
- `useFetchUsersPrediction` の query key に user id を含める設計変更

## Impact Area

- `frontend/src/hooks/apiHooks/auth/useLogin.ts`
- `frontend/src/hooks/apiHooks/auth/useLogout.ts`
- `frontend/src/hooks/apiHooks/auth/useGuestLogin.ts`
- `frontend/src/hooks/apiHooks/auth/useGuestLogout.ts`
- `frontend/src/hooks/apiHooks/auth/__test__/useLogin.test.tsx`
- `frontend/src/hooks/apiHooks/auth/__test__/useLogout.test.tsx`
- `frontend/src/hooks/apiHooks/auth/__test__/useGuestLogin.test.tsx`
- `frontend/src/hooks/apiHooks/auth/__test__/useGuestLogout.test.tsx`
- React Query の `prediction` / `match/predictions` キャッシュ
- 試合詳細画面の勝敗予想表示

## Options

### Option 1: ログアウト成功時だけ `QUERY_KEY.PREDICTION` を削除する

- メリット: 今回の再現手順に対する変更が最小
- デメリット: セッション切れ、別タブ、ログイン経路の違いなどでログアウト処理を通らない場合に古いキャッシュが残り得る
- リスク: ログイン直後の防御が弱く、認証境界の仕様としては不完全になる

### Option 2: ログイン / ログアウト / ゲストログイン / ゲストログアウトで `QUERY_KEY.PREDICTION` を削除する

- メリット: 認証境界で前ユーザーの投票一覧を確実に破棄できる
- デメリット: 複数 hook の更新とテスト修正が必要
- リスク: 既存の refetch 順序を誤ると、ログイン後の投票状態再取得が期待通りに走らない可能性がある

### Option 3: Option 2 に加えて `QUERY_KEY.MATCH_PREDICTIONS` も削除する

- メリット: 前ユーザーの `userPrediction` に紐づいて取得された公開済み集計キャッシュを再利用しないため、表示漏れのリスクをさらに下げられる
- デメリット: 認証切り替え後に試合別集計を再取得するため、若干リクエストが増える
- リスク: キャッシュ削除範囲が広がるため、試合詳細を開き直した時の初回表示はローディングを経由しやすくなる

### Option 4: `useFetchUsersPrediction` の query key に user id / guest state を含める

- メリット: ユーザーごとにキャッシュが自然に分離される
- デメリット: 現在の `UserType` で安定した user id を使えるか確認が必要で、影響範囲が広い
- リスク: ゲスト状態や未認証状態を含めた query key 設計を見直す必要がある

## Decision

Option 3 を採用する。

## Rationale

今回の直接原因は、前ユーザーの `QUERY_KEY.PREDICTION` が残り、現在ユーザーの `userPrediction` として扱われることである。
そのため `QUERY_KEY.PREDICTION` の削除は必須とする。

さらに、`useMatchPredictions` は `userPrediction` を query key に含めているため、前ユーザーの投票状態に基づく公開済み集計キャッシュも認証境界ではユーザー依存データとして扱う。
`invalidateQueries` では再取得中に古いデータが残る可能性があるため、認証境界では `removeQueries` で破棄する。

ログアウト時削除は退出時の掃除、ログイン時削除は前セッションや別経路で残ったキャッシュに対する防御として扱う。
通常ユーザーとゲストの切り替えも同じ認証境界なので、同一方針で揃える。

## Tasks

- [x] 認証境界で削除する query key を整理する
- [x] `useLogin` 成功時に `prediction` / `match/predictions` キャッシュを削除してからユーザー予想を再取得する
- [x] `useLogout` 成功時に `prediction` / `match/predictions` キャッシュを削除する
- [x] `useGuestLogin` 成功時に `prediction` / `match/predictions` キャッシュを削除してからユーザー予想を再取得する
- [x] `useGuestLogout` 成功時に `prediction` / `match/predictions` キャッシュを削除する
- [x] 認証 hook テストに成功時のキャッシュ削除検証を追加する
- [x] 認証 hook テストに失敗時はキャッシュ削除されない検証を追加する
- [x] 関連テストを実行する
- [x] 実装差分をレビューする

## Test Plan

- `useLogout` 成功時に `QUERY_KEY.PREDICTION` が削除されることを確認する
- `useLogout` 成功時に `QUERY_KEY.MATCH_PREDICTIONS` 配下のキャッシュが削除されることを確認する
- `useLogout` 失敗時は既存の認証キャッシュと勝敗予想キャッシュが維持されることを確認する
- `useLogin` 成功時に前ユーザー由来の勝敗予想キャッシュを削除し、新ユーザーの予想再取得が呼ばれることを確認する
- `useLogin` 失敗時は勝敗予想キャッシュを削除しないことを確認する
- `useGuestLogin` / `useGuestLogout` でも通常ログイン / ログアウトと同じキャッシュ削除仕様を確認する
- `useVoteMatchPrediction` の既存テストで投票後の再取得挙動が壊れていないことを確認する

実行予定コマンド:

```bash
cd frontend && npm test -- --run useLogout.test.tsx useLogin.test.tsx useGuestLogin.test.tsx useGuestLogout.test.tsx useVoteMatchPrediction.test.tsx
```

必要に応じて追加確認:

```bash
cd frontend && npm test
cd frontend && npm run lint
```

## Risks

- `removeQueries` の対象指定が広すぎると不要な再取得が増えるため、`QUERY_KEY.PREDICTION` と `QUERY_KEY.MATCH_PREDICTIONS` に限定する
- ログイン成功時の `refetchMatchPrediction` より後にキャッシュ削除すると新ユーザーの予想まで消す可能性があるため、削除順序をテストで確認する
- 既存テストでは `useReactQuery` を mock している箇所があるため、実 QueryClient でキャッシュ削除を検証できる形にテスト構成を調整する必要がある
- 認証境界のキャッシュ削除は UI 表示の一瞬のちらつきに影響する可能性があるため、試合詳細の既存表示分岐テストと hook テストで回帰を確認する
