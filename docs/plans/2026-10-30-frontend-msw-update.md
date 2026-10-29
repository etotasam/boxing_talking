# P4f: MSW更新の調査・実装提案

## Goal

MSW配下の脆弱依存を、既存コメント取得テストの保証を維持して解消する具体案を提示する。調査・候補検証・Reviewer設計確認を完了し、ユーザー承認に基づきworktreeへ適用する。

## Background / Context

- 2026-10-30 JST。ユーザーが手順1〜3（調査、一時候補検証、具体案提示/Reviewer確認）までを承認。
- 作業先は既存専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/frontend-build-update`、基点7510e7c8。開始時clean。元checkout/元Composeには操作しない。
- 現MSW1.3.5はdevDependency。利用は `frontend/src/hooks/apiHooks/comment/__test__/useFetchComments.test.tsx` の1ファイル・9ケース・6ハンドラーのみ。browser worker・GraphQL・Storybook連携は使っていない。
- 基点の全204テストは成功済み。更新目的は動作不具合修正ではなく依存脆弱性の整理。
- 直接MSWの監査はlow、経路はMSW→cookie0.4.2→GHSA-pxg6-pf52-xh8x。さらにMSW→@mswjs/interceptors0.17.10→@xmldom/xmldomにもhigh等の指摘がある。2/3系候補では両経路が外れる。
- 本日公式registryで1系最新/backport=1.3.5、2系最新=2.15.0、latest/3系=3.0.3を確認。1系の通常更新だけではcookie ^0.4.2の問題を解消できない。
- MSW3.0.3のregistry要件はNode>=22.12.0、TypeScript>=5.9.x、Vite>=6（TS/Vite/GraphQLはoptional peer）。現在のNode24.22.1/TS5.9.3/Vite7.3.7は適合。プロジェクトはtype=module。
- 公式3系ガイドのNode下限表現は22.0.0だが、採用版のより厳密なengines>=22.12.0に従う。保守期限や2系のEOLを推測して採用理由にしない。

## Scope

### In Scope（承認済み）

- frontend/package.jsonのmswを^3.0.3へ更新。
- frontend/package-lock.jsonに必須の依存再編を反映。GraphQLは旧MSWのみが持つ依存で、3系ではoptional peerとなり通常解決で除去。新規に追加しない。
- 上記テスト1ファイルのハンドラー6か所とimportをMSW3 APIへ変更。9ケースの期待値・test名・assert・テスト対象アプリは維持。
- 計画/結果記録を更新。設定変更や新規テスト追加は候補検証では不要。

### Out of Scope

- push/merge/公開（commitはユーザーの保存依頼により追加承認）。
- アプリ本体、backend、API/認証/ページング仕様、他依存の任意更新。
- browser workerの追加、StorybookへのMSW導入、GraphQL/WebSocket利用、新テスト基盤。
- 無検証override、監査ignore、test skip/弱化、node_modules手編集。

## Impact Area

dev依存とコメント取得のmock HTTP応答に限定。通常アプリの通信処理は維持する。コメント初期ページ/次cursor/末尾/新着merge/空/失敗/手動取得状態の9ケースを維持する。

## Options

| 案 | 必要な変更 | 候補監査（全依存） | 判断 |
| --- | --- | --- | --- |
| 1系を通常更新 | 1系最新が現版で解決不可 | 24のまま | 修正案にならない |
| 1系+MSWだけcookie0.7.2へoverride | manifest overrideとlock、旧テスト維持 | 22（high11/moderate4/low7） | 暫定案。公式の^0.4.2を外れる強制指定で、XML経路も残るため推奨しない |
| 2.15.0へ移行 | 新HTTP APIへの書換え、GraphQL>=16.13.2必須（候補16.14.2） | 21（high10/moderate4/low7） | 代替案。lock解決・監査は確認、実動検証は未実施 |
| 3.0.3へ移行 | 新HTTP APIと専用entrypointへの書換え、必須依存再編 | 21（high10/moderate4/low7） | 推奨。現環境が要件を満たし、一時コピーで全204ケース・lint/build成功 |

全候補のomit-devは5（high2/moderate2/low1）で不変。いずれも新規脆弱package/advisoryなし。件数は脆弱と判定されたpackage数でCVE件数ではない。

## Decision

MSW3.0.3を採用。調査・Reviewer設計評価後、ユーザーの「go ahead」によりworktree適用・検証・最終レビューを承認済み。commitは後続のユーザー保存依頼により追加承認。push/mergeは対象外。

## Rationale

1系の通常修正経路がなく、限定overrideは依存範囲外の独自保守になる。2系でも主要なhandler API書換えは必要で、さらに未利用GraphQLの更新を伴う。3系は現在のNode/TS/Vite/ESMに適合し、利用中のNode HTTP機能について一時コピーで検証可能。2系より依存数が少ないとは主張しない（候補lockエントリは2系1216、3系1224、基点1242）。

## 具体的なテスト移行

- `import { rest } from 'msw'` → `import { http, HttpResponse } from 'msw/http'`。
- `setupServer`の`msw/node` importとlisten/resetHandlers/closeのライフサイクルは維持。
- `rest.get` → `http.get`、`req.url.searchParams` → `new URL(request.url).searchParams`。
- `res(ctx.status(200), ctx.json(...))` → `HttpResponse.json(...)`（既定200）。500の空bodyは`new HttpResponse(null, { status: 500 })`。
- pending Promiseを待つ非同期ハンドラーも待機を維持。テスト名9件とexpect行は一時コピーで基点と一致をassert済み。
- 3系のonUnhandledRequest→onUnhandledFrame変更は現コードで該当オプション未使用。GraphQL/WebSocket/lifecycle event変更も未利用。新設定を追加しない。

## Tasks

- [x] 基点/規約/利用箇所・公式migration/registryを調査。
- [x] 1系/2系/3系/限定overrideの経路を比較。
- [x] 一時コピーで候補lock解決、同条件の全依存/omit-dev audit。
- [x] 3系候補のnpm ci、既存コメント9ケース成功、test名/expect維持を確認。
- [x] 一時コピーで全204テスト・lint/buildの候補検証。
- [x] Reviewerが具体案・影響範囲・検証結果・残リスクを確認（必須指摘なし）。
- [x] ユーザーへ具体案提示し、実装承認を取得。
- [x] 承認済み候補をworktreeの依存定義/lock/テスト1ファイルへ適用。
- [x] 実worktreeから再現導入/関連・全体検証を実施。
- [x] 最終Reviewer差分レビューと結果記録（問題なし、必須指摘・追加修正なし）。

## Test Plan

- 調査用コピー `/private/tmp/boxing-p4f-msw-investigation-20261030/` を使用。candidate-v2/candidate-v3/candidate-overrideはmanifest/lockの比較用、frontend-v3は実動候補コピー。
- Node24.22.1/npm11.19.1の独立container、新規の専用node_modules volume。元環境/過去の依存volumeを変更しない。npm cacheのみ前段の調査用cacheを再利用する。
- 3系は通常npm ci --no-audit --no-fundで再現導入、監査は別実行。候補/導入前後hashと必須依存を確認。
- 既存コメント9ケースを先行確認後、全52ファイル204件・lint・型検査/production build。検出数・assert・skip・期待値を維持する。実装承認後も適用物の一致と関連検証を確認。
- devテスト専用更新でアプリコード/ブラウザMSW未使用のため、合成backend・実ブラウザ・Storybookの再構築は予定しない。production buildアセットは基点と比較する。
- 調査ログ/候補/差分/監査/テスト結果をGit除外証跡へ保存し、DB/session/keys/password/環境設定は含めない。専用一時containerは終了、volumeを保持。

## Risks

- 3系はESM/Node interceptorの内部変更を含む。9ケース成功だけで全体互換を断定しない。
- 2系と限定overrideはlock/監査のみで実動互換性は未確認。overrideを検証済みの安全な修正として提示しない。
- 調査途中で@types/debug4.1.12の維持を試したが、3系interceptorの下限^4.1.13を満たさずnpm ciがEUSAGEで拒否。通常解決へ戻し必須4.1.13を採用して導入成功。無関係更新と誤認して必須依存を固定しない。失敗ログは成功ログと区別する。
- GraphQL/旧interceptor/xml系の除去と新interceptor等の追加が発生する。直接MSWだけの1package差分ではなく、lock全差分を確認する。
- 3系への移行後も他の21 packagesは残る。P4全体は未完了。MSWのテスト利用自体は維持する。

## References

- https://mswjs.io/docs/migrations/1.x-to-2.x
- https://mswjs.io/docs/migrations/2.x-to-3.x
- https://mswjs.io/blog/introducing-msw-3.0
- https://github.com/advisories/GHSA-pxg6-pf52-xh8x
- https://registry.npmjs.org/msw/3.0.3
- [全体計画](2026-10-22-dependency-runtime-update.md)

## 一時候補の検証結果（実装適用前の記録）

- 3.0.3候補の実npm ci成功、関連9件と全52ファイル204件成功、fail/skip0。検出ファイル一覧は基点と一致。lint・型検査/production build成功。新規polyfill・Vitest設定変更なし。
- 既存9ケースのtest名とexpect行は基点と一致。候補コピーの差分はpackage.json/package-lock.json/コメント取得テスト1ファイルだけ。候補manifest/lockは導入前後一致。
- production assetsは基点P4eと全ファイル名/SHA256が一致。アプリの配信結果を変えない候補として確認。
- 3系の最終候補監査は24→21（critical0/high10/moderate4/low7）、omit-dev5不変。新規package/advisory0。MSW/cookieのlowとXML経路のhighが指摘対象から外れた。
- 3系lockは1242→1224エントリ（追加29・削除47）。共通pathの版更新は必須9件を含み、単純なMSWだけの更新ではない。@types/debug4.1.13はinterceptorの要求による必須更新。GraphQLはoptional peerになり通常解決で除去され、他の直接依存版は維持。
- 2系/overrideは依存解決・監査のみで、npm ciやテスト互換性の実動確認はしていない。3系だけを実動検証済み候補として提示。
- Git除外 `docker/db/backup/frontend-msw-investigation-p4f-20261030/` に候補別manifest/lock/監査/差分、移行preview、導入・テスト・lint/buildログ、アセット比較、investigation-summary.jsonを保存。秘密設定・DB・鍵等は含めない。
- 実worktreeは新規の本計画書以外に変更なし。依存/テスト/設定への適用、commit、元環境統合は実施していない。実装は別途ユーザー承認後。

## Reviewer設計レビュー結果

- Reviewer subagentによる設計レビュー完了。必須指摘なし、追加修正不要。MSW3.0.3を実装候補として提示可能。
- 代替案比較、公式移行手順との整合、変更範囲、9テスト名・23のexpect行維持、全204テスト・lint/build、配信assets一致、証跡39ファイルのハッシュ一致を確認。
- 監査24→21、omit-dev5維持、新規指摘なしを確認。実装承認後に適用物の一致と関連検証を再確認する。2系/overrideは実動未検証、他21パッケージの指摘が残る点を維持する。
- 前回はReviewerが利用上限で停止したが、再開後に上記レビューを完了。実worktreeのfrontendへの適用は未実施。


## 実装・検証結果（ユーザー承認後）

- 「go ahead」により実装承認を取得。同じworktree/branchで依存定義・lock・コメント取得テスト1ファイルへ承認済み候補を適用。アプリ本体・設定・backendは変更なし。
- 実worktreeを専用Docker環境へマウントし、新規volume `boxing-p4f-msw-implementation_node_modules` へ `npm ci --offline --no-audit --no-fund` 成功。元Compose/既存依存volumeは変更なし。導入後の3ファイルは候補hashと一致。
- 関連9件・lint・型検査/production build成功。Reviewer差分確認後に全52ファイル204件成功、fail/skip0。テスト識別子は候補時と一致。既存の期待値を維持し、新規テスト・skip・設定変更なし。
- build assets全6ファイルの名前/SHA256はP4eと一致。既存chunk size通知は残る。テスト専用更新のため追加backend/ブラウザ/Storybook検証は実施していない（Test Planの方針どおり）。
- 適用後の監査も24→21（critical0/high10/moderate4/low7）、omit-dev5（high2/moderate2/low1）不変。新規advisoryなし。MSW/cookie/@xmldom/xmldomが指摘対象から外れた。P4全体は未完了。
- 証跡はGit除外 `docker/db/backup/frontend-msw-implementation-p4f-20261030/` に保存。npm ci結果、関連/全体テスト・lint/buildログ、JSON結果、両監査、assets比較、summaryとhash manifestを含む。
- 最終Reviewer評価完了（問題なし、必須指摘・追加修正なし）。ユーザー依頼により、本計画・全体計画を含むP4f保存コミットへ保存。push/merge・元環境統合は未実施。
