# P4d-1: 未使用Cypressの削除

> 履歴文書（2026-10-30作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

運用対象外のCypressを削除して導入負担・脆弱依存を整理する。既存Vitest204件とアプリの公開動作を維持する。P4全体の完了とはしない。

## Background / Context

- 2026-10-30 JST、ユーザーが削除範囲・4ケースの自動確認消失・手動画面確認を理解したうえで「削除で進めましょう」と承認。
- 既存専用worktree、codex/frontend-build-update / e3deec3a上で作業。P4cの未コミット差分（Router/uuidと計画）を維持する。新規worktree・branch切替・commit・元環境統合は行わない。
- frontend規約でCypress E2Eは運用対象外。追跡ファイル検索ではCypress参照はpackage/script/config/専用directoryに限定。CIの.githubは存在しない。
- 専用テストは1ファイル4ケース。APIはstubで、実認証・投稿のE2Eではない。PC管理者/一般ユーザーの表示、767/768/769pxの境界、320pxのリンク寸法・はみ出し・一般メニュー位置を確認していた。
- 既存Vitestは権限表示・メニュー・PC/SP状態切替を扱うが、実ブラウザの寸法検証を完全に代替しない。

## Scope

### In Scope

- frontend/package.jsonからdevDependenciesのcypress/@types/cypressとcy scriptを削除。package-lock.jsonから不要となる間接依存だけを整理。
- 次の専用7ファイルをapply_patchで削除。ディレクトリ自体の削除操作は行わない。
  - frontend/cypress.config.ts
  - frontend/cypress/downloads/downloads.html
  - frontend/cypress/e2e/test.cy.ts
  - frontend/cypress/fixtures/example.json
  - frontend/cypress/support/commands.ts
  - frontend/cypress/support/e2e.ts
  - frontend/cypress/tsconfig.json
- 本計画・全体計画の進捗を更新。既存4ケースの手動確認観点を以下に保持。

### Out of Scope

- Chai/Mocha/Jest/MSW等の直接依存削除・更新、旧pnpm lock更新・削除、アプリ・Vitestテスト変更、別E2E導入。
- 元checkout/稼働サービス/実DB/実credential操作、production秘密設定参照、node_modules手編集。

## Impact Area

npm依存導入と開発用cy command、運用対象外のCypressテストに限定。Cypress配下のuuid8.3.2等の間接依存が不要となる見込み。解消数は同条件監査で確認する。

## Options

1. **削除（採用）**: 現在の運用に合わせて導入・監査負担を減らせる。4ケースの自動レイアウト検証は失われる。
2. **更新して維持**: E2Eを継続運用する場合の選択肢だが、現運用とユーザー選択に合わない。
3. **他のE2Eへ移植**: 別ツールの維持・新規テストが増えるため今回は行わない。

## Decision

ユーザー承認済みの案1。実装前にReviewerが本計画を確認する。新しい仕様・追加削除が必要なら再提案する。

## Rationale

現運用ではCypressを使用しておらず、範囲を限定した削除が適切。必要な画面観点を残し、今回は手動確認する。将来ヘッダー変更時もこれらの観点を確認する必要がある。

## Tasks

- [x] 利用箇所・削除対象・既存テストを読み取り確認、ユーザー削除承認取得。
- [x] Reviewer設計確認。必須指摘なし。
- [x] 一時コピーで候補lock解決、前後監査・無関係再解決なし確認。
- [x] 承認済みの依存・専用ファイル削除。
- [x] 専用volumeへ通常npm ci、既存204件・lint/build、手動画面確認。
- [x] 最終Reviewer確認、結果記録、証跡保存、専用環境片付け。

## Test Plan

- P4c適用済みの基点manifest/lockを保存し、Node24.22.1/npm11.19.1で候補を解決。無関係なartifact更新は除外し、peer制約・npm ci再現性を確認。
- 新規専用node_modules volumeでnpm ci。CYPRESS_INSTALL_BINARY等のCypress回避変数は設定しない。監査は同条件・同時点で全依存/omit-devを別実行し、新規指摘と残存経路を確認する。
- 既存Vitest52ファイル204件、lint、型検査を含むproduction build。テスト検出減少・skip追加・assert弱化なし。新規テストを作らない。
- 合成API/専用SQLiteとproduction buildを使用し、PC管理者1024pxの2段ヘッダー・管理リンク4件・padding/sticky offset、PC一般ユーザーの管理導線非表示、767/768/769pxの切替、320pxのリンク44px以上・ラベル/ページはみ出し・一般メニュー開閉/位置を実ブラウザで確認する。
- 削除テストの期待値はPC管理者132px、一般80px、SP管理者126px。現在実装とずれている場合は、P4c基点（src/CSS不変）を照合し、無関係なアプリ修正や期待値変更で隠さない。
- .github等の追跡設定と実ソースにCypress実行経路が残らないことを検索。過去のplan記録と旧pnpm lockには履歴として参照が残る。
- 専用コンテナ/ネットワークだけ片付け、volumeを保持。秘密設定・DB・session・passwordを証跡へ保存しない。

## Risks

- CSS寸法・境界の自動検証を削除するため、Vitest全成功を完全代替とは扱わない。
- npm再解決がMSW/GraphQL等を更新する可能性。直接依存の版維持と間接差分を確認する。
- Cypress削除だけでP4は完了しない。Router、MSW、ESLint/Babel/CSS等の残存を別段階で扱う。
- P4c未コミット差分を巻き戻さない。今回の差分はP4c適用済み基点との比較でも記録する。

## 実装・検証結果（2026-10-30 JST）

- 承認済みのCypress/@types/cypress/cy scriptと専用7ファイルを削除。削除はapply_patchで実施、ディレクトリ削除操作なし。Chai/Mocha/Jest/MSW直接依存・既存Vitest・アプリ・旧pnpm lockは不変。P4cのRouter/uuid差分も維持。
- P4c適用済み基点とのlock意味差分は96エントリ削除、追加0、既存artifact版/解決元/整合性の変更0。5エントリはCypress参照消失に伴うpeerフラグ追加のみ。npmが再解決したGraphQLはP4cの16.12.0エントリ全体へ戻して維持。
- Node24.22.1/npm11.19.1、新規専用volumeへnpm ci --no-audit --no-fundが成功。CYPRESS_INSTALL_BINARY等の回避変数なし。監査は別実行。候補・検証コピー・repoのmanifest/lockは導入前後byte一致。npm11の既存install-scripts/deprecation警告は維持し、包括許可設定は追加しない。
- 実導入からCypress/@types/cypress/@cypress/request/uuidがなくなったことを確認。GraphQL/Router/Chai/Mocha等は維持。
- 既存52ファイル204件全成功、失敗/skip0。P4cのファイル検出一覧と一致。lint、型検査を含むproduction buildも成功。アプリ変更・テスト追加/弱化なし。
- P4cのproduction buildと今回buildのassetsは全ファイル名/SHA256が一致。JS/CSS含め公開配信アセットに変化なし。
- 追跡frontendの実ソース・npm manifest/lockからCypress実行参照が消えたことを検索確認。旧pnpm lockと過去計画の記録は保持。

### 同条件監査

| 条件 | P4c基点 | Cypress削除後 |
| --- | --- | --- |
| 全依存 | 32（critical0/high14/moderate9/low9） | 26（critical0/high11/moderate6/low9） |
| omit-dev | 7（critical0/high2/moderate4/low1） | 7（critical0/high2/moderate4/low1） |

新規脆弱package・直接advisory URLの追加は0。@cypress/request/cypress/extract-zip/qs/tmp/uuidの6 packagesが指摘対象から外れた。Cypress配下に残っていたuuidも解消。これはCVE件数ではない。Router、MSW、ESLint/Babel/CSS関連等が残り、P4全体は未完了。

### 旧4ケースの手動画面確認

合成APIと専用SQLiteの複製（合成ユーザー2・選手24）、production buildをIPv6 loopbackに接続。実データ・外部送信なし。実測結果はbrowser-metrics.jsonと画面画像へ保存。

| 観点 | 実測・結果 |
| --- | --- |
| PC管理者1024px | header132px、管理リンク4、main padding132px、sticky top152px。管理メニュー開閉ボタンなし |
| PC一般ユーザー1024px | header80px、main padding80px、管理導線なし、SP一般メニューボタンなし |
| 境界767/768/769px | header126/132/132px。767はSP、768からPC |
| SP管理者320px | header126px、管理リンク4件は幅63px/高さ56px。ラベルscrollWidth=clientWidth、ページscrollWidth320pxで横はみ出しなし |
| SP一般ページメニュー | 閉→開→閉を実操作。panel top126pxでヘッダー直下、Schedule/Match Result表示 |

一般ユーザーlogoutまで確認、ブラウザの画面幅overrideは解除済み。今後もヘッダーやレスポンシブ表示変更時には同観点の手動確認が必要。Vitestへ機械的に移植せず、新規テストは追加しない。

### 証跡・保存

Git除外 `docker/db/backup/frontend-cypress-removal-p4d-20261030/` に前後manifest/lock/audit、lock意味差分、導入・テスト・lint/buildログ、実版、asset一致比較、ブラウザ実測/画像を保存。Compose設定・DB/session・鍵/passwordは含めない。一時実行先は `/private/tmp/boxing-p4d-cypress-20261030/`。検証時点ではP4c/P4dとも未コミット。その後ユーザーの保存依頼により本書を含むP4c/P4d保存コミットへ保存。元環境未統合。

### 後片付け

専用app/frontend/gatewayの3コンテナとdefault/devの2ネットワークを削除。導入・監査・check用一時コンテナも終了済み。volume保持。元web/php/node/dbは稼働継続。git diff --check成功。専用volumeはdocker runで作成したためComposeに作成元の警告が出たが、名前・対象は確認済みで元volumeは利用していない。

### 最終Reviewer

Reviewer subagentが承認範囲・P4c差分維持・証跡25ファイルのハッシュ・候補一致・204件とlint/build・配信asset一致・手動4ケース・cleanupを確認し、問題なし、必須指摘なし。

### 既存表示課題の区別

320pxの画像では試合編集フォーム内の横スクロール・切れが残っている。旧CypressのdocumentElement.scrollWidth条件は320pxで満たすが、フォーム内部のスクロールまで解消したという結果ではない。P4b時にも既存課題として扱っており、P4c/P4dの配信assetは完全一致。ヘッダーの4リンク寸法・ラベル・メニュー位置の確認と区別し、今回アプリ修正はしない。

### コミット保存

2026-10-30、ユーザーの「コミットよろしく！」により、P4cと本削除を計画・検証結果とまとめて保存。元環境統合・push・Router major移行は行わない。
