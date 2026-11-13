# P4c: React Router・未使用uuid直接依存の整理

> 履歴文書（2026-10-30作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

P4bの公開動作を維持し、React Routerを6系の修正版へ更新し、未使用のuuid直接依存を整理する。P4cはP4全体の一部であり、本段階だけでP4完了とはしない。

## Background / Context

- 2026-10-30 JST調査。作業先は既存の `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。新規worktreeは作らない。
- 初回確認時はclean、`codex/frontend-dependency-security` / `a3c14326`。ユーザー承認後、同じworktreeで既存 `codex/frontend-build-update` / `e3deec3a` へ切替済み。
- P4a/P4bは実装・検証・保存済み、元環境未統合。P4bの監査基準は全依存33（critical0/high14/moderate10/low9）、omit-dev9。これは脆弱と判定されたpackage数で、CVE件数ではない。
- App.tsxはBrowserRouter、main.tsxはcreateRoot。検索・ページングはpathnameからURLを組み立てる。SSR/hydrationは利用しない。
- P4bの追跡frontend全体を検索し、uuid参照はpackage.jsonとlockのみ。現npm lockではrootとCypress配下の@cypress/requestがuuid本体に依存する。MSWからuuid本体への経路はない。
- 本日の公式registry照会: react-router-dom/react-routerの6系最新は6.30.6、必須@remix-run/routerは1.23.4。React >=16.8、Node >=14で現在のReact18/Node24を許容。
- 公式npm bulk audit APIへ対象4packagesの公開版番号のみ照会済み。調査時点では全体auditの再実行と候補lockの解決・動作検証は未実施だった。実施結果は末尾を参照。

## Scope

### In Scope

- react-router-dom 6.30.3→6.30.6、必須react-router 6.30.6/@remix-run/router 1.23.4。
- 未使用の直接uuid 9.0.1と@types/uuid 9.0.8をmanifestから除去し、npm lockを整合させる。
- 変更候補はfrontend/package.json、frontend/package-lock.json、本計画・全体計画の進捗記録。manifestのRouter下限を^6.30.6にする。
- 承認後に隔離した依存解決・導入・関連検証を行う。無関係な再解決は差分で検出し除外する。

### Out of Scope

- Router major移行、Cypress/MSW/ESLint/Babel/CSS依存の更新・削除、旧pnpm-lock.yamlの更新・削除。
- アプリ仕様、認証・API・DB・URL構造の変更、新規テストの機械的追加。
- 元checkout/稼働サービス/DB/依存volumeの操作、秘密設定参照、コミット、統合、公開。

## Impact Area

- Routerを使う一覧・詳細・検索・ページング・管理画面・ヘッダー・認証後遷移と、MemoryRouter等を使う既存テスト。
- uuidの削除は直接依存のみ。Cypress→@cypress/request→uuid8.3.2の経路は残す。型の暗黙参照の有無は型検査で確認する。

## Options

1. **6系の修正更新＋未使用直接依存削除（推奨）**: 変更を限定して互換性を確認できる。ただしRouter/uuidの指摘は全解消しない。
2. **Router7.18以降への移行も同時実施**: 残存指摘への対応候補だが、major移行の互換性・future flags・React/Node制約と遷移動作の追加調査が必要。別段階で具体案を提示する。
3. **uuidを修正版へ更新して保持**: 11.1.1以降等に修正があるが、未使用の直接依存を残しmajor変更も増えるため採用しない。Cypress配下も解消しない。

## Decision

案1を実装候補とする。2026-10-30、ユーザーが「OK それで進めよう」と実装を承認。承認範囲で実装・検証する。

## Rationale

現在のBrowserRouter構成を維持し、6系で可能な修正を先に適用する。未使用依存は更新して存続させる必要がない。監査の解消と利用形態による非該当を区別し、残る指摘をP4の継続対象として明示する。

## Tasks

- [x] 両checkoutのAGENTS、frontend規約、P4b計画・lock・利用箇所を読み取り調査。
- [x] cleanを再確認し、承認済みの既存P4bブランチへ切替。
- [x] 公式情報・registry・対象package監査APIを照合。
- [x] 本計画をReviewer subagentが評価。必須修正なし。
- [x] 具体範囲・残存指摘を提示し、依存更新・削除の実装承認を取得。
- [x] 隔離コピーで候補lockを解決し、直接/間接差分と同条件auditを確認。
- [x] 承認範囲の実装・再現導入・既存検証・画面確認。
- [x] Reviewer差分確認、関連テスト実行、結果・P4進捗を記録。

## Test Plan

- 既存Node24/npm11の条件を使用し、元環境とは別の依存領域・実行環境でnpm ci。候補と導入前後のmanifest/lockを照合。
- 同時点・同条件の全依存/omit-dev auditでpackage/advisory/経路を比較。残存・追加を明示し、audit fix --force、互換未確認override、ignoreは使わない。
- 既存52ファイル204テスト、lint、型検査を含むproduction buildを実行。検出減少・skip追加・assert弱化で合格にしない。
- 主要画面遷移、直接URL・reload、戻る/進む、検索条件・ページング保持、一般ユーザーの管理URL拒否、認証後遷移を隔離環境で確認。通常操作とコロン/バックスラッシュ等の特殊な入力を区別する。期待する内部遷移を維持し、意図しない外部originへの遷移が起きないことを確認する。
- まず既存テストで確認。保証不足やアプリ変更の必要が判明した場合は追加対応を提案する。
- 本段階ではStorybook設定を変更しない。依存差分で影響が判明した場合は関連build確認を追加する。

## Risks

- GHSA-jjmj-jmhj-qwj2は6.30.6で修正。GHSA-2j2x-hqr9-3h42は候補版で範囲外、かつ公式説明上BrowserRouterは非該当。
- GHSA-wrjc-x8rr-h8h6（react-router >=6.0.0 <7.18.0）は候補でも監査範囲内。外部遷移の問題であり、BrowserRouterだけを理由に非該当としない。6系限定更新でRouter対応完了としない。
- GHSA-337j-9hxr-rhxg（>=6.4.0 <7.18.0）は監査上残り得る。公式説明ではDeclarative Modeは非該当。現構成の非該当判断とaudit残存は別記する。
- uuid指摘GHSA-w5hq-g745-h8pqはCypress側8.3.2で残る。直接依存削除だけでuuid対応完了としない。
- navigateの外部URLに関する修正で挙動が変わり得る。内部遷移・検索の組立箇所を確認する。
- 計画作成時は候補lock未作成のため減少package数・新規指摘ゼロ・実動互換性は未確定だった。実施結果は末尾を参照。

## P4全体の残作業

- P4a: 完了・保存済み・元環境未統合。
- P4b: 完了・保存済み・元環境未統合。
- P4c: 実装・既存検証・画面確認完了。ユーザー依頼により本書を含むP4c/P4d保存コミットへ保存。元環境未統合。最終Reviewer問題なし・専用環境の後片付けも完了。結果は末尾に記録。
- 次段階: 未使用Cypress/@types/cypressとts-jest/@types/jestの用途・型参照・scriptを確認して整理案を提示。利用中のjest-dom/vitestは維持する。
- 次段階: 利用中MSWの移行、ESLint/TypeScript/Babel、Tailwind配下等の間接依存を調査し、それぞれ具体版と検証を提案する。
- 次段階: Routerの残存指摘に対して7.18以降の移行候補と互換性を調査する。
- P4完了判断: 全残存経路について修正・不要依存除去または根拠付きの扱いを整理し、最終監査・再現導入・既存動作検証とReviewer確認を完了する。未解消指摘を無断で許容して完了扱いにしない。元環境への統合は別途承認する。

## References

- [全体計画](../../2026-10-22-dependency-runtime-update.md)
- [P4b結果](2026-10-29-frontend-build-update.md)
- https://reactrouter.com/6.30.6/start/changelog
- https://github.com/remix-run/react-router/security/advisories/GHSA-jjmj-jmhj-qwj2
- https://github.com/remix-run/react-router/security/advisories/GHSA-2j2x-hqr9-3h42
- https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6
- https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg
- https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq

## Reviewer Result

2026-10-30、Reviewer subagentが本計画を確認し、必須修正なし。具体版・削除範囲・残存指摘・P4完了条件・検証方針は妥当。任意提案の特殊入力の合格条件を追記した。設計レビュー時点では候補lockと実動互換性は未検証だった。その後、ユーザーの実装承認を取得して末尾の検証を実施。

## 実装・検証結果（2026-10-30 JST）

- 承認範囲を適用。manifestはRouter下限^6.30.6、uuid/@types/uuid直接依存の削除のみ。lockの意味差分はroot、Router関連3件、uuid本体と型定義の削除の6エントリ。アプリ・既存テスト・旧pnpm lockは変更なし。
- npm解決時に無関係に再解決されたGraphQL16.14.2は、P4bの16.12.0のエントリ全体へ戻して維持。候補・検証コピー・repoのmanifest/lockはbyte一致。導入後も不変。
- Node24.22.1/npm11.19.1、新規専用node_modules volumeへのnpm ci成功、1219 packages導入。実版と直接uuid/@types/uuid不在、Cypress側uuid8.3.2残存を確認。
- 導入条件の制約: 最初の通常npm ciはCypress13.17.0のLinux ARMアプリ本体ダウンロードに失敗。検証環境のみCYPRESS_INSTALL_BINARY=0で再実行。監査メタデータ応答が遅かったため導入と監査を分離し、最終導入はnpm ci --no-audit --no-fundで成功。Cypress E2Eは規約上対象外。通常導入時のCypress binary取得成功を保証する結果ではない。repoに当該環境変数やscript許可設定は追加していない。
- 初回は通信なしのbuild用コンテナで導入を開始したため停止して通信可能な専用コンテナへ変更。試行ログを成功ログと区別。最終npm11の既存install-scripts/deprecation警告あり。包括的script承認は行っていない。
- 既存52ファイル204テスト全成功、fail/skip0。新規テスト・assert弱化・検出縮小なし。lint、型検査を含むproduction build成功。Router future flags、Browserslist、chunk size等の既存系警告は抑制せず保持。

### 同条件監査

| 条件 | P4b基点 | P4c |
| --- | --- | --- |
| 全依存 | 33（critical0/high14/moderate10/low9） | 32（critical0/high14/moderate9/low9） |
| omit-dev | 9（critical0/high2/moderate6/low1） | 7（critical0/high2/moderate4/low1） |

- 新規脆弱package・新規直接advisory URLは0。全依存から@remix-run/routerの指摘が外れ、2j2x/jjmjのadvisoryが解消。uuidはCypress側で残るため全依存のpackage数からは外れない。omit-devでは直接uuid削除により当該指摘も外れる。
- Routerのwrjc/337は残存。SSR非利用という利用形態の評価と、監査上の残存を分けて扱う。P4全体は未完了。

### 実ブラウザ

- 本番buildをIPv6 loopback frontend13005/API18085へ接続。前段の合成SQLiteを別の専用ファイルへ複製し、合成ユーザー2・選手24を使用。接続先SQLiteの実パス、mail=arrayを確認後にfixtureを準備。外部送信・実DB利用なし。
- 管理者login、一覧→試合詳細、詳細URLのreload、戻る/進む、管理画面表示、名前検索、条件保持したpage2の最終7件、戻るで検索条件復帰を確認。httpsとバックスラッシュを含む検索も内部originに留まる。これは任意の攻撃入力に対する脆弱性全解消の証明ではない。
- 管理者logout後、一般ユーザーでlogin。管理URLへ直接アクセスするとhomeへ戻り、管理リンクが表示されないことを確認。過去試合の空一覧、一般ユーザーlogout→login画面も確認。
- 一時gatewayは内部ネットワークだけではポートがpublishされず、前段と同じ専用default/devの組合せでloopbackのみpublishして解決。初回接続エラーのタブは使用せず、新規タブで検証。

### 証跡

Git除外 `docker/db/backup/frontend-router-uuid-p4c-20261030/` に前後manifest/lock/audit、全lock差分、導入・テスト・lint/buildログ、実版、ブラウザ結果/画像とverification-summary.jsonを保存。Compose環境設定・合成DB/session/鍵・パスワードは証跡へ含めない。一時実行環境は `/private/tmp/boxing-p4c-20261030/`。コミット・元環境統合は未実施。

### 後片付け

専用app/frontend/gatewayの3コンテナとdefault/devの2ネットワークを削除。導入・監査・check用の一時コンテナも終了済み。volumeは保持。元web/php/node/dbの4サービスは稼働継続を確認。秘密設定・元checkout・元DBには操作していない。git diff --check成功。

### 最終Reviewer

Reviewer subagentが差分・検証結果・計画/全体進捗・導入制約・残存指摘・証跡27ファイルのサイズ/SHA256・候補との一致・cleanupを照合し、問題なし、必須修正なしと確認。レビュー時点では未コミット。その後ユーザー依頼により本書を含むP4c/P4d保存コミットへ保存。元環境未統合、P4全体未完了。

### コミット保存

2026-10-30、ユーザーの「コミットよろしく！」により、P4cと未使用Cypress削除を計画・結果記録とともに同じ保存コミットへ含める。実装時のコミット対象外というScope指定に対する後続の明示承認。7系移行はまだ実装していない。
