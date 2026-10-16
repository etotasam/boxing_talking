# TanStack Query v5 への移行

## Goal

React Query v3 を `@tanstack/react-query` v5 へ移行し、既存の取得・更新・認証・表示動作を維持する。

## Background / Context

- `frontend/package.json` は `react-query: ^3.39.3`、lockfile の解決済みバージョンは 3.39.3。
- `frontend/src` の 47 ファイルが旧パッケージを参照する。Provider、Devtools、API hooks、共通キャッシュ操作、テストを含む。
- React 18 / TypeScript 5 を使用している。
- query の文字列キー、位置引数、query callbacks、`cacheTime`、`keepPreviousData`、テストの `setLogger` を使用している。
- 計画作成時点で作業ツリーに既存差分なし。実装は未承認。

## Scope

### In Scope

- v5 パッケージ、Devtools、lockfile、Provider、関連 hooks とテストの移行。
- 既存のキャッシュ識別・無効化範囲・読み込み表示・通知・遷移を維持するための互換対応。

### Out of Scope

- バックエンド/API 契約、Recoil の置換、新機能、無関係な依存更新、Cypress。
- 既存のコメントキーに見られる `{ id }` / `{ matchId }` の不一致の修正など、移行と独立した仕様修正。

## Impact Area

- `frontend/package.json`、`frontend/package-lock.json`、`frontend/src/main.tsx`。
- `frontend/src/hooks/useReactQuery.ts` と auth / boxer / match / comment / prediction の API hooks。
- 上記 hooks のテスト・共通 wrapper。必要に応じて利用側の状態判定を確認する。
- `QUERY_KEY` 定数の文字列値は維持し、利用時に配列化する。既存の複合配列キーを二重配列化しない。

## Options

1. **v4 へ移行して止める**: 差分を抑えられるが、v5 対応が別途必要になる。
2. **v3 → v5 を一括移行する（採用）**: v4 と v5 両方の破壊的変更を一度に処理し、移行期間中の二重管理を避ける。状態・キャッシュの回帰確認が必要。
3. **v4 を経由して段階的にリリースする**: 問題を切り分けやすいが、依存更新・検証・リリースを重複して行う必要がある。

## Decision

v5 系へ一括移行する案を提案する。具体的なパッチバージョンは実装時にレジストリ・peer dependencies を確認して確定し、lockfile に記録する。

## Rationale

利用箇所は frontend 内にまとまっており、既存 hook テストを移行時の回帰検証に使える。v4 を最終状態にするより、v5 API に揃えることで再移行を避けられる。

## Tasks

- [ ] 承認後、既存の test / build / lint を実行し、既存失敗と移行由来の失敗を分ける。
- [ ] `react-query` を v5 の `@tanstack/react-query` に置換し、Devtools を専用パッケージへ移す。無関係な lockfile 更新を避ける。
- [ ] hooks をオブジェクト構文に統一し、query key を配列化する。QueryClient のフィルタ API を `{ queryKey }` へ変更する。`getQueryData` / `setQueryData` は配列キーを渡す。
- [ ] 共通 `useReactQuery` は既存の文字列引数を維持し、内部で配列化する。`setQueriesData` の更新範囲を維持する。
- [ ] mutation の `isPending` を既存 hook の `isLoading` として返し、利用側の公開インターフェースを維持する。query の初回取得・無効化中・再取得・エラーは別途意味を照合する。
- [ ] `keepPreviousData: true` は `placeholderData: keepPreviousData` に、false は省略へ移す。成功状態や更新時刻の差異が UI に影響しないか確認する。`cacheTime` は `gcTime` に移す。
- [ ] 削除された query callbacks のうち空処理は除去する。`useAuth` の未認証キャッシュは queryFn が `null` を返す契約で維持する。成功時に `undefined` を返す取得処理がないか確認する。
- [ ] `useFetchUsersPrediction` は現在 API の `null` を `undefined` に変換している。v4 以降は成功データの `undefined` が禁止されるため、queryFn / キャッシュは `null` を保持し、hook の公開 `data` は `null` を `undefined` に変換する。予想なし時の投票アイコン・試合表示と、未認証時の取得停止を維持し、専用 hook テストを追加する。
- [ ] `useFetchPastMatches` の全画面 loading は queryFn 内で開始し、`try/finally` で成功・失敗のどちらでも終了させる。cache hit 時に不要な表示を開始しない。
- [ ] コメント無限取得に明示的な `initialPageParam` を設定する。初回 cursor は既存 API 呼び出しと同等になる値を選び、末尾到達時の停止と一覧結合を維持する。
- [ ] 無効化した新着取得の初回手動 refetch は v5 の `isRefetching` だけに依存せず `isFetching` を使い、既存の取得状態を維持する。queryFn のないキャッシュ監視は無効化を維持し、自動リクエストを発生させない。
- [ ] v3 のテスト用 `setLogger` を除去する。必要なログ検証があればテスト内で限定し、想定外のエラーを一括で隠さない。mock・キャッシュ seed・フィルタ引数の期待値を更新する。
- [ ] Reviewer subagent に実装差分レビューを依頼し、必要な修正後に関連検証を完了する。

## Test Plan

- 認証: ユーザー取得/未認証 null、通常/ゲストのログイン・ログアウト、予想キャッシュ破棄、管理者状態の再確認、送信中・成功・失敗表示を既存テストで確認する。
- 一覧/更新: 選手・試合の取得と更新後の再取得、キー変更時の以前のデータ表示を維持する。
- 過去試合: 成功・失敗・再取得後に全画面 loading が終了し、cache hit で loading が残らないことを確認する。失敗ケースのテストを追加する。
- コメント: 初回ページ、cursor での次ページ、末尾停止、失敗状態、手動新着取得と新着キャッシュ反映を保証する。`useFetchComments.test.tsx` にある新着取得・merge・0件の既存テストを移行し、初回取得中・失敗・自動取得停止の検証を補う。
- ユーザー予想: API の `null` が query エラーにならず、公開 data は従来どおり `undefined` であること、および未認証/認証/ゲストの取得条件と取得状態を確認する。
- 既存テストを移行し、`npm test -- --run`、`npm run build`、`npm run lint` を frontend で実行する。既存失敗や実行制約は報告する。
- 最後に旧パッケージ参照の残存、無関係な差分、Devtools の接続を確認する。

## Risks

- query と mutation の状態名変更を単純置換すると loading 表示が変わる。無効化 query と初回手動取得を重点確認する。
- 配列キーとフィルタの変換漏れは、認証キャッシュや更新後の一覧を古いまま残す。
- query callbacks の削除は全画面 loading を終了できなくする可能性がある。
- placeholderData は以前のデータ維持と完全に同義ではないため、失敗時表示も確認する。
- v4 以降のネットワーク状態による pause、無限 query の再取得動作など、既定動作の差異がある。既存用途への影響を確認し、根拠なく global option を増やさない。

## Worktree / Rollback Plan

- 実装承認後、計画書を含むコミットを起点に専用ブランチ・新しい worktree を作成する。現在の worktree は v3 の比較用環境として残す。
- 依存関係は各 worktree で個別にインストールする。同時起動する場合は開発サーバーのポートを分ける。
- 移行前のコミット SHA と検証結果を記録し、移行コード・テスト・`package.json`・lockfile を無関係な変更から分離した移行コミットにまとめる。
- 切り戻し時は移行コミットを `git revert` し、frontend で `npm ci` を実行して v3 の依存関係を復元する。パッケージだけをダウングレードせず、コードと lockfile も一緒に戻す。
- 取り込み前に使い捨ての検証用 worktree で revert・依存復元・関連テスト・ビルドを確認する。後続変更が v5 API に依存すると revert に競合が起こり得るため、移行の動作確認中は変更を混在させない。
- 本番反映を行う場合は移行前の成果物を保持し、既存のデプロイ方法で旧版へ戻せることを確認する。本番反映そのものは今回の実装承認に含めない。
- この計画書のコミットは実装の承認を意味しない。現時点で移行実装は未承認。

## References

- https://tanstack.com/query/v4/docs/framework/react/guides/migrating-to-react-query-4
- https://github.com/TanStack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md

## Design Review

- Reviewer subagent による設計レビュー済み。実装承認を妨げる重要指摘なし。
- 新着コメントの既存テストの所在に関する指摘を反映した。実装・テストは承認後に行う。
