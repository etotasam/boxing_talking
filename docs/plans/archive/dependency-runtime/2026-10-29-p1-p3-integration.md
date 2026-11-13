# P1〜P3の元worktree統合・実起動確認

> 履歴文書（2026-10-29作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

> 保存状況（2026-11-02）: 本統合記録と全体計画/P3文書の反映追記を、本書を含む文書保存コミットへ保存する。以下の「未コミット」「未実行」は当時の記録であり、最終結果は末尾を参照する。

## Goal

P3を保存した後、元worktreeの開発ブランチへP1〜P3を統合し、普段のDocker構成と既存開発DBで起動・読み取り動作を確認する。

## Background / Context

状態: **ユーザー承認取得。P3保存・元branchへの統合・実起動・全検証完了。最終Reviewer問題なし。** 2026-10-29 JST。

以下のHEAD/構成は計画作成時の記録。実行後の状態は末尾の統合結果を参照。

- 統合先: `/Users/terashimamasato/learns/my_project/boxing_talking`、branch `codex/laravel-php-upgrade`、HEAD `8aed4bd34012ba2979be311d60d0943b83f82899`。
- 統合元: `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/node-lts-update`。P1/P2保存済み・P3未コミット。
- 統合先にtracked差分なし。未追跡`.codex/environments/environment.toml`を保持し、参照・stageしない。本提案書も承認前に許可されたPlan Documentとして統合先へ作成する。
- `git merge-base --is-ancestor`は成功。P3保存後も分岐がなければfast-forward可能。競合や追加差分が発生した場合は停止して確認する。
- 元php/web/node/dbは稼働中。PHPプロセス一覧にqueue workerはない。固定container名/portを使うため、別worktreeのComposeは起動しない。
- 元Nodeは21.6.1、PHP image内Node16、frontend依存はホストbind mount。P3ではNode24.22.1/npm11.19.1、PHP内Node削除、専用node_modules volumeへ変わる。
- P1はSDK3.401.3/JMESPath2.9.1/filesystem8.1.9、P2はJWT7.2.1。P1〜P3でmigration/DB設定/route/nginx/MySQL定義の差分はない。
- P3の専用検証はbackend172成功・既存skip1/446 assertions、frontend52ファイル204成功、lint/build/Storybook/coverage/UI/導入再起動成功。詳細は統合元の`docs/plans/archive/dependency-runtime/2026-10-29-node-lts-update.md`。

## Scope

### In Scope

- P3の既存8ファイルを保存。提案message: `chore(runtime): Node24への更新と依存導入手順を整備`。
- 元HEAD・image IDと旧code/lock/vendorを保護し、開発DBのconsistent dumpをGit対象外の非公開permissionで保存する。
- 元branchへ`git merge --ff-only codex/node-lts-update`。P1〜P3をまとめて取り込む。
- 元ComposeのPHP/Nodeをbuildし、lockからComposer installとnpm ci。元DBを維持してphp/node/webを再起動する。
- 既存テスト・runtime版・HTTP/ブラウザの読み取り表示・DB保持の確認、計画と結果の更新。

### Out of Scope

P4/P5、MySQL image更新、migration実行、DB初期化/復元、既存ユーザーの変更、投稿/登録/ゲスト作成/ログアウト、queue処理、外部SMTP/AWS、本番反映、pushは含めない。元`.env`/鍵/本番設定は変更せず、`.env.production`は参照しない。統合結果の追加commitはmessageを別途提示する。

## Impact Area

| 領域 | 影響 |
| --- | --- |
| Git | 元branchがP3完了commitへfast-forward。P1/P2も含む。元の未追跡ファイルを保持 |
| 開発サービス | web/php/nodeを一時停止して切り替える。数分以上の停止があり得る。dbは停止・再作成しない |
| backend | lockから既存vendorを更新。env/鍵/storage/既存queueを保持 |
| frontend | Docker専用volumeへ初回npm ci。ホストの既存node_modulesは変更せず保管 |
| DB | 開発DBをsnapshot/dumpで保護。既存行・migration/queueを前後照合。新しいDB変更を適用しない |
| 文書 | 本書へ結果を記録し、全体計画に元環境への反映状態を追記 |

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| 元branchへfast-forward（採用） | ユーザーが使う構成で確認でき、既に検証したcommitをそのまま使用 | 開発サービスの停止・依存入れ替えが必要 |
| 別統合branch/別構成で確認 | 元branchへの変更を保留できる | 専用検証を繰り返すだけになり、今回の元環境確認を満たさない |
| 通常merge commitを作る | 分岐があっても統合可能 | 現状は分岐がなく不要。想定外の履歴変化を取り込まないため採用しない |

## Decision

P3保存後、元branchへfast-forwardする。切り替え前に開発サービスを止め、code/lock/vendor/imageとDBの復旧点を確保する。元Composeは元worktreeからだけ実行し、MySQLに影響する一括`down -v`や全サービスの再buildは使用しない。

## Rationale

P1〜P3の専用検証を維持しつつ、実際のbind mount・named volume・既存開発DBとの接続を確認できる。DB/schema変更がない段階なので、P4/P5へ進む前の統合点にできる。

## Tasks

- [x] 元/作業branch・tracked差分・祖先関係・稼働サービスを確認。
- [x] Reviewer確認・commit messageと統合/一時停止の承認取得（ok! go ahead!!）。
- [x] P3を`a56486426a398e65b01d2f39a3f120c41cce0843`へ保存、source worktree cleanを確認。
- [x] 元HEADとimage IDを記録し、旧imageを復旧用tagで保護。tracked source（env/storage/生成物を除く）と旧vendorを非公開backupへ保存。実際の接続先が元のローカルDBで、APP_ENVがproductionでないことを秘密値を表示せず確認し、不一致なら停止する。
- [x] 元web/php/nodeを停止。DBを稼働させたままconsistent dumpと前後照合用snapshotを保存する。backup失敗時は切り替えない。
- [x] 元branchを`8aed4bd3→a5648642`へff-only統合。元の未追跡ファイルを保持。
- [x] `docker compose build php node`。PHPの一時containerで`composer install`を実行し、既存lockからvendorを更新（updateはしない）。
- [x] 元nodeを停止した状態で`docker compose run --rm --no-deps node npm ci`。新しいvolumeへ導入し、manifest/lock不変を確認。
- [x] MySQLの再起動/再作成を伴わずphp/node/webを起動。Nginxを再作成してPHPの接続先を更新し、healthとruntimeを確認。
- [x] 既存テスト・元URLの読み取り動作・最終DB比較・結果記録・Reviewer確認まで完了。

## Test Plan

- Node24.22.1/npm11.19.1、PHP8.5.12/Laravel13.38.0/Composer2.9.4、SDK/JMESPath/JWT/filesystemのinstalled/lock一致を確認。PHP内node/npm不在とextensions/platform要件も確認する。
- npm ciの前後でpackage.json/補完済みlockのhash一致、node_modulesのmount先が元Compose projectのnamed volumeであることを確認する。
- 元nodeサービスを停止した状態で、統合後の同一Gitソースのenv/生成物なしコピーと、元Composeで実導入した新しい依存volumeを使い、既存frontend全204件・lint/buildを実行する。合成のVITE_APP_API_URL等だけを渡し、Vite buildが元の.env.productionを読まないようにする。必要なheapを一時検証コマンドだけに設定し、通常起動を戻す。実dev起動・ブラウザは元frontendの通常構成で確認する。
- backend全件は、統合後のGitソース/導入済みvendorを専用コピーへ隔離し、合成鍵・SQLite in-memory・array mail/cache/session・sync queue・network noneで実行。元DBを対象にRefreshDatabaseを実行しない。基準172成功・既存skip1/446 assertions。
- 元URL `localhost:3000` / `localhost:8080`でAPI healthと一覧取得のHTTPを確認。ブラウザは専用の新規タブ/セッションで予定・過去一覧・詳細・利用規約等の読み取り表示を確認する。認証操作/投稿/ゲスト/登録/メール送信を今回の確認に追加しない。
- migrationはstatus確認だけとし、履歴と既存データが前後一致することを確認。queueの既存jobs/failed_jobsも件数・内容hashで前後照合し、内容やtokenを出力しない。予期しない既存行の変更があれば自動修復せず停止して報告する。
- secrets入りのenv/鍵/SQL/行内容をチャットやGitへ出力しない。DBdumpはGit除外backupにpermission600、親directory700で保持する。dump認証情報は実行環境から内部で渡し、表示しない。
- 新しいテストは追加しない。P3のStorybook/coverage/UIは既に同一code/imageで検証済みのため、今回の統合では上記の元構成・依存volume・既存DB接続に重点を置く。

## Risks

- 切り替え中の一時停止とnpm ciの追加ダウンロードに時間がかかる。先に旧状態を保護し、導入失敗時に更新後サービスを起動しない。
- Gitのfast-forwardだけではvendor/image/volumeは変わらない。依存導入とruntime実版を確認して初めて統合済みと扱う。
- 旧PHP/Node image ID、旧source/lock/vendor、ホストの旧frontend/node_modulesを保持する。復旧が必要なら更新サービスを停止し、DBをそのまま維持した旧image/保存ソース/vendor/既存env/storageの組を使う検証用overrideで復旧する。旧nodeの自動npm installはoverrideで抑止する。履歴の強制resetやvolume削除は行わず、元branchに戻す操作が必要な場合は具体案を提示する。
- 元.env/鍵は変更しないため、復旧時も同じ元ファイルを使う。backupはtracked sourceとvendorに限定し、本番secret設定を探索・archiveしない。
- Nodeの暫定版・npm/Composer監査の残課題はP3結果どおり残る。ローカル起動確認を本番公開可と扱わない。

## Review / Approval

2026-10-29、Reviewer subagentが本書を評価し、**問題なし・必須修正なし**と確認。停止後のbackup、旧状態保護、ff-only統合、既存queue非処理、隔離テスト、秘密設定の除外、元環境での読み取り検証・復旧方針を確認済み。実際のbackup/統合/テストは未実行。

P3 commit messageと元環境統合・一時停止の承認後に実行し、結果に合わせ更新する。

## 実行途中の記録

- P3保存: `a56486426a398e65b01d2f39a3f120c41cce0843`。作業側clean、元branchへ同commitをfast-forward済み。
- 元環境: APP_ENV=local、DBhostがローカルdbと一致。web/php/nodeを停止し、DBは稼働維持。旧source/vendor/imageを保護。
- Git対象外`docker/db/backup/p1-p3-integration-20261029/`へdump（61040 bytes、permission600）と復旧metadataを保存。env/鍵は変更・archiveしていない。
- 切替前DB: 20 tables、migrations53、jobs3、failed_jobs0。比較は行数/行内容hash/schema hashで実施する。
- Composer install成功。全121 packagesのversion/referenceがlockと一致し、更新4ライブラリのautoload成功。platform/FPM/Node/npm不在確認も成功。
- 元の実vendorをコピーした完全隔離backendは172成功・既存skip1・446 assertions。
- 元named volumeへのnpm ci成功。manifest/lock不変。frontend検証進行中。

## 統合・検証結果（2026-10-29 JST）

**P1〜P3を元branchへ統合し、元Composeで実起動・検証完了。最終Reviewer問題なし。** P3保存commitは`a56486426a398e65b01d2f39a3f120c41cce0843`、両branchのHEADが一致。元の未追跡`.codex/environments/`を保持。

| 確認 | 結果 |
| --- | --- |
| 元runtime | Node24.22.1 / npm11.19.1、PHP8.5.12 / Laravel13.38.0 / Composer2.9.4。PHP内Node/npm不在 |
| Composer | lockからinstall成功。installed全121 packagesのversion/source/dist reference一致、SDK3.401.3/JMESPath2.9.1/JWT7.2.1/filesystem8.1.9のautoload成功 |
| frontend依存 | `boxing_talking_frontend_node_modules`へのnpm ci成功（1776 packages）。実nodeのmount先も一致。ホストの旧node_modulesは変更せず保持 |
| backend全件 | 統合ソースと実vendorを使う隔離Dockerで172成功・既存skip1・446 assertions。元DBへのテストなし |
| frontend全件 | 実導入volumeとenv/生成物なしの同一ソースで52ファイル204成功、lint・build成功 |
| 元HTTP | localhost:8080のhealth・試合一覧・選手一覧が200かつJSON応答 |
| 元ブラウザ | localhost:3000で予定一覧・一覧からの試合詳細・過去一覧・利用規約の描画を確認 |
| データ保持 | 起動後およびブラウザ確認後とも、切り替え前の全20テーブルの行数・行内容hash・schema hashが一致。migration履歴53件を維持、migrate実行なし |
| 既存queue | jobs3 / failed_jobs0、行内容hashも一致。workerの起動・retry・削除なし |
| MySQL | 既存container ID/image IDを維持。再起動・再作成・volume更新なし |

### 確認範囲と補足

- 新規テストやアプリ/設定変更は追加せず、P1〜P3の同一実装を統合した。manifest/lockはinstall/ciで不変。`.env.production`や本番secret設定は参照せず、env/鍵も変更していない。
- 専用IABタブは既存の確認用Integration1022セッションを引き継いだ。ログイン/ログアウト/登録/ゲスト作成/投稿/投票は実行していない。既存行の内容保持は最終DB比較でも確認した。
- ブラウザの詳細表示は現行画面が使う試合一覧データからの経路を確認。補足の`/api/match/222/show`はHTTP200/空本文だった。統合前`8aed4bd3`の同じController.showも空実装で、該当hookはexport/テスト以外の画面呼び出しがない。今回の更新による追加・変更ではなく、JSON詳細APIの成功とは扱わない。
- Composerの既存PSR-4警告、npmの非推奨/allowScripts未指定警告、Browserslist/chunk size/React Router警告は残る。npm ciの監査79 packages（critical7/high32/moderate30/low10）はP3と同じで、P4へ引き継ぐ。Mimeの残課題も全体計画どおり。
- 実SMTP/AWS・実メール/worker・認証の再操作や本番公開は対象外。旧鍵/既存sessionを維持しており、queueも処理していない。
- 旧PHP/Node imageは`boxing-p1-p3-old-php:20261029` / `boxing-p1-p3-old-node:20261029`で保護。DBdump・旧source/vendor archiveは非公開permissionで保存した。保護archiveの内容とSHA-256を検証してからmergeした。
- 元4サービスを稼働状態に戻したまま、テスト用containerのみ片付ける。旧host node_modules、旧images、backupは保持する。

### 保存先とGit状態

Git除外の`docker/db/backup/p1-p3-integration-20261029/`に`result.json`/`manifest.json`、前後DB hash比較、JUnit・各ログ、HTTP概要・browser画像、保護したSQL/source/vendorを保存。SQL/実データ内容や秘密値をGit・チャットに出力していない。

P3コードのcommit/mergeは完了。本統合計画・結果と全体計画/P3文書への反映追記は、元worktreeで未コミットとして残す。追加保存はmessageを提示してから行う。P4へ自動着手せず、本番反映もしない。

## 最終確認

2026-10-29、Reviewerがruntime/依存整合、全テスト、DB/queue保持と安全な証跡27件を照合し、**問題なし・必須不備なし**と確認。テスト用containerを除去し、元web/php/node/dbを稼働状態で維持。結果文書以外のtracked差分なし。新規テスト・追加機能・P4/P5・本番反映には着手していない。
