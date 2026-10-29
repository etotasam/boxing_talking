# P4b: frontend build・テスト基盤とStorybookの更新計画・結果

## Goal

P4aで残ったbuild/test依存のcritical指摘を解消し、既存の開発起動・production build・204件のテスト・Storybookの4ストーリーを維持する。アプリの機能仕様は変更しない。

## Background / Context

初回作成2026-10-29 JST。状態: **調査・一時コピーで候補解決/監査済み、Reviewer設計確認済み（必須指摘なし）。具体案の実装承認取得。実装・検証完了、最終Reviewer確認完了（必須指摘なし）。本書を含むP4b完了コミットへ保存済み・元環境未統合。**

- 同じ作業worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking` を使用。P4a保存 `a3c14326` から `git switch -c codex/frontend-build-update` で専用branchを作成済み。
- 元worktree/Compose/DB/未コミット文書には触れない。P4aは元側に未統合。
- 当初はStorybookを現状維持する方針だった。Storybook7とサポート中Viteのpeer範囲が交わらない事実を説明し、ユーザーが **「Storybookも更新する案を調査する」** を選択。当時は調査の承認。その後、具体版・変更範囲を提示しgo aheadで実装承認を取得。Storybook削除は採用しない。
- Node24.22.1/npm11.19.1は維持。基点の全依存監査を同条件で再取得し72 packages（critical7/high26/moderate29/low10）。件数はCVEの個数ではない。

### 制約とcriticalの経路

| 対象 | 現在の経路・制約 | 対応方針 |
| --- | --- | --- |
| vitest / @vitest/ui / coverage-v8 | Vitest1.6.1。UIの直接advisoryとtinypool由来の指摘が親にも伝播 | 同じ版のVitest4/UI/coverageを組で更新 |
| tinypool | Vitest1→^0.8.3。3.2.7でも^1.1.1で修正2.1.2を許容しない | tinypoolを使用しないVitest4系列を候補とする。強制overrideしない |
| tar | Storybook7 CLI→giget→tar^6.2.1。critical修正は7.5.19以降、他advisoryは7.5.21以降 | Storybook本体の更新で旧経路を除去/更新。tarだけ7系へ無理にoverrideしない |
| proxy-addr | Storybook7→express→~2.0.7。修正版2.0.8は範囲内 | 本体更新後の経路・残存を照合し、残れば最小patch解決 |
| handlebars | Storybook7 core-commonとts-jestから入る。現4.7.8、修正候補4.7.10 | Storybook更新だけで消えるとは断定しない。ts-jest側も残れば許容範囲内patch更新 |

- Storybook7.6.21のreact-vite/builder-viteはVite^3/4/5対応。Vite公式の保守対象は8.3、7.3、6.4等で、5系は対象外。現状維持とサポート中Viteへの更新をそのまま両立できない。
- Vitest公式の保守対象は5.0と4.1。3.2.7はUIの直接advisoryの修正版だが、保守外かつtinypoolが残るため中間到達点には採用しない。
- Storybookは4 CSF3ファイルだけ。通常Composeはnpm run devで起動しStorybookを自動起動しない。Vitestの対象はsrc/**/*.test.(tsx|ts)。Play関数、storiesOf、MDX、Storyshotsは利用されていない。型import、preview/main、ESLint推奨設定が依存点。

### 公開情報

- [Vite保守対象](https://vite.dev/releases)、[Vitest保守対象](https://vitest.dev/releases)。2026-10-29確認。
- [Vitest4移行](https://v4.vitest.dev/guide/migration)、[Vitest5移行](https://vitest.dev/guide/migration/)。Vitest4でもcoverage/worker/mockに互換変更あり。
- [Storybook7→8](https://storybook.js.org/docs/8/migration-guide)、[8→9](https://storybook.js.org/docs/releases/migration-guide-from-older-version)、[9→10](https://storybook.js.org/docs/releases/migration-guide)。各段階の破壊的変更を照合する。自動upgradeを無条件実行しない。
- [Vitest UI advisory](https://github.com/advisories/GHSA-5xrq-8626-4rwp)、[Tinypool advisory](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)、[tar advisory](https://github.com/advisories/GHSA-23hp-3jrh-7fpw)。監査のseverityとアプリからの悪用可能性を混同せず、現在の利用状況も記録する。

## Scope

### In Scope

| 直接依存 | 現lock | 候補lock |
| --- | --- | --- |
| vite | 4.5.14 | 7.3.7 |
| vitest / @vitest/ui / @vitest/coverage-v8 | 1.6.1 | 4.1.12に統一 |
| storybook / @storybook/react / @storybook/react-vite / @storybook/addon-links | 7.6.21 | 10.6.5に統一 |
| @storybook/addon-onboarding | 1.0.11 | 10.6.5 |
| eslint-plugin-storybook | 0.6.15 | 10.6.5 |
| @storybook/addon-docs | 旧essentials経由 | 10.6.5を直接指定 |
| @testing-library/user-event（lockのみ） | 14.6.1 | 14.6.8（Storybook10が^14.6.3を要求） |
| handlebars（間接） | 4.7.8 | 4.7.10（ts-jest経路に残るため同系列patch） |

- @storybook/addon-essentials / addon-interactions / blocks / testの旧直接指定を整理。essentials/interactionsはcoreへ統合、Docsはaddon-docsに分離、blocks/testは新import経路へ統合済み。未使用の旧直接指定を残して7/8系を混在させない。4ストーリー自体は維持する。
- manifest/lockと必須の間接依存、Storybook設定、Vite/Vitestの最小互換設定、必要な既存テストの型/API互換調整、計画/実績文書。
- 直接3件（Axios/Lodash/PostCSS）のP4a版を維持。@vitejs/plugin-react4.7.0はVite7をpeerで許容するため原則据え置き。vite-tsconfig-paths4.3.2、TypeScript5.9.3、jsdom24.1.3、React18系も据え置き。解決が予定外に広がる場合は再提案。

### Out of Scope

Storybook削除・新ストーリー追加・addon-vitestやBrowser Modeの新規導入・Chromatic連携、アプリ/認証/API/CSSの機能変更、React/Tailwind/Router/uuid主更新、TS7/ESLint9移行、Cypressの新規利用、Node/PHP/Composer/MySQL変更、元環境統合・本番設定/外部SMTP/AWS、push。実装検証後、ユーザーの別依頼によりコミット保存。

## Impact Area

- frontend/package.json、package-lock.json、vite.config.ts、vitest.config.mjs、.storybook/main.ts、必要に応じpreview.tsと既存4 storiesのimport/型、.eslintrc.cjs、既存テストの最小互換調整。
- 本番bundleと開発HMR、JS/CSS変換、alias/env読込み、テストのmock/cleanup・coverage対象範囲、Storybook Docs/Controls/Actions/4プレビュー。
- 環境変数は追加しない。新設定値や検証手順を追加する場合は対応README/開発文書も更新する。元Composeは変更しない。

## Options

| 案 | 利点 | 欠点・判断 |
| --- | --- | --- |
| Storybook7維持、Vite5/Vitest3まで | Storybook移行を避ける | 保守対象外とcritical経路が残るため不採用 |
| Storybook削除、Vite/Vitest更新 | 利用の少ない依存を減らせる | ユーザーは更新案の調査を選択したため不採用 |
| Storybook10 + Vite7 + Vitest4（提案） | 既存Storybookを維持し保守対象に移行。Vite7はRollup/esbuild経路を維持、Vitest4はtinypoolを除去 | 複数majorの互換検証が必要。解決/監査で具体範囲を確定してから承認依頼 |
| 最新Vite8 + Vitest5 + Storybook10 | 最新機能/修正まで反映 | ViteのRolldown移行とVitest5追加既定値変更も重なる。今回の限定security更新では避ける |

## Decision

Vite7.3.7 / Vitest4.1.12組 / Storybook10.6.5組を採用候補とする。一時コピーの通常npm解決と採用候補のnpm ci dry-runは成功。監査のcriticalは7→0、新規脆弱package/直接advisory URLは0。lock差分と前後監査を確認済み。設計レビュー後に具体案を提示し、go aheadで実装承認を取得して採用。

## Rationale

Node24は各候補のenginesを満たし、候補同士のpeer範囲も交わる。Vite7/Vitest4は公式保守対象で、旧式へ据え置く妥協と最新major固有の追加変換変更の両方を避ける。Storybookはユーザーの最新選択に沿って存続させる。

## Tasks

- [x] P4a保存commitからP4b専用branch作成。
- [x] 実利用/critical経路・公式情報・registryのengines/peerを調査。
- [x] Storybook現状維持の制約を説明し、更新案の調査方針を確認。
- [x] 一時コピーで候補解決、必須間接依存・前後監査とlock差分を確定。
- [x] Reviewerによる設計評価。peer制約・GraphQL維持・監査・coverage/target/全4 stories/隔離方針に必須指摘なし。
- [x] ユーザーへ具体版/変更範囲を提示、go aheadにより実装承認を取得。
- [x] 承認範囲の実装・全検証を完了。VoteIconは基点と同じ既存エラー。
- [x] 最終レビューと結果記録。必須指摘なし。その後、ユーザーの依頼により本書を含むP4b完了コミットへ保存。元環境統合は別依頼。

## Test Plan

- Node24.22.1/npm11.19.1の独立Compose/new依存volumeとenv/秘密情報/生成物なしソースコピーを使用。元DB・サービス・依存volumeに操作しない。合成Laravel/SQLite・mail=array/sync queueを使い、外部送信しない。
- 実npm ci、導入前後manifest/lock hash、実installed版、同条件の全依存/omit-dev auditを確認。critical7の各経路を照合し、新規指摘・残存を説明する。audit fix --force、legacy-peer-deps、監査ignore、互換未確認overrideは使わない。
- 既存52ファイル204件を維持して全Vitestを実行。新規テストは原則不要。移行に必要な既存テスト/型の最小調整は保証内容を維持し、skip追加・assert弱化・検出対象縮小で通さない。
- coverageはVitest4のall削除に対応しsrcの対象を明示する。基点coverage-final.jsonの200ファイル（stories4を含む）との対象差分を記録し、未テストのアプリファイルを黙って落とさない。AST remapping変更により割合が変わる可能性があるため、数値一致だけで合否を決めない。HTML/JSON等のレポート生成とVitest UI起動/結果表示も確認。
- lint・TypeScript/production build、npm run devの起動とHMRを確認。Vite7でbuild.target既定値が上がるため、Vite4の旧target（es2020/edge88/firefox78/chrome87/safari14）を明示して既存の変換対象を維持する。新たにこれらの実ブラウザを全て試験したとは扱わない。CSS targetも基点の解決値を照合し、既定値変更で表示対象を黙って狭めない。
- production buildを合成APIへ接続し、一覧/詳細・login/logout・フォーム成功/失敗・PC/SP・CSSを基点buildと比較。Cookieはport分離されないため元localhost/前段127.0.0.1と別のIPv6 [::1]、host-only/独自session名と事前空cookie確認を維持。CORS/CSRF無効化やCookie値/tokenの記録をしない。既存SP試合編集overflowは基点にもあるため別課題のまま。
- Storybookの7→8→9→10の変更一覧を確認し、mainのdocs.autodocsを削除して現tagsを維持、統合addonを置き換える。build成功に加え4ストーリー全てと既存Docs/Controlsをloopbackブラウザで確認。必要なActions表示も確かめ、新機能を追加しない。更新前の4ストーリーにも同じ検証を行い、既存のprovider不足等を更新起因と混同しない。既存課題の機能修正が必要なら別提案とする。
- 大きいbuild/coverageを直列化してメモリを制限。実行後は専用container/networkのみ片付け、元側の4サービス・DB・未コミット差分を保持。ログ/前後監査/lock差分/画像はGit除外の証跡置き場にも保存する。

## Risks

- 旧lockに新manifestを重ねる単純installと更新対象を明示したinstallは、一時コピーで旧Storybook7 peerとのERESOLVEとなった。強制突破せず、通常npm操作で旧ツールの参照を整理して新組を解決する段階方式で候補解決に成功した。最終lock以外を実環境で使わず、差分と再現導入を確認する。
- peer/engines適合とpackage-lock-only成功だけでは動作互換を保証できない。実npm ci/全検証の結果は末尾を参照。
- Storybook10はESM専用。現frontendはtype=moduleかつmain.tsはESMだが、ESLint8/CJS設定から新pluginを読めるかも確認する。
- tar経路がStorybook更新で消えても、handlebars等は別ツールが保持する可能性。criticalゼロを監査前に断言しない。他のhigh以下の対象は次の小段階へ残る。
- P4全体は未完了。Router/uuid、CSS系、未使用Cypress周辺等は別の候補照合が必要。削除や無関係更新を暗黙に混ぜない。


## Investigation Evidence

- 調査用コピーは `/private/tmp/boxing-p4b-20261029/`。調査時点では実リポジトリは未変更。その後、承認範囲を適用。
- 旧ツール群をnpm uninstall --package-lock-onlyで一時コピーから外し、その後更新対象を指定してnpm install --package-lock-onlyした段階解決は成功した。最終成果物だけを実装候補とし、途中のツール不足状態を実環境へ適用しない。
- 更新対象以外の直接アプリ依存の実lock版は全て不変。Storybookのuser-event下限が既存14.6.1を許さないため、共有の直接dev依存user-eventは14.6.8へ解決する（manifest範囲内）。
- 初期候補ではMSWだけが使うGraphQLも16.12.0→16.14.2へ再解決された。無関係なので、採用候補の当該lockエントリは基点のversion/resolved/integrityへ戻した。MSWの^16.8.1を満たし、依存関係の追加変更なし。通常npm installは再更新するため、採用lockは再解決せずnpm ciで検証する。採用manifest/lockのhashとdry-run結果を記録し、実導入時にも整合を再確認する。
- 最小候補は1890→1340 lockエントリ。共通パスのartifact更新119、新規101、削除651。旧Storybook/Vitestツリーの除去・配置変更と新しい必須依存を含む。全件はminimal-diff.jsonで追跡する。件数はnpm導入件数や脆弱件数と別。
- 採用候補のnpm ci dry-runはexit0（1221 packagesの予定）。manifest/lockのhashは前後一致。実導入・既存テスト・build・実ブラウザは未実施で、実装承認後に行う。


### 採用候補の監査結果

| 条件 | 基点 | 採用候補 |
| --- | --- | --- |
| 全依存 | 72（critical7/high26/moderate29/low10） | 33（critical0/high14/moderate10/low9） |
| omit-dev | 12（critical0/high4/moderate7/low1） | 9（critical0/high2/moderate6/low1） |

- 同じNode24.22.1/npm11.19.1のpackage-lock-only条件。基点のcritical7 packagesは全て監査対象から外れ、新規の脆弱package・新規直接advisory URLは0。これは既存33件も解消した、またはアプリを実際に動作確認したという意味ではない。
- 残存対象にはRouter/uuid、babel/eslint関連、Tailwind配下やCypress等の開発依存がある。具体名と差はaudit-comparison.jsonを参照。P4bで無断に一括更新しない。
- registry・前後監査・解決ログ・最小候補manifest/lock・hash・全lock差分はGit除外 `docker/db/backup/frontend-build-p4b-20261029/` にも保存済み。依存解決失敗のログも残し、成功した手順と区別する。

## Reviewer Result

### 設計レビュー（実装前）

2026-10-29、Reviewer subagentが具体版のpeer条件、最小候補のlock差分とGraphQL維持、critical7→0/新規指摘なし、検証方針を確認し、必須指摘なし。複数majorの実動互換性は未検証であり、具体案の承認後に実npm ci・全検証を行う。


## 実装・検証結果（2026-10-29）

- 承認済みcandidate-minimalを適用し、新規専用volumeで実npm ci成功（1221導入/1222監査）。候補・作業worktree・導入コピーのmanifest/lockは前後byte一致。実installed版も候補と一致。GraphQL16.12.0と直接アプリ依存の版は維持。
- 実npm ciの監査も33件（critical0/high14/moderate10/low9）。同じlockのomit-devは9件。候補の前後比較で新規脆弱package/advisory URLなし。
- 新lintに合わせ、4 storiesとpreviewの型importをframework側へ移行。実アプリ・既存テスト本体は変更なし。旧Viteと更新後Viteの実target/cssTarget/minify/cssMinifyは一致。
- Storybook8以降の型解析既定値変更によりButtonのstyleNameが文字列Controlになったため、main.tsで旧版と同じreact-docgen-typescriptを明示。既存7選択肢を復帰し、Docsでloginへ変更→defaultへ復元する実操作を確認。READMEにも設定理由を追記。

### テスト・build・coverage

- 既存52ファイル204件が全件成功。新規テスト・既存テスト変更・skip追加・assert弱化なし。lint、TypeScript/production build、Storybook静的buildが成功。旧型解析を維持した最終Storybook buildも成功（検証時約4分）。
- coverageはstatement50.83%、branch42.15%、function52.61%、line51.79%。AST remapping等の変更があり、割合の一致を合格条件にはしない。
- 基点の200ファイルはsrc197件とrootのpostcss.config.js/svgTransform.js/tailwind.config.tsの3件。新includeでroot設定3件が外れ、statement/function/branch mapが全て0の型・宣言10件が加わり207件となった。基点src197件は全て残り、アプリ対象の脱落0。4 storiesも含む。差分はcoverage-inventory-comparison.jsonへ保存。
- Vitest UIは非TTYの--uiだけだと実行後に終了したため、検証起動で--watchを明示。52ファイル204成功・Fail0のdashboardを実ブラウザ確認/保存。非対話coverageでJUnit・HTML/JSON reportも生成。READMEにUI継続起動方法を補足。
- 既存依存のdeprecation/allowScripts、Browserslistのデータ経過、chunkサイズ等の警告あり。無関係な更新や警告抑制では回避していない。

### 実ブラウザと基点比較

- macOSで127.0.0.2へのbindが利用できず、IPv6 loopbackへ変更。frontendはhttp://[::1]:13005、APIはhttp://[::1]:18085、Storybookは16065、UIは15126。元localhost・前段127.0.0.1とCookieを共有しない。認証前Cookie名が空配列であることを実ブラウザ確認。
- 合成Laravel/専用SQLite、管理者1・選手2・試合2、host-only/p4b_session、array mail/sync queue。APP/JWT鍵も合成だけ。初期の合成JWTファイル不足は検証用鍵で解消し、実鍵は参照しない。元DB・実ユーザー・実メール・外部AWSは使わない。
- Cookie/CSRFなしの保護POSTは419。正確なIPv6 OriginでCORS許可を確認。login誤passwordは401と失敗通知、正常loginは200。選手名/試合会場はPATCH200、初期値復元・成功通知・他属性/件数保持を確認。未入力フォームは既存の「未入力・未選択の項目があります」通知。logoutは200とログイン画面への復帰。
- 認証/変更POST・PATCHはCookie/X-XSRF-TOKEN存在を値なしログで確認。CORS/CSRF無効化や共有Cookie削除なし。
- 同一API/合成データで基点production buildとPC1280×720/SP390×844表示を比較。CSS差はメディアクエリの空白正規化2箇所のみ。SP試合編集の横はみ出しは基点と同じ既存課題で修正しない。
- npm run dev、alias/envを通した実API取得を確認。検証コピーのFooter文言だけを一時変更し、再読み込みなしでHMR反映→復元。repoのFooterは不変、コピーもbyte一致へ戻した。最後はproduction bundle（index-853t8-e7.js）に戻してlogout。画面幅の一時指定も解除。
- Storybookは双方とも4既存ストーリーを比較。Button/PredictionVoteModal/ToastModalは表示成功、Docs/Controls/Actions/Interactionsを確認。VoteIconは双方ともRecoilRoot不足エラーで、更新起因とは扱わず修正しない。初回型解析中のserver timeout通知はコンパイル後の再読込みでは消え、その後Controls操作と各プレビューを確認。新play関数やaddon-vitestは追加しない。

### 証跡・保存

- ログ・前後監査・候補manifest/lock/hash・JUnit/coverage・CSS/対象ファイル差・合成DB結果・ブラウザ画像はGit除外docker/db/backup/frontend-build-p4b-20261029に保存。合成DB本体/session/鍵/環境設定/credential helperは含めず、HTTPログのqueryも伏せる。
- 専用container9件/network2件の終了・削除を完了。全volumeは保持。元web/php/node/dbは稼働継続、元DB・依存volume・未コミット文書も保持。最終Reviewer確認も完了、必須指摘なし。
- ユーザーのコミット依頼により、依存更新・互換設定・README・本書と全体planをcodex/frontend-build-updateの本書を含むP4b完了コミットへ保存。元環境未統合。P4全体も未完了で、残る33件は次の具体案で段階対応。push・branch追加切替・元環境mergeは行わない。

### 最終レビュー（2026-10-29）

Reviewerが承認候補との一致、204件の全成功、coverage対象維持、旧target、実通信・HMR・UI・Storybook、後片付けと証跡333件を照合し、必須の不備・未実施項目なしと確認。Controls復帰とVoteIconの既存エラーの区別も確認済み。レビュー時点では未コミットであり、その後ユーザー依頼で保存。残存監査33件と元環境未統合を継続課題とする。
