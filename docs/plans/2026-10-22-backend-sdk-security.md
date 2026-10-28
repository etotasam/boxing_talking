# P1 AWS SDK / JMESPath セキュリティ更新提案

## Goal

AWS SDK / JMESPath の既知3 advisoriesを解消し、Laravel13/PHP8.5統合時の公開動作を維持する。2026-10-29にユーザーが範囲を限定して実装開始を承認。対象はJMESPath・AWS SDKとSDK必須間接依存の更新、更新後の既存backendテスト実行まで。新規テスト・SES補足検証・SDK/JMESPath smoke・コミット・P2以降は今回実施しない。以下はこの承認範囲に合わせて更新した計画。

## Background / Context

2026-10-22 JST確認。

- 作業先: `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。既存worktreeを継続使用する。
- branch: `codex/backend-sdk-security`、HEAD: `8aed4bd34012ba2979be311d60d0943b83f82899`。調査開始時clean。
- Serena初期指示、作業先AGENTS.md、backend規約、planner/reviewer/tester/backend-testスキルを確認済み。
- [次期全体計画](2026-10-22-dependency-runtime-update.md)の順序はP0→P1→P2→P3→P4→P5→P6。P0統合・旧worktree削除・次期worktree作成は引き継ぎ情報により完了。全体計画と[統合結果](2026-10-22-laravel-php-integration-result.md)末尾の旧worktree処理待ち記述は過去時点の記録であり、再実行しない。
- 統合結果基準: PHP8.5.12 / Laravel13.38.0 / Composer2.9.4、120 packages、backend171識別子=170成功/既存1skip/440 assertions。今回は全件テストを再実行していない。
- 元Composeのweb/php/node/dbは稼働中。元checkout・既存DB・既存jobsへ変更しない。

### 現在の監査と候補

Docker内`composer audit --locked --format=json`で4 advisories / 3 packagesを確認。監査exit 1は既知脆弱性の検出によるもの。

| 対象 | 現在 | 提案するlock版 | 監査・制約 |
| --- | --- | --- | --- |
| mtdowling/jmespath.php | 2.8.0 | 2.9.1 | GHSA-pcw8-m77r-2528 / CVE-2026-54133 / critical、修正版>=2.9.1 |
| aws/aws-sdk-php | 3.336.2 | 3.401.3 | GHSA-27qh-8cxx-2cr5 / highは>=3.371.4で修正、CVE-2025-14761 / mediumは>=3.368.0で監査対象外 |
| symfony/filesystem | 未導入 | v8.1.9（新規間接依存） | SDK更新に必要。直接依存には追加しない |
| firebase/php-jwt | v6.10.2 | 維持 | GHSA-2x45-7fc3-mxwq / lowをP2へ残す |

3.401.3は照会時の公式latestリリース。Composer metadataのsource/dist referenceは`7b8541e8a4f09cf4375eeef4de6c638dfb2dadbb`、PHP要件は`>=8.1`、JMESPath要件は`^2.9.1`。3.371.4と3.401.3の両案を実Dockerでdry-runし、どちらも既存2更新+必須1追加、削除0、監査残りJWT1件となった。最小修正版でも追加依存を避けられない。

### 利用経路と到達条件

- 独自app/routes/bootstrap/testsにはAws/JmesPathの直接呼出し、CloudFront署名、S3EncryptionClient、式の外部入力、CompilerRuntime / JP_PHP_COMPILEの指定は見つからない。
- `MailSendJob::handle()`はJWTを生成し`Mail::to()->send(new Mailer(...))`を実行する。`config/mail.php`の既定mailerは`ses`であり、LaravelのSES transportからSDKへの経路がある。既存MailSendJobTestはMail fake・送信例外mockであり、SES transport通過を保証していない。
- S3 disk、SQS connection、DynamoDB cache、SESの設定定義がある。S3用`league/flysystem-aws-s3-v3`はlockにない。独自Storage呼出しはなく、CSV出力はローカルfile操作。設定定義だけで実利用とは判断しない。
- JMESPathのcriticalは、攻撃者が式を制御しCompilerRuntime（またはJP_PHP_COMPILE）を利用する条件が必要。データ文書だけでは成立せず、既定AstRuntimeとは区別する。
- CloudFront advisoryは署名policyへの特殊文字入力、S3 advisoryはclient-side encryptionのinstruction file等の条件を持つ。アプリの攻撃経路が実証されたという意味ではない。
- `.env.production`、秘密env、キャッシュ済み設定、JWT秘密鍵は参照していない。運用環境でSES/SQS等が実際に選択されるかは未確認。ソース上の調査と運用未確認を区別する。

## Scope

### In Scope

- JMESPath→SDKの順に、具体版指定で部分更新する。最終lockは上表の2更新+1追加を予定。
- Composer整合、既存backendテスト全件、監査比較、実装後Reviewerによる差分確認。
- 本計画内に実行結果を記録する。アプリ・テスト・設定・READMEの変更は予定しない。

### Out of Scope

- P2以降、JWT/鍵/期限/リンク仕様変更、Laravel/PHP/Node/MySQL更新、frontend変更、新機能、AWS driverの追加・切替。
- 依存削除、監査ignore/無効化、vendor手編集、無関係なpackage更新、既存運用設定の参照・変更。
- 元Compose起動/停止/再build、元DB初期化、既存queue処理、外部AWS/SMTP/S3、push・deploy。
- 新規・既存テストコードの追加/変更、SES補足検証、SDK/JMESPath smoke、commit。必要な将来のcommitは別途git-commitスキルに従い承認を得る。

## Impact Area

| ファイル/領域 | 予定 |
| --- | --- |
| backend/composer.lock | 2更新+symfony/filesystem追加。既存の他package版/source/dist referenceを維持 |
| backend/composer.json | 現制約`aws ^3.281`で解決可能なので原則変更不要。JMESPath等を直接依存にしない |
| backend/tests | 変更せず既存テストを実行 |
| docs/plans/2026-10-22-backend-sdk-security.md | 承認範囲と更新・既存テスト結果 |
| app/routes/config/DB/frontend/Docker管理ファイル | 仕様変更は予定しない。検証用Composeは一時領域へ分離 |

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| A: JMESPath2.9.1 + SDK3.371.4 | 既知監査を解消する最小SDK版 | それ以降の修正が入らない。symfony/filesystem追加は必要 |
| B: JMESPath2.9.1 + SDK3.401.3（採用） | 確認した安定版の修正を含み、部分更新で既存package差分数はAと同じ | SDK内部/APIモデルの変更幅はAより広い。既存backend回帰を実施し、SES実経路は未検証として残す |
| C: SDK削除またはComposer全更新 | 削除なら依存削減、全更新なら他監査も同時対応の可能性 | SES既定経路を壊すおそれ、またはJWT等の別段階を混在。今回不採用 |

## Decision

案Bを採用し、先にJMESPath2.9.1単独、次にSDK3.401.3と必須間接依存symfony/filesystem v8.1.9を更新する。各更新の差分を確認し、両方の更新後に既存backendテストを全件実行して今回の作業を終了する。

## Rationale

criticalを先に解消でき、Laravel/JWT/Nette/Guzzle等を巻き込まずに更新可能。最小SDK案でも新規依存は同じであるため、検証した安定版の修正を含む案を選ぶ。SESを使用可能な既存メール動作は維持し、未利用のCloudFront/S3機能をアプリに新設しない。

## Tasks

- [x] branch/HEAD/clean、全体計画、規約、監査、利用経路を確認。
- [x] 読取専用のcomposer.json/lockコピーを使い、JMESPath単独とSDK候補2案のdry-runを実施。
- [x] Reviewerが設計確認し、SQLite隔離指摘を反映。
- [x] ユーザーが新規テスト・SES補足検証なしに範囲を限定し、2026-10-29に作業開始を承認。
- [x] 同じworktree/branch/HEADと既存差分を確認し、隔離コピーを準備。
- [x] JMESPath2.9.1、SDK3.401.3、必須symfony/filesystem v8.1.9へ部分更新し、予定外のpackage/reference変更がないことを確認。
- [x] Composer validate/platform/install整合と監査を確認。
- [x] Reviewerが承認範囲と依存差分を確認し、更新後の既存backendテスト全件を実行して結果を報告。
- [x] 本計画に結果を記録して今回の作業を終了。commit・P2以降は行わない。

### 隔離方法と実行手順

- 調査dry-runは`/private/tmp/boxing-p1-proposal`へcomposer.json/lockだけコピーしread-only mount。元PHP image ID `sha256:7febb7d0d059da0fb379d40633c0adc8ce2e4dafc6044a9a38e802bf8ccdc457`から使い捨てコンテナを起動。元コンテナexec・元backend/vendor/env/DB mountは使っていない。scripts/plugins/installは無効でlockは変更されない。
- 承認後は一時領域の専用Composeを明示的な`-f`と専用project名で使う。元Composeをextends/includeせず、container_name・公開port・db service・元データvolumeを持たないPHP検証serviceとする。同じPHP image IDを利用する。
- PHP検証serviceはworktreeのGit管理ソースを一時領域へコピーして使用し、.env/既存storage/bootstrap cache/vendorは持ち込まない。vendor/storage/cacheは専用の書込領域、frontendソースは同worktreeからread-onlyで参照する。共有依存の削除・再構築をしない。
- DBは既存の`testing`接続を使い、コンテナenvで`DB_CONNECTION=testing` / `DB_TEST_DATABASE=:memory:`を指定し、`DATABASE_URL`を渡さない。既存`sqlite`接続は`database.sqlite`パス固定で`DB_DATABASE=:memory:`だけでは隔離できないため使わない。`database.sqlite`自体もコピーしない。phpunit.xmlの非force既定値よりコンテナenvを優先させ、テスト開始前に同じenvで実効接続名`testing`・driver`sqlite`・database`:memory:`を照合し、不一致なら実行を止める。
- 合成APP_KEY/JWT鍵、array cache/session/mail、sync queueを固定し、IMDSを禁止する。新規SESテストや補足検証は実施しない。
- Composerの取得・監査時だけ必要なnetworkを与え、テスト時PHPはnetwork none。元DB/SMTP/S3へ到達できない構成とする。
- 更新コマンドの核は`composer update mtdowling/jmespath.php:2.9.1 --minimal-changes --no-install --no-scripts --no-plugins --no-interaction`、次に`composer update aws/aws-sdk-php:3.401.3 --with=symfony/filesystem:8.1.9 --minimal-changes --no-install --no-scripts --no-plugins --no-interaction`。新規間接依存も承認時の版へ制約し、別の最新版に自動変更しない。隔離コピーで生成したlockを検証し、承認範囲との一致確認後にworktreeへ反映する。lockのみの更新に応じた通常のinstall/scriptsも隔離コピーで確認する。
- 候補版/追加packageが再解決で変わる場合は実装を広げず再提案する。予定外のファイル変更、テスト脱落、監査悪化、必須失敗、Reviewer重大指摘があれば停止する。
- 証跡は非秘密のComposer出力、監査JSON、package/ref差分、テスト結果/識別子を本計画に要約する。永続証跡は必要に応じ作業先のGit除外backup配下へ保存し、/tmpだけを最終成果物にしない。

## Test Plan

tester/backend-testスキルの実行規約に従い、メインが既存テストを実行する。新規テストの追加・既存テストの変更はしない。Worker/Tester/Explorer/Planner subagentは使用せず、Reviewerだけ必須subagentとして差分を確認する。

1. Composer: validate --strict、check-platform-reqs、lockからinstallとinstall --dry-run、installed/lock全件一致、全packageの版/source/dist reference比較。既存120件→最終121件を想定し、更新対象以外のreference変化も拒否する。
2. 監査: 開始4件/3packages→最終JWT1件/1packageを想定。元の3対象ID消失と新規悪化なしを確認する。JWT残件のためaudit exit 1は想定し、audit全成功とは記載しない。
3. 全backend: 専用Composeの`exec -T php php artisan test`を両依存の更新後に実行。既存171識別子・170成功/既存1skip/440 assertionsと実測を比較する。frontend参照不足による追加skipは許容しない。
4. 実装後Reviewerが依存差分と承認範囲を確認し、最後に既存backendテストを実行して報告する。frontend/runtime/DBの変更がないためfrontend全件・元環境ブラウザ・DB移行は行わない。
5. 既存メールテストはSDK手前のfake/mockであり、SES transport通過や実サービス疎通は保証しない。ユーザー指定により追加のSES mock・smoke検証も行わず、今回の未確認範囲として明記する。

## Risks

- SDK新版が入力・endpoint等の検証を強化している。今回の既存テストはSES transportや実サービス接続を保証しない。本番SES/SMTP等の設定・疎通は別承認の運用確認として残す。
- SES選択可能なことと、現在の元envでSESを利用していることは同義ではない。秘密設定を読まず、今回SESを明示的に選択する検証も行わない。
- 新規symfony/filesystemはSDK必須依存であり例外的な無関係更新ではない。PHP/Laravelや既存Symfony群が動くことをplatformと全回帰で確認する。
- 監査は配信時点に依存する。実装開始時に再照会し、承認版の新規脆弱性や予定外依存を認めた場合は停止する。
- 復旧点はHEAD `8aed4bd...`と旧composer.lock。元環境は変更しないためP1検証失敗時のDB復元は不要。作業中の他差分をgit reset等で破棄せず、P1対象lockだけを確認して戻す。
- worktreeは通常の書込許可root外であるため、提案文書の保存にもファイルシステム承認が必要。管理ツールの所有制限が出た場合は迂回せず報告する。

## References

- [次期全体計画](2026-10-22-dependency-runtime-update.md)、[統合結果](2026-10-22-laravel-php-integration-result.md)、[S9結果](2026-10-22-laravel-php-s9-result.md)
- [JMESPath advisory](https://github.com/jmespath/jmespath.php/security/advisories/GHSA-pcw8-m77r-2528)
- [CloudFront advisory](https://github.com/aws/aws-sdk-php/security/advisories/GHSA-27qh-8cxx-2cr5)
- [AWS S3 Encryption bulletin](https://aws.amazon.com/security/security-bulletins/AWS-2025-032/)
- [SDK3.401.3 release](https://github.com/aws/aws-sdk-php/releases/tag/3.401.3)
- [SDK3.371.4 requirements](https://github.com/aws/aws-sdk-php/blob/3.371.4/composer.json)
- [AWS MockHandler](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_handlers-and-middleware.html)

## Review

2026-10-22、Reviewer subagentが全体計画・実装・既存テストと照合。SQLite接続の隔離方法を具体化する指摘を受け、既存`testing`接続と`DB_TEST_DATABASE=:memory:`、DATABASE_URL未設定、実効config確認・不一致時停止、database.sqlite持込禁止を追記した。Reviewerはこの修正方針で指摘解消、他の必須指摘なしと確認した。

2026-10-29のユーザー指定により、新規テスト・SES補足検証を取り下げ、依存更新後の既存テスト実行までに限定した。残リスクはSES transport・本番AWS driver選択・実サービス疎通が未確認であること。実装差分のReviewer確認と既存backendテスト結果は完了時に追記する。


## Execution Result (2026-10-29)

今回の承認範囲の作業は完了。新規テスト・SES補足検証・smoke・コミット・P2以降は未実施。

- 作業worktree/branchは上記指定のまま、HEADは`8aed4bd34012ba2979be311d60d0943b83f82899`を維持。
- JMESPath `2.8.0 → 2.9.1`、AWS SDK `3.336.2 → 3.401.3`、SDK必須間接依存としてsymfony/filesystem `v8.1.9`追加。120→121 packages。その他118 packagesの全オブジェクトとlockのその他フィールドは同一。
- `composer.json`、アプリ、既存テスト、設定、frontend、Docker管理ファイルは未変更。Git差分は`backend/composer.lock`と本計画だけ。
- Composer通常install（scripts含む）、validate --strict、check-platform-reqs、install --dry-run成功。installed/lockの121件の版・source・dist一致をReviewerが確認。既存PSR-4配置警告2件はそのまま。
- 監査は開始4 advisories / 3 packagesから、JWT `PKSA-y2cr-5h3j-g3ys`（low）1件だけに減少。SDK/JMESPathの3対象は解消、新規悪化なし。JWT残存によりaudit exit 1であり、監査全成功ではない。
- 既存backend全件: **171識別子、170成功・既存skip 1、440 assertions、失敗/エラー0**。skipは`Tests.Unit.BoxerTitleSnapshotUpdateTest::testSetUp`。新規テスト・テストコード変更なし。
- テストは専用Compose project `boxing-p1-20261029`、PHP8.5.12 image、network none、`testing`/SQLite memory、array cache/session/mail、sync queueで実行。frontendの参照も用意し追加skipなし。
- 初回テストは全171件検出・失敗なしだったが、隔離コピーに.envがなく`file_get_contents`警告が発生した。元envは参照せず、隔離コピーに空の.envを新規作成。実効configを再確認して既存全件を再実行し、警告なしの上記結果となった。通常の.envや既存DB/秘密鍵をコピーしたものではない。
- Reviewerの実装差分評価は「問題なし、必須修正なし」。ユーザー指定によりSES transport・実AWS疎通は未確認であり、既存テストだけで保証できる範囲に限る。
- 元Compose/元checkout/既存DB/既存jobs/元vendorには変更なし。検証用PHPと専用networkは確認後に終了し、元サービスは維持する。
- 非秘密の検証証跡はこのworktreeのGit除外`docker/db/backup/backend-sdk-security-20261029/`へ保存。Composer出力、before/after監査、package差分、既存テストログ・JUnit・結果JSONを保存し、/tmpだけを最終証跡にしない。env・SQL・storage・資格情報は保存対象に含めない。
