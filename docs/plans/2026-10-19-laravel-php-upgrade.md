# Laravel / PHP の段階的アップグレード計画

## Goal

Laravel 8系 / PHP 8.2のアプリを、既存の振る舞いとデータを維持しながらLaravel 13系 / PHP 8.5へ更新する。
**1回の実行は1ステージのみとし、各ステージで実装・検証・レビュー・結果報告を完結させ、次のステージへ自動で進まない。**

## Background / Context

- 作成日: 2026-10-19（日本時間）。本書は実装承認前の提案書。今回行う変更は本書の作成・更新のみ。
- `backend/composer.lock`: Laravel 8.83.29、Sanctum 2.15.1、PHPUnit 9.6.22、Carbon 2.72.5。実行環境の導入済み版とは限らないためS0で照合する。
- `docker/php/dockerfile`: `php:8.2-fpm`。PHPのパッチ版、導入拡張、Composer実行版、本番PHPは未確認。
- Laravel 8の公式PHP対応範囲は8.1まで。現状の8.2との組み合わせは既存状態として記録し、警告や失敗をアップグレード起因と混同しない。8.1へのダウングレードは本計画に含めない。
- `docker-compose.yml`: Nginx / PHP-FPM / MySQL 8.0.21 / Vite開発サーバー。MySQLデータはホストの `docker/db/my_data` に永続化される。
- `backend/phpunit.xml`: SQLiteインメモリDBを指定するが、S0で実際の接続設定はファイルDBを直接参照していると判明。arrayセッション / メール、syncキューを使用。ブラウザのCookie、実SMTP、非同期ワーカー、MySQLの挙動はこのテストだけでは保証できない。
- `backend/app/Http/Kernel.php`: Fruitcake CORS、Sanctum、独自CORS、Cookie・セッション処理を登録。`config/auth.php` は通常ユーザーとゲストのセッション認証を分けている。
- 仮登録メールは `MailSendJob`、ゲスト削除は `app/Console/Kernel.php` の日次スケジュールを使用。
- 計画作成時点では依存更新・実行環境変更・テスト実行は行っていない。パッチ版は各ステージ開始時に公式情報と依存解決結果で決め、実際の版をlockファイルと実行記録へ残す。

## Scope

### In Scope

- Laravelを8→9→10→11→12→13と1メジャーずつ更新する。
- PHPを8.2→8.3→8.4→8.5と1マイナーずつ更新する。LaravelとPHPの主更新を同一ステージに混在させない。
- 各段階に必須の依存パッケージ、設定、互換性修正、テスト修正、READMEの更新。
- 既存テストの不足を補う振る舞いテスト、ブラウザと隔離MySQL環境での回帰確認。
- 各段階の承認・停止条件、再開情報、復旧手順を記録する。

### Out of Scope

- 本番デプロイ、AWS構成・CI/CDの変更、本番DBへの接続・マイグレーション。
- React / Vite / Node / MySQLの主バージョン更新、新機能、API仕様変更、大規模リファクタリング。
- Laravel新規アプリのディレクトリ構成への全面移植、starter kitの導入、認証方式の変更。
- 中間版の本番公開。サポート終了版は隔離した開発・検証環境でのみ通過する。

## Impact Area

| 領域 | 対象・確認内容 |
| --- | --- |
| 依存関係 | `backend/composer.json` / `composer.lock`、Sanctum / Ignition / Collision / PHPUnit / ULID / DBAL / Carbon等 |
| PHP実行環境 | `docker/php/dockerfile`、`docker/php/env/php.ini`、必要時のみComposeの検証用設定 |
| 認証・API | `app/Http/Kernel.php`、`app/Http/Middleware/`、`config/auth.php` / `sanctum.php` / `cors.php` / `session.php`、独自例外レスポンス |
| DB | `database/migrations/` の `change()`、Eloquent・Repository、SQLiteとMySQLの差 |
| メール・定期処理 | `app/Mail/Mailer.php`、`app/Jobs/MailSendJob.php`、`app/Console/Kernel.php`、ゲスト削除コマンド |
| テスト | `backend/tests/`、`backend/phpunit.xml`、SQLiteドライバ、テスト検出・警告・件数 |
| フロントとの接続 | Cookie・CSRF・HTTPステータス・JSON形式を維持。`frontend/src/api/axios.ts` は原則変更せず、互換性修正が必要なら先に提案する |
| 文書 | 本書、導入手順・設定を変更した段階のREADME |

## Options

| 案 | メリット | デメリット・リスク |
| --- | --- | --- |
| A: Laravel 13 / PHP 8.5へ一括更新 | 中間版だけに必要な対応を減らせる | 依存・認証・DB・PHPの問題が同時に出て切り分けにくい。1回で全更新しないという要件を満たさない |
| B: 各Laravel / PHP更新を別の実行に分ける | 問題を起こした段階を特定しやすく、確認してから再開できる | 中間版の依存解決と検証にも手間がかかる |
| C: PHP 8.5へ先に更新し、その後Laravelを順に更新 | PHP更新を先に済ませられる | 古いLaravel・依存が新PHPに対応しないため、切り分けが難しい |

## Decision

案Bを採用する。全体計画の承認と、各ステージの開始承認は分ける。

### 実行単位と停止ルール

1. 開始時に指定ステージID、現在の版、前段階の検証結果、今回の変更範囲を確認し、提案・承認を得る。「計画を承認する」だけで全ステージの連続実行を許可されたものとしない。
2. 1回の依頼・実行では指定した1ステージだけを扱う。必要な互換性修正と関連パッケージ更新はそのステージに含める。
3. 実装後はReviewer subagentのレビューを受け、必要な修正後に関連テストを実行し、結果を報告して終了する。次段階には、ユーザーからそのステージを開始する指示を受けてから着手する。
4. 失敗・検証不能・未解決の重大な指摘があれば次へ進まない。同じステージの修正として再開する。仕様変更や対象外の環境変更が必要なら、理由と案を本書に追記して承認を得る。
5. 必須確認の未実施を「成功」と扱わない。ユーザーによる手動確認待ちなら、その項目と次に必要な操作を明記して保留する。
6. 調査・設計・実装・テストは原則メインエージェントが担当。ReviewerはAGENTS.mdに従いsubagentを利用する。その他の役割をsubagentに委譲する場合は、担当・理由・追加コストを示して事前承認を得る。
7. ステージごとに今回分だけを独立したコミットとして保存する方針とし、実際のコミットはユーザーの承認済み範囲でのみ行う。未承認なら変更を保持してコミット待ちとし、実行記録に状態を残す。自動pushや本番反映は行わない。

### ステージ一覧

全行をそれぞれ別の依頼・実行で進める。チェックは実際に完了条件を満たしてから付ける。

| ID | その実行で行うこと | 終了時のLaravel / PHP | 特に確認すること |
| --- | --- | --- | --- |
| S0 | 現状の棚卸し・基準テスト。主バージョン変更なし | 8 / 8.2（実版を照合） | 実行環境・テスト検出数・既存の失敗・警告・隔離検証環境 |
| S1 | Laravel 8→9 | 9 / 8.2 | Ignition、CORS、Symfony Mailer、Flysystem、認証 |
| S2 | Laravel 9→10 | 10 / 8.2 | Sanctum 3系、Monolog、PHPUnit 10系とXML・テスト検出 |
| S3 | PHP 8.2→8.3 | 10 / 8.3 | PHP拡張・設定、Composerの実PHP要件、ビルド再現性 |
| S4 | Laravel 10→11 | 11 / 8.3 | Sanctum 4系、マイグレーション公開状況、`change()`、認証設定 |
| S5 | Laravel 11→12 | 12 / 8.3 | Carbon 3、PHPUnit 11系、日時・コンテナ解決の変更 |
| S6 | Laravel 12→13 | 13 / 8.3 | リクエスト偽造防止、PHPUnit 12系、セッション・キャッシュ設定 |
| S7 | PHP 8.3→8.4 | 13 / 8.4 | 暗黙nullable引数を明示、依存を含む非推奨警告 |
| S8 | PHP 8.4→8.5 | 13 / 8.5 | PHP 8.5の互換性、拡張・周辺パッケージの対応 |
| S9 | 最終統合検証・引き継ぎ。主バージョン変更なし | 13 / 8.5 | lockからの再構築、MySQL移行、実HTTP認証・メール・キュー、残リスク |

- Laravel 10はPHP 8.3をサポートし、Laravel 13はPHP 8.3以上が必要なため、S3を途中に置く。
- 表中のPHPUnitは段階的な目標。Collision等を含め各版の公式ガイド・依存制約で実際の版を決め、未使用のPest / Boost等をガイドにあるという理由だけで導入しない。
- PHP更新時はLaravelの版を固定する。依存に修正が必要な場合は必要最小限の更新を記録し、Laravelの次メジャー更新で解決しない。
- 中間版が配布・Composerのセキュリティ制約等で解決不能なら、そのステージで停止する。セキュリティ検査を無断で無効化したり、`--ignore-platform-reqs` で通過させたりしない。通過方法を再提案する。

## Rationale

Cookie認証・複数guard・独自ミドルウェア・メールジョブ・履歴マイグレーションを持つため、更新の原因を追える単位を優先する。
LaravelとPHPを同時に上げず、動作する組み合わせを確認地点として残す。中間版は公開せず、最終環境への移行可否はS9で判断する。

## Tasks

### 今回の計画作成

- [x] 既存設定・テスト配置・公式ガイドを確認して本書を作成する。
- [x] Reviewer subagentで設計レビューし、必要な指摘を反映する。
- [x] ユーザーへ計画を提示する。実装は開始しない。

### S0: 現状確認（2026-10-20完了）

- [x] `git status` と現在のHEADを記録し、既存差分を保護する。計画作成時の未追跡 `.codex/environments/` は対象外。
- [x] Docker内のPHP / Laravel / Composer / 拡張 / SQLiteの実版を取得し、lockと照合する。本番の秘密情報は参照しない。
- [x] 現在のlockで依存が揃っているか確認する。導入済み依存と異なる場合は、再現方法を示してから対応する。
- [x] バックエンド全テストと検出されたテスト一覧・件数・assertion数・警告・失敗を記録する。既存失敗の修正は別途提案し、基準が確立するまでS1を始めない。
- [x] フロントの既存テスト・ビルド・lintの基準結果と、ブラウザでの主要フローを記録する。
- [x] MySQL検証用のDB名・接続先・隔離方式を決める。既存DBと別の使い捨てDB・保存先を用意する必要があれば、変更内容を提案する。
- [x] 初期データ入り検証DBのバックアップ・復元を確認する。破壊的な検証は既存開発DBで行わない。
- [x] 既存のテスト不足（実HTTP認証、メールhandle処理、ゲスト削除等）を記録し、補強するステージを特定する。

### S1〜S8: 各更新の共通手順（実行のたびに1ステージのみ）

- [ ] 対象ステージの公式ガイド・パッケージ対応・前段階記録を読み、具体的な変更対象と完了条件を提示して承認を得る。
- [ ] 前段階のコード・lock・PHPイメージ・検証DBバックアップで復元できることを確認する。
- [ ] 対象主バージョンと必須依存・設定を更新する。独自のAPI形式、guard、ID生成方式、権限条件は維持する。
- [ ] 実行PHPで依存要件を確認し、`composer.json` と `composer.lock` の整合性・更新差分を確認する。全依存の無差別な更新は避ける。
- [ ] 対応が必要な公開動作のテストを追加・更新する。期待値を現在の誤動作へ合わせて通過させない。
- [ ] 後述の共通確認と、そのステージ固有の確認を実施する。
- [ ] Reviewer subagentが差分・仕様・検証漏れを確認する。指摘への修正後に関連テストを再実行する。
- [ ] 本書の実行記録へ版・結果・未実施理由・復旧情報を追記し、報告して停止する。

### ステージ固有の作業

- S1: `facade/ignition`の置換、Fruitcake依存と参照の移行、メール・ファイル操作基盤の変更を確認。`rorecek/laravel-ulid`のコード・設定・自動検出での利用有無を確認し、将来の障害として記録する。
- S2: Sanctum 2→3の設定・必要DB差分を確認。PHPUnit 10へ移行する際にXMLと検出方法を更新し、`@test`だけで検出されるメソッドも将来の12系で失われない形（`test`接頭辞または対応属性）へ移す。実行対象の減少を確認する。
- S3: PHPイメージ再構築。SQLite / PDO MySQL等の実際の拡張、iniの読み込み、Composer要件を確認。PHPイメージはパッチ版とOS系統、可能ならdigestも記録し、Composerも実版を残す。Dockerfile内のNode 16導入がビルドを妨げた場合、Nodeの更新を混在させず別途提案する。
- S4: Sanctum 4の設定キー・ミドルウェア・トークンテーブルの既存マイグレーションを照合し、二重作成しない。`rorecek/laravel-ulid`のlock版はLaravel 10までの制約なので、必要ならこの段階までに削除・代替を提案する（未使用と確認せず削除しない）。`change()`の属性保持、DBAL依存、SQLite最小版を確認。既存Kernel / Provider構成は必要な修正にとどめる。
- S5: Carbon 3の日時・タイムゾーン・日次削除の境界条件を確認。PHPUnit 11の非推奨事項を解消し、12系への検出漏れを防ぐ。
- S6: Laravel 13のCSRF / 送信元検証を実HTTPで確認。HTTP/HTTPS、same-origin / same-site / cross-site、トークン有無・正否別の期待値を開始時に整理する。標準の送信元検証を採用するか、現行のトークン必須条件を維持する必要があるかは、既存仕様と実際のミドルウェア構成を調べて提案・承認を得る。既存VerifyCsrfToken参照とSanctum設定の適用関係、セッション名・キャッシュ接頭辞・保存内容の互換性を確認。PHPUnit 12への移行後にテスト一覧を比較する。
- S7: `Throwable $previous = null`、`int $organizationId = null`などをnullable明示に変更。宣言元インターフェースも合わせ、引数の意味を変えない。依存由来の警告は対応版を調べる。
- S8: PHP 8.5の移行ガイドにある非互換・非推奨・拡張変更を実利用箇所に照合する。必要な依存更新を限定し、全テストとブラウザ操作を再確認する。

### S9: 最終確認（開始承認待ち）

- [ ] 最終lockと記録したPHP / Composerで隔離環境を再構築し、依存の再現性を確認する。
- [ ] 全自動テスト、実HTTP主要フロー、隔離MySQLの新規構築・既存相当データ移行、メール・非同期キュー・日次処理を確認する。
- [ ] 対応期限・依存のセキュリティ監査結果・既存からの警告を再確認する。未解決の重大な問題があれば公開可能とは判定しない。
- [ ] README、最終構成、復旧方法、残課題と別途必要なデプロイ作業をまとめ、完了報告する。

## Test Plan

### 各ステージの共通完了条件

- Docker内の実版が予定の組み合わせになっており、依存のプラットフォーム要件を満たす。
- バックエンド全テストに新規の失敗・未説明の警告がない。既存失敗はS0で解消または扱いを明示して承認を得る。検出テストの一覧・件数とassertion数を比較し、減少は個別の理由を説明する（重複削除等があっても単に同じ件数に合わせない）。
- 認証・認可・入力検証・APIステータス・JSON形状・主要なDB状態を維持する。
- ブラウザで通常ログイン/ログアウト、ゲストログイン/ログアウト、管理者と一般ユーザーの権限、一覧・詳細、コメント投稿・削除、投票、仮登録→確認→本登録を確認する。テストデータを使い、実利用者へメールを送らない。
- Reviewerの重大な指摘が未解決でない。未実施の必須項目があれば保留し、次へ進まない。

### 自動テストとコマンド

PHP / artisan / PHPUnit / ComposerはすべてDockerのPHPサービス内で実行する。以下は後日の実行例であり、本書作成時には実行しない。

```sh
docker compose exec php php -v
docker compose exec php php -m
docker compose exec php php artisan --version
docker compose exec php composer --version
docker compose exec php composer validate
docker compose exec php composer check-platform-reqs
docker compose exec php php artisan test
docker compose exec php php artisan schedule:list
```

- テスト検出一覧は導入済みPHPUnitの対応オプションでDocker経由で取得する。テストが0件になることや、`@test`メソッドだけが消えることを見逃さない。
- `tests/Feature/AuthController/`、`MiddlewareTest/`、Boxer / Match / Comment / Prediction関連と `tests/Unit/` を対象とする。
- `MailSendJobTest`は現在主にキュー投入を検証するため、S1でジョブ処理とメール内容・失敗時の仮登録データ状態のテスト不足を補う。実SMTP送信と非同期処理の確認は別途必要。
- S4ではカラム型・nullable・default・index等を期待スキーマと比較し、S5ではゲスト削除対象の日付境界を検証する。
- フロントは `frontend/` で `npm test -- --run`、`npm run build`、`npm run lint`。S0とS9で実行し、中間段階ではAPI契約・認証へ影響する変更時に関連Vitestを実行する。Cypressは使用しない。
- 更新段階の警告を一括抑制して通過させない。必要な修正が範囲外なら停止して提案する。

### SQLite / MySQL / 実HTTPの補完

- SQLiteテストを維持したうえで、S0で決めた隔離MySQL環境に限り検証する。`RefreshDatabase`やfresh相当の操作を既存開発DBへ向けない。DB名と接続先を実行前に確認する。
- 各Laravel更新（S1 / S2 / S4 / S5 / S6）で、新規DBに全履歴を適用するケースと、前段階の検証データ入りDBへ未適用分だけを適用するケースを確認する。S3 / S7 / S8でもMySQL接続と主要な読み書きを確認する。S9で両DBケースを総合確認する。
- 適用済み履歴マイグレーションを再実行して既存DBを修正しない。スキーマ修正が必要なら理由とデータ影響を示し、前方の新規マイグレーションを提案する。
- LaravelのFeature TestではCSRFが省略される場合がある。S1 / S2 / S4では実HTTPでCSRF取得→Cookie付き更新、トークン検証が必要な経路での欠落/不正時の拒否、セッション継続、CORSを確認する。成功させるためにCSRFを無効化しない。
- S6ではLaravel 13の標準動作を一律に「トークン欠落なら拒否」と判定しない。標準設定ではHTTPSのsame-origin判定に成功するとトークン検証を省略し、それ以外はトークン検証へフォールバックする。認証・認可の判定は別途維持する。S6で承認した期待値に基づき、送信元・トークンの組み合わせを検証する。
- 現ComposeはHTTPなので、S6までに本番構成を変更しない隔離HTTPS経路（検証用TLS終端と必要なプロキシ設定）を提案する。アプリがsecureリクエストとして認識することとブラウザの送信元ヘッダーを確認し、HTTPフォールバックとHTTPS送信元検証の両方を試す。用意できない場合はS6を確認待ちにする。
- メールはローカル受信環境・テスト用宛先で内容と登録リンクを確認。非同期設定では対象キューのワーカーで送信まで到達することをS1とS9で確認する。受信環境・ワーカーを用意できない場合は項目を保留する。
- 日次処理は専用DBのダミーゲストを使って、削除すべき対象と残す対象を確認。既存のcron運用は本計画では変更しない。

## Risks

- 中間版はサポート終了済み。検証のための通過点とし、そのまま公開しない。開始時点で公式サポート・配布・セキュリティ制約を再確認する。
- `composer.json`の広いPHP制約や`minimum-stability: dev` / `prefer-stable`が実際の対応状況を保証するわけではない。主更新に必要な版を調査し、安定版を優先する。
- PHPUnit更新でテストが減っても「成功」に見える可能性がある。検出一覧と既存仕様の対応を追跡する。
- array / syncのテストだけではブラウザ認証やメール配送を保証できない。必須の実HTTP・非同期確認が残る段階は完了扱いにしない。
- MySQLとSQLiteの差、`change()`属性保持、UUID/ULID・既存データ形式を確認せず置換することによる破損を防ぐ。
- DockerイメージやComposerの可変タグ、既存Node導入処理により再構築時だけ失敗し得る。各PHP更新時に版とビルド結果を記録する。
- 新たな環境変数が必要ならREADMEに名前と用途を記載し、秘密値は本書・出力・コミットへ含めない。`.env.production`は参照しない。

### 復旧と再開

- コードだけでなく、直前のcomposer.lock、PHPイメージ、検証DBバックアップを同じ確認地点として記録する。
- 復旧は今回分の変更だけを戻し、直前lockからDocker内で依存を再導入し、直前PHPイメージと検証DBバックアップを復元する手順とする。DBのdownが安全とは仮定しない。
- 無関係なユーザー差分を巻き戻さない。`git reset --hard`、再帰的強制削除、DBボリュームの削除で復旧しない。
- 次の実行は未完了の同一ステージから再開する。前段階の実行記録が不明なら、必要な基準確認をしてから進める。

## References

2026-10-19確認。実行時にも対象版の公式ガイドを確認する。

- [Laravel 9 upgrade](https://laravel.com/framework/docs/9.x/upgrade)
- [Laravel 10 upgrade](https://laravel.com/framework/docs/10.x/upgrade)
- [Laravel 10 release / PHP対応表](https://laravel.com/framework/docs/10.x/releases)
- [Laravel 11 upgrade](https://laravel.com/framework/docs/11.x/upgrade)
- [Laravel 12 upgrade](https://laravel.com/framework/docs/12.x/upgrade)
- [Laravel 13 upgrade](https://laravel.com/framework/docs/13.x/upgrade)
- [Laravel 13 CSRF / Origin Verification](https://laravel.com/framework/docs/13.x/csrf)
- [PHP 8.3 migration](https://www.php.net/manual/en/migration83.php)
- [PHP 8.4 migration](https://www.php.net/manual/en/migration84.php)
- [PHP 8.5 migration](https://www.php.net/manual/en/migration85.php)
- [PHPUnit 12 / annotation metadataの廃止](https://phpunit.de/announcements/phpunit-12.html)

## Review / Execution Log

### 計画レビュー

- 状態: Reviewer subagentによる設計レビュー完了。修正後の再確認で「問題なし」、追加の重大な指摘なし。
- 指摘と対応: S6のCSRF期待値をHTTP/HTTPS・送信元・トークン別に整理し、Laravel 13標準動作を誤って不具合扱いしないよう修正。隔離HTTPS経路と未確認時の保留条件を追加した。
- 実装承認: 計画作成時は未取得。その後2026-10-20にS0のみ開始指示を受領。S1以降は未着手。
- 計画作成時のテスト: ドキュメントのみのため未実行。S0実行結果は下記を参照。

### ステージ結果の記録書式

各実行後に次の項目を追記する。秘密値は記録しない。

```text
ステージID / 実行日:
状態: 未着手 / 実行中 / 確認待ち / 保留 / 完了
開始承認の範囲:
更新前後のLaravel / PHP / Composer / PHPUnit / 主要依存:
PHPイメージのタグ・OS系統・digest（取得できる場合）:
変更ファイルと対応理由:
実行コマンド・結果・テスト一覧/件数・assertion数:
ブラウザ / MySQL / メール / キュー / 日次処理の確認結果:
未実施項目・理由・残リスク:
Reviewer結果と対応:
コミットSHA、または未コミットの理由:
直前のlock・イメージ・検証DBバックアップの所在（秘密値を除く）:
復旧・再開に必要な情報:
次ステージ: 開始指示待ち（自動実行しない）
```


### S0 / 2026-10-20

- 開始承認: ユーザーからS0のみ実行しS1の前で停止する指示を受領。
- 状態: **保留。S1未着手。**
- 作業ブランチ: `codex/laravel-php-s0`。専用worktreeと隔離Docker環境を使用。
- 環境: Laravel 8.83.29 / PHP 8.2.30 / Composer 2.9.4 / PHPUnit 9.6.22。バージョン・lock・実装変更なし。
- backend最終: 92成功 / 1スキップ / 250 assertions。frontend: 52ファイル・204成功、lint成功。
- 阻害要因: frontendのGit未管理 `@/page/Test` 参照でビルド失敗、MySQLの全履歴構築が既存主キーと複合主キーの二重定義で失敗。
- 初期データ入り完全DBの復元とブラウザ主要フローは未確認。部分DBのダンプ・復元手順だけ確認済み。
- 詳細・テスト検出一覧・再現コマンド・証跡・復旧情報: [S0基準結果](2026-10-20-laravel-php-s0-baseline.md)。
- Reviewer: S0結果のレビュー完了。「問題なし」。コミット未実施。次はS0阻害要因の修正方針を提案・承認後に再確認し、S1開始指示を待つ。


### S0追加対応: 不要Testルートの削除

- ユーザー指示により `frontend/src/App.tsx` の `@/page/Test` importと `/test` Routeを削除（2行）。
- ビルド成功、フロント52ファイル・204テスト成功、lint成功。バージョン・lockは変更なし。
- 初回のビルド阻害要因は解消。MySQLの二重主キー問題と実ブラウザ・完全DB復元の未確認が残るため、S0保留・S1未着手。
- 詳細と証跡は [S0基準結果](2026-10-20-laravel-php-s0-baseline.md) の追加対応節を参照。


### S0追加対応: 対象マイグレーションのid削除

- ユーザー承認により `2024_12_23_234609_update_boxer_title_snapshots_table.php` を修正。id削除後に複合主キーを作成し、downでは外部キーを維持してid主キーへ戻す。旧id値は復元しない。
- 新しい専用MySQLで全34件成功。down→upの2サイクル、代表データ保持、複合キー重複拒否、外部キーcascade成功。
- 最終バックエンド全テスト: 92成功 / 1スキップ / 250 assertions。
- 完全スキーマと合成ユーザー1件を別DBへ復元し、20テーブル・34件の履歴・合成ユーザーを確認。
- ビルド・新規DB構築の阻害要因は解消。主要ブラウザ操作が未確認のためS0は確認待ち。Web用検証設定のDB接続先切替が必要。S1未着手、コミット未実施。
- 詳細・証跡・制限は [S0基準結果](2026-10-20-laravel-php-s0-baseline.md) の追加対応節を参照。


### S0最終確認: 実操作・メール・日次処理

- ユーザー指示で残りのS0確認を実施。修正済みDBへ接続し、frontend `.env.example` のサイト名等を検証環境に補った。実装・lockの追加変更なし。
- ブラウザ: 通常・ゲストのログイン/ログアウト、一覧・詳細、コメント・投票、再読込み、一般ユーザーの管理画面拒否、管理者の画面許可、過去0件・NotFoundを確認。
- 仮登録→DBキュー→ワーカー→ローカルSMTP受信→メール本文リンク→本登録→新規ユーザーログインまで成功。
- 実HTTPの22項目が成功。CSRF欠落/不正419、未認証・一般ユーザーの権限拒否401、管理者のコメント削除200を確認。
- 日次ゲスト削除を専用ダミーデータで実行し、対象の削除と非対象の保持を確認。
- 最終backend92成功 / 1スキップ / 250 assertions、frontend52ファイル・204成功、ビルド成功、lint成功済み。
- S0の必須確認と最終Reviewer確認まで完了。未解決の実装指摘なし。S1未着手、コミット未実施。
- 詳細・証跡・ローカル検証の限界は [S0基準結果](2026-10-20-laravel-php-s0-baseline.md) の最終確認節を参照。


### S0最終判定

- **S0完了**。Reviewerも完了判断を妥当と評価した。実装上の未解決指摘なし。
- 本登録成功は画面・DB・新規ユーザーログインで確認し、描画後のログイン画像を追加取得した。遷移直後の空本文画像は完了証拠として扱わない。
- 既存スキップ・警告、およびローカル構成に限る検証の制限はS0報告に明記済み。
- **S1は開始しない**。次段階はユーザーの開始指示待ち。今回分は未コミットなので、変更を保存してから区切る。
