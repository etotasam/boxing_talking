# P4e: React Router 7系への移行

## Goal

React Routerの残存指摘を修正した7系へ移行し、現行のURL・認証/権限・検索/ページング・画面遷移を維持する。P4全体の完了とはしない。

## Background / Context

- 2026-10-30 JST、ユーザーが「react-routerの7系への移行調査、実装を進めましょう」と調査・実装を承認。重要な未確定仕様が判明した場合は相談する。
- 既存専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、`codex/frontend-build-update`、基点49069b16。開始時clean。P4c/Cypress削除は保存済み・元環境未統合。新worktree/branch切替なし。
- 基点はreact-router-dom/react-router6.30.6、@remix-run/router1.23.4。監査は全26（critical0/high11/moderate6/low9）、omit-dev7。
- アプリはBrowserRouter/Routes/Route、Link、Outlet、useNavigate/useLocation、テストはMemoryRouterを使用。RouterProvider、loader/action、fetcher、SSR/hydration、React.lazyは未使用。
- 不明パスは単独の /* + NotFound。multi-segment splat下の相対リンクはない。通常のLink/navigateは定数またはpathnameから内部URLを作る。
- 公式registryの7系最新はreact-router-dom/react-router7.18.5。Node>=20/React>=18/react-dom>=18で現Node24/React18を許容。react-router7.18.5の必須依存はcookie ^1.0.1とset-cookie-parser ^2.6.0。
- 公式v7のreact-router-domはreact-router再exportとして提供され、現import経路の維持が可能。8系latestを指定して意図せずmajorを越えない。
- 公式v6→7移行手順のfuture挙動を点検。Declarative Modeに関係するrelativeSplatPathは該当パターンなし、startTransitionは実動確認する。React.lazyをrender中に作る箇所なし。fetcherPersist/normalizeFormMethod/partialHydration/skipActionErrorRevalidationは未使用のData Router機能であり設定を追加しない。

## Scope

### In Scope

- frontend/package.jsonのreact-router-dom下限を^7.18.5へ更新し、必須のreact-router/cookie/set-cookie-parser等をnpm lockへ反映。
- 既存BrowserRouter/URL構造・react-router-dom importを維持する。7系移行に必須の型/テスト環境調整が判明した場合は理由と影響を記録し、保証を弱めない。
- 既存204テスト、lint/build、前後監査、合成API実画面で互換性を確認。
- 本計画と全体計画の簡潔な進捗・残課題を更新。

### Out of Scope

- React19、Router8、Framework/Data Mode、SSR、file-based routingの採用、全importの機械置換。
- 認証/認可・API・DB・URL仕様変更、既存AdminOnlyの設計変更、Cypress再導入、無関係な依存更新。
- 本番秘密設定、元checkout/元サービス/実DB/元依存volumeの操作、commit/push/merge/公開。

## Impact Area

全画面のルーティング、認証後や管理URL拒否の遷移、一覧/詳細・検索・ページング、PC/SPメニューと既存MemoryRouterテスト。API認証方式・URL定数・権限判定は維持。

## Options

1. **7.18.5の互換react-router-domを利用（採用）**: 依存と必要最小限の互換調整に限定でき、既存import/テストを維持できる。
2. **直接react-routerへ全面置換**: 公式の整理方向には沿うが、本アプリでは多数ファイルのimport変更が必要。修正効果を同じに保って差分を増やすため今回は行わない。
3. **6系維持**: 互換リスクは低いがwrjc/337の監査指摘が残り、今回のユーザー選択に合わない。

## Decision

承認された7系移行の範囲で案1。ユーザーへの調査結果共有とReviewer設計確認後に適用。アプリ仕様変更が必要になった場合は依存更新に混ぜず再提案する。

## Rationale

現行Declarative Modeは7系でも利用可能で、Node/Reactの追加major更新は不要。export互換を利用して変更を限定しつつ、7.18.0以降で修正された残存指摘を解消する。

## Tasks

- [x] 基点clean・規約・利用API・公式手順・registry要件を確認。
- [x] 一時コピーで候補lock解決・必須差分・同条件auditを確認。
- [x] Reviewer設計確認。必須指摘なし。
- [x] 承認範囲の実装と専用volumeでnpm ci。
- [x] 既存204件・lint/buildと実ブラウザの遷移確認。
- [x] 最終Reviewer、結果・残課題・証跡保存、専用環境片付け。

## Test Plan

- Node24.22.1/npm11.19.1、前後のmanifest/lockを保存。通常のnpm解決でpeerを満たし、audit fix --force/legacy-peer-deps/無検証overrideを使わない。無関係なGraphQL等の再解決は除外。候補/適用/導入前後のhashを照合する。
- 全依存/omit-dev auditを同条件・同時点で比較。wrjc/337の消失と新規指摘の有無、cookie等の複数経路を確認する。npm ciは専用volumeで実施し、監査は別実行。
- 既存Vitest52ファイル204件、lint、型検査を含むproduction build。検出一覧・skip・assertを弱めない。まず既存テストを使い、新規テストは移行に伴う具体的な保証不足が判明した場合だけ検討。
- 本番buildを合成API/専用SQLiteへ接続。管理者/一般ユーザー/guestのlogin/logout、一般の管理URL拒否、一覧→詳細、詳細直接URL・reload、戻る/進む、検索・ページ2・条件保持、空検索、未知URLのNotFound、termsへのLinkを確認。遷移が繰り返されないことも確認する。
- 特殊文字（コロン/バックスラッシュ等）の検索でも意図しない外部originへ遷移しないことを確認。監査解消と任意の攻撃パターンの安全性保証を混同しない。
- PC/SPのメニュー遷移を確認。認証Cookie/CSRF/CORSの設定を緩めず、合成ユーザーのみ使う。秘密・token値はログへ保存しない。
- src/CSSが不変でもRouter bundleが変わるため画面で確認する。StorybookはRouterを使うstoryがあるか確認し、実影響がある場合に関連検証する。
- 専用コンテナ/ネットワークだけ片付け、volume保持、元4サービスの稼働を確認。

## Risks

- startTransitionで更新タイミングが変わり、認証effect・Recoil・テストの同期前提へ影響し得る。既存動作を確認し、無条件のtransition無効化で隠さない。
- package再編で@remix-run/routerが消え、cookieなどの配置が変わる。依存経路と監査差分を確認する。
- Node向けAPIのimportによりテスト環境でTextEncoder等の不足が出る可能性。実行結果に基づいて必要性を判断する。
- 7.18.5に上げても他のP4依存の指摘は残る。P4全体未完了・元環境未統合を維持。

## References

- https://raw.githubusercontent.com/remix-run/react-router/react-router@7.18.5/docs/upgrading/v6.md
- https://github.com/remix-run/react-router/blob/react-router%407.18.5/CHANGELOG.md
- https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6
- https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg
- https://registry.npmjs.org/react-router-dom/7.18.5
- [全体計画](2026-10-22-dependency-runtime-update.md)

## 設計Reviewer

2026-10-30、Reviewer subagentが公式v7移行手順・利用API・候補lock差分・GraphQL維持・前後監査・検証方針を確認し、問題なし、必須指摘なし。認証effectと検索・戻る等は実動検証で確認する。

## 必須の型互換調整

初回の既存204テスト・lintは成功。TypeScript buildはAdminOnlyのEffectCallbackでTS2345。7系のnavigate型がvoid | Promise<void>を返すため、Effectからnavigate戻り値をreturnする既存1行が型に適合しない。`if (!isAdmin) navigate(ROUTE_PATH.HOME);`として戻り値を返さず、loading/権限判定/遷移先/呼出回数のロジックは維持する。これは承認済みの必須型互換調整で、権限ガードの設計改善は行わない。初回失敗ログを保持し、調整後に既存検証を再実行する。

## 実装・検証結果（2026-10-30 JST）

- react-router-dom/react-router7.18.5へ更新。lock差分はroot、Router2 packages、@remix-run/router1.23.4削除、新規cookie1.1.1、既存set-cookie-parser2.7.2のdevフラグ解除の6エントリ。GraphQL16.12.0は基点エントリ全体を維持。他の直接依存版更新なし。
- appの変更はAdminOnlyの必須型互換1行のみ。BrowserRouter・既存import・URL定数・権限条件・API・CSSを維持。React/Nodeのmajor更新なし。future flag/transition無効化・Data/Framework Mode・新規polyfill・全import置換なし。
- Node24.22.1/npm11.19.1、新規専用volumeへnpm ci --no-audit --no-fund成功。監査は別実行。候補・適用・検証コピーのmanifest/lockはbyte一致、導入後も不変。AdminOnlyもコピーと一致。既存deprecation/install-scripts警告あり、包括許可設定は追加しない。
- 初回は204テスト・lint成功、型検査のみTS2345で失敗。上記1行修正後に全再実行し、既存52ファイル204件全成功（fail/skip0）、lint・型検査/production build成功。検出ファイル一覧は基点と一致。新規テスト・assert弱化・skip追加なし。
- browser buildのscriptはindex-DjepNf_s.js。Router JSは更新、CSSは基点P4dとSHA256一致。従来のchunk/Browserslist等の警告は抑制しない。
- Storybookの既存4 stories/.storybookにはRouterの利用なし。今回Storybook設定・story・テスト基盤の変更なしで、Storybook buildの再実行は行わない。

### 同条件監査

| 条件 | 基点 | 7.18.5 |
| --- | --- | --- |
| 全依存 | 26（critical0/high11/moderate6/low9） | 24（critical0/high11/moderate4/low9） |
| omit-dev | 7（critical0/high2/moderate4/low1） | 5（critical0/high2/moderate2/low1） |

新規脆弱package・新規直接advisory URLは0。react-router/react-router-domが指摘対象から外れ、GHSA-wrjc-x8rr-h8h6とGHSA-337j-9hxr-rhxgが監査から消失。必須cookie1.1.1に新規指摘なし。MSW等の既存cookie経路は別対象として残る。これはCVE件数ではない。残る24 packagesはP4の別段階で対応。

### 実ブラウザ

- 合成API・専用SQLite複製（合成ユーザー2・選手24）をIPv6 loopback frontend13005/API18085で利用。管理者/一般は合成アカウント、guestは専用SQLite上のゲストを生成。外部送信なし、CORS/CSRF・Cookie保護の無効化なし。
- 管理者の誤passwordではログイン画面に留まり、正常loginで管理リンク表示を確認。試合一覧→詳細、直接URL相当のreload、戻る/進むでmatch_idを保持。
- 管理画面リンク→選手編集、名前検索、条件付きpage2（最終7件）、戻るで検索条件復帰、検索解除、コロン/バックスラッシュの検索が内部originに留まることを確認。
- SP390pxで一般ページパネルを開き、Match Resultへ遷移後aria-expanded=falseに閉じることを確認。過去試合の空一覧、利用規約Link、未知URLの404、確認tokenなしのidentification→homeを確認。
- 管理者logout、一般login→管理URL直アクセスでhome復帰・管理リンク0、一般logout、guest login→詳細→logoutを確認。認証状態に応じた遷移後に画面が安定し、繰返し遷移や操作不能は観察されなかった。
- 実ブラウザ結果は22項目を保存。これは任意の攻撃パターンの安全性証明や全ブラウザ対応の再認定ではない。最終logoutとviewport override解除済み。

### 証跡・保存

Git除外 `docker/db/backup/frontend-router-v7-p4e-20261030/` に前後manifest/lock/audit、全lock差分、実導入版、初回型検査失敗と最終成功ログ、204件の結果、CSS比較、ブラウザ結果/画像とverification-summary.jsonを保存。Compose環境設定・DB/session・鍵・password・token値は含めない。一時実行先は `/private/tmp/boxing-p4e-router7-20261030/`。検証時点では未コミット。その後ユーザー依頼により本書を含むP4e保存コミットへ保存。元環境未統合、P4全体未完了。

### 後片付け

専用app/frontend/gatewayの3コンテナ、default/devの2ネットワークを削除。導入/監査/checkの一時コンテナも終了済み。volume保持、元web/php/node/dbの稼働継続確認済み。git diff --check成功。専用volume作成元に関するCompose警告は既知で、元環境volumeは利用していない。

## 最終Reviewer

Reviewer subagentが承認範囲・必須型互換1行・候補一致・証跡31ファイルのサイズ/SHA256・204テストとlint/build・CSS一致・ブラウザ22項目・cleanupを確認し、問題なし、必須不備なし。初回型検査失敗と修正後成功を区別済み。ユーザー依頼により本書を含むP4e保存コミットへ保存。元環境未統合、残存24 packagesでP4全体は未完了。

## コミット保存

2026-10-30、ユーザーの「コミットしましょう」により、検証済みの依存更新・必須型互換1行・計画と結果記録を同じ保存コミットへ含める。実装時のcommit対象外指定に対する後続の明示承認。保存前に検証済みsnapshotとの全frontend追跡ファイル一致、manifest/lock/AdminOnlyのhashと成功結果を照合した。元環境統合・push・公開は行わない。
