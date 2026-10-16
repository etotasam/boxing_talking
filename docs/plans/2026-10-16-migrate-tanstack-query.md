# TanStack Query v5 への移行

## Goal

React Query v3 を `@tanstack/react-query` v5 へ移行し、既存の取得・更新・認証・表示動作を維持する。

## Background / Context

- `frontend/package.json` は `react-query: ^3.39.3`、lockfile の解決済みバージョンは 3.39.3。
- `frontend/src` の 47 ファイルが旧パッケージを参照する。Provider、Devtools、API hooks、共通キャッシュ操作、テストを含む。
- React 18 / TypeScript 5 を使用している。
- query の文字列キー、位置引数、query callbacks、`cacheTime`、`keepPreviousData`、テストの `setLogger` を使用している。
- 計画作成時点で作業ツリーに既存差分なし。2026-10-16 にユーザーから実装承認を得た。
- 専用 worktree `/Users/terashimamasato/.codex/worktrees/1338/boxing_talking` の `codex/migrate-tanstack-query` で実装する。起点は `af93059f`（作成時の `feature` と同じ）。`.codex/environments/` の未追跡ファイルは作業対象外。

## Scope

### In Scope

- v5 パッケージ、Devtools、lockfile、Provider、関連 hooks とテストの移行。
- 既存のキャッシュ識別・無効化範囲・読み込み表示・通知・遷移を維持するための互換対応。

### Out of Scope

- バックエンド/API 契約、Recoil の置換、新機能、無関係な依存更新、Cypress。
- 既存のコメントキーに見られる `{ id }` / `{ matchId }` の不一致の修正など、移行と独立した仕様修正。

## Impact Area

- `frontend/package.json`、`frontend/package-lock.json`、`frontend/src/main.tsx`、`frontend/src/queryClient.ts`、`frontend/README.md`。
- `frontend/src/hooks/useReactQuery.ts` と auth / boxer / match / comment / prediction の API hooks。
- 上記 hooks のテスト・共通 wrapper。必要に応じて利用側の状態判定を確認する。
- `QUERY_KEY` 定数の文字列値は維持し、利用時に配列化する。既存の複合配列キーを二重配列化しない。

## Options

1. **v4 へ移行して止める**: 差分を抑えられるが、v5 対応が別途必要になる。
2. **v3 → v5 を一括移行する（採用）**: v4 と v5 両方の破壊的変更を一度に処理し、移行期間中の二重管理を避ける。状態・キャッシュの回帰確認が必要。
3. **v4 を経由して段階的にリリースする**: 問題を切り分けやすいが、依存更新・検証・リリースを重複して行う必要がある。

## Decision

承認済みの v5 一括移行を実装した。npm レジストリと React peer dependencies を確認し、Query / Devtools はともに 5.104.3 を lockfile に記録した。既存依存パッケージの解決済みバージョン変更はない。

## Rationale

利用箇所は frontend 内にまとまっており、既存 hook テストを移行時の回帰検証に使える。v4 を最終状態にするより、v5 API に揃えることで再移行を避けられる。

## Tasks

- [x] 承認後、既存の test / build / lint を実行し、既存失敗と移行由来の失敗を分ける。
- [x] `react-query` を v5 の `@tanstack/react-query` に置換し、Devtools を専用パッケージへ移す。無関係な lockfile 更新を避ける。
- [x] hooks をオブジェクト構文に統一し、query key を配列化する。QueryClient のフィルタ API を `{ queryKey }` へ変更する。`getQueryData` / `setQueryData` は配列キーを渡す。
- [x] 共通 `useReactQuery` は既存の文字列引数を維持し、内部で配列化する。`setQueriesData` の更新範囲を維持する。
- [x] mutation の `isPending` を既存 hook の `isLoading` として返し、利用側の公開インターフェースを維持する。query の初回取得・無効化中・再取得・エラーは別途意味を照合する。
- [x] `keepPreviousData: true` は `placeholderData: keepPreviousData` に、false は省略へ移す。成功状態や更新時刻の差異が UI に影響しないか確認する。`cacheTime` は `gcTime` に移す。
- [x] 削除された query callbacks のうち空処理は除去する。`useAuth` の未認証キャッシュは queryFn が `null` を返す契約で維持する。成功時に `undefined` を返す取得処理がないか確認する。
- [x] `useFetchUsersPrediction` は現在 API の `null` を `undefined` に変換している。v4 以降は成功データの `undefined` が禁止されるため、queryFn / キャッシュは `null` を保持し、hook の公開 `data` は `null` を `undefined` に変換する。予想なし時の投票アイコン・試合表示と、未認証時の取得停止を維持し、専用 hook テストを追加する。
- [x] `useFetchPastMatches` の全画面 loading は queryFn 内で開始し、`try/finally` で成功・失敗のどちらでも終了させる。cache hit 時に不要な表示を開始しない。
- [x] コメント無限取得に明示的な `initialPageParam` を設定する。初回 cursor は既存 API 呼び出しと同等になる値を選び、末尾到達時の停止と一覧結合を維持する。
- [x] 無効化した新着取得の初回手動 refetch は v5 の `isRefetching` だけに依存せず `isFetching` を使い、既存の取得状態を維持する。queryFn のないキャッシュ監視は無効化を維持し、自動リクエストを発生させない。
- [x] v3 のテスト用 `setLogger` を除去する。必要なログ検証があればテスト内で限定し、想定外のエラーを一括で隠さない。mock・キャッシュ seed・フィルタ引数の期待値を更新する。
- [x] オフライン時の初回通信と失敗処理を維持する `networkMode: offlineFirst` を query / mutation 両方に設定し、本番 factory を用いる回帰テストと README の説明を追加する。
- [x] Reviewer subagent に実装差分レビューを依頼し、必要な修正後に関連検証を完了する。

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
- v4 以降のネットワーク状態による pause は既存の全画面 loading を終了できなくするため、公式の v3 互換設定 `networkMode: offlineFirst` を query / mutation 両方へ設定した。本番とテストは `src/queryClient.ts` の factory を共有し、オフライン取得・送信失敗を検証する。無限 query の再取得など、実ブラウザでの確認は残る。

## References

- https://tanstack.com/query/v4/docs/framework/react/guides/migrating-to-react-query-4
- https://github.com/TanStack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md

## Design Review

- Reviewer subagent による設計レビュー済み。実装承認を妨げる重要指摘なし。
- 新着コメントの既存テストの所在に関する指摘を反映した。
- 実装レビューでオフライン mutation 停止による loading 継続の P2 指摘があり、互換設定と回帰テストで修正した。再レビューで P2 解消、追加の重要指摘なし。

## Rollback / Integration

- 実装時は未コミットで検証し、その後ユーザー承認により `bc999c4b` に移行差分を保存した。ビルド・全テスト・lint 成功後、ユーザーから元 worktree へのマージ指示を受けた。
- 不採用の場合は、必要な成果物を確認したうえでユーザーの指示に従って専用 worktree を整理する。元の worktree と `feature` は移行中も維持する。
- 採用する場合は、検証後に移行差分をコミットし、別途承認を得て `feature` へマージする。切り戻しを容易にするためマージコミットを残す方針。
- 取り込み後の切り戻しではコード・package.json・lockfile を一緒に戻し、`npm ci` とビルド・関連テストを行う。パッケージだけのダウングレードは行わない。
- マージ先は元 worktree の `feature` とし、`--no-ff` でマージコミットを残す。取り込み後はこのマージコミットに対する `git revert -m 1 <merge-commit>` で移行全体を取り消せる。
- 元の `feature` にある計画書コミット `0e1fd4b9` の切り戻し方針も維持する。worktree ごとに依存関係をインストールし、同時起動時はポートを分ける。元環境はマージまで v3 比較用として保持した。
- 取り消し後の実行検証には別の検証用 worktree を使い、依存復元・テスト・ビルドを確認する。切り戻し後の動作確認そのものは未実施。後続の v5 依存変更により競合し得る点に注意する。
- 本番反映時は旧成果物を保持し、既存のデプロイ方法で旧版へ戻せることを確認する。本番への反映は今回のローカルマージには含めない。

## Verification Results

- 移行前: テスト用 API URL を指定すると 49 ファイル / 190 テスト成功、lint 成功。環境変数なしでは MSW の URL が一致せずコメント関連の 5 件が失敗したため、前後で同じテスト用 URL を指定した。
- 移行前後とも `npm run build` は `src/App.tsx:15` の `@/page/Test` を解決できず停止する。このファイルは元 worktree にのみある Git 管理外・gitignore 対象の開発用ページで、新 worktree には含まれない。今回の移行では変更・補完しない。
- 最終確認: `VITE_APP_API_URL=http://localhost:3000 npm test -- --run` は 52 ファイル / 203 テスト成功（既存 190 + 追加 13）。`npm run lint` 成功。`npm run build` は上記の既存欠落 1 件のみで失敗し、移行由来の型エラーはない。
- `git diff --check` 成功。旧パッケージ参照・削除された API の残存なし。依存更新による既存パッケージのバージョン変更なし。
- [x] Git 管理外の開発用ページ欠落を解決した環境で本番ビルドを確認する。ユーザー承認のもと、元 worktree の `frontend/src/page/Test.tsx` を同じ内容でコピーした。gitignore 対象を維持し、移行コミットには含めない。
- コピー後の再検証: `npm run build` 成功（TypeScript / Vite とも成功）、`VITE_APP_API_URL=http://localhost:3000 npm test -- --run` は 52 ファイル / 203 テスト成功、`npm run lint` 成功。
- ビルド警告: Browserslist データの古さと 500 kB 超の生成チャンクに関する警告あり。今回の移行の対象として依存更新や分割変更は追加しない。
- [ ] 実ブラウザで主要画面と Devtools の接続を確認する。
