<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Environment Variables

| Name | Description | Default |
| --- | --- | --- |
| `CUSTOM_ERROR_CODES_FRONTEND_OUTPUT_PATH` | `custom-error-codes:generate`で生成するフロントエンド定数ファイルの出力先 | `../frontend/src/constants/customErrorCodes.ts` |

## Laravel / PHPの段階更新中の制約

現在のLaravel 13.38.0 / PHP 8.5.12は、段階更新の最終構成です。S9で隔離環境の再構築・総合検証を完了しました。その後P3/P5でNode24/MySQL8.4へ更新しましたが、依存監査の保留残件とP6の最終確認があるため、本番公開可能とは判定していません。検証ではloopback・合成データ・ローカルSMTPのみを使用します。

DockerのPHPは8.5.12（Debian 13/trixie）、Composerは2.9.4に固定しています。取得元digestは `docker/php/dockerfile` を参照してください。Nodeは既存の16.13.2を維持しています。
S7でPHP 8.4.27へ更新しました。S6までのPHP 8.3.35に残っていた重大な2件（CVE-2026-109618 / CVE-2026-109619）は、この更新版で修正されています。依存パッケージの監査残件は引き続き実行結果を参照してください。

Laravel 12.69.0以上への更新に伴い、中間版を通過するための4件の `config.audit.ignore` 例外をS5で削除しました。Composerの監査と更新ブロックは有効です。残る依存監査は実行結果を参照してください。グローバル設定や `block-insecure` は変更していません。

Laravel 11では未使用の `rorecek/laravel-ulid` と、native schema移行に伴い未使用となった `doctrine/dbal` の直接依存を除去しました。ID生成は既存の `Str::uuid()` を維持します。Sanctum 4の設定キーへ移行し、既存のCookie認証方式と公開済みのトークン表・期限列マイグレーションを維持しています。
SQLiteで全履歴を新規構築できるよう、スナップショット表の主キー切替はSQLite限定で再構築してから `id` を削除します。MySQLの処理と既存DBの適用済み履歴は維持します。

詳細な承認範囲・検証・復旧方法は [アップグレード計画](../docs/plans/archive/laravel-php/2026-10-19-laravel-php-upgrade.md) を参照してください。

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 1500 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the Laravel [Patreon page](https://patreon.com/taylorotwell).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Cubet Techno Labs](https://cubettech.com)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[Many](https://www.many.co.uk)**
- **[Webdock, Fast VPS Hosting](https://www.webdock.io/en)**
- **[DevSquad](https://devsquad.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[OP.GG](https://op.gg)**
- **[CMS Max](https://www.cmsmax.com/)**
- **[WebReinvent](https://webreinvent.com/?utm_source=laravel&utm_medium=github&utm_campaign=patreon-sponsors)**
- **[Lendio](https://lendio.com)**
- **[Romega Software](https://romegasoftware.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Laravel 13への移行設定（S6）

- PHP 8.3以上が必要です。S6の検証イメージはPHP 8.3.35です。
- `App\Http\Middleware\VerifyCsrfToken`はLaravel 13の`PreventRequestForgery`を継承します。webとSanctumのstateful APIに同じ方針を適用し、`Sec-Fetch-Site: same-origin`の要求はトークン検証を省略、それ以外は従来のCSRFトークン検証を行います。認証・権限の確認は引き続き必要です。
- `config/session.php`の`serialization`は`php`を維持し、既存セッションを引き継ぎます。`json`への切替はセッション失効を伴うため別途判断します。
- `config/cache.php`の`serializable_classes`は`false`です。キャッシュはスカラー・配列を使用し、PHPオブジェクトの保存が必要になった場合は必要なクラスの許可リストを検討してください。
- `SESSION_COOKIE`、`CACHE_PREFIX`、`REDIS_PREFIX`の既定値は既存設定を維持しています。新ひな型の接頭辞へ一括変更しないでください。
- HTTPSでの送信元検証は、信頼できる証明書を使って別途検証します。詳細・残課題はリポジトリルートの`docs/plans/archive/laravel-php/2026-10-22-laravel-php-s6-plan.md`を参照してください。

## PHP 8.4への移行（S7）

- S7時点のPHP要件は8.4以上でした。Laravelは13.38.0を維持し、PHPイメージを8.4.27へ更新しています。
- 暗黙nullable引数を明示し、省略/null時の意味を維持します。CSVのescapeは従来のバックスラッシュを明示し、出力形式を維持します。
- PHP8.4で非推奨となるnative session設定は指定せず既定値を使用します。native PHPのID設定は32桁/16進数になり、Laravel側のID生成、Cookie名、保存形式は維持します。

## PHP 8.5への移行（S8）

- 現在のPHP要件は8.5以上です。Laravel 13.38.0を維持し、PHPイメージを8.5.12へ更新します。
- PHP 8.4上でnette/schemaを1.3.3、nette/utilsを4.0.8へ先に更新し、その他の依存版を維持します。
- PHP 8.5で削除されたdisable_classes、非推奨のreport_memleaksは指定しません。register_argc_argv=Offを維持します。
- MySQLのSSL CAオプションにはPdo\Mysql::ATTR_SSL_CAを使用し、MYSQL_ATTR_SSL_CA環境変数の意味と証明書検証の条件を維持します。
- PHP 8.5ではOPcacheが組み込まれるため、外部opcache.soの追加ロードは行いません。

## 最終統合検証・公開前の残課題（S9）

最終lockから空vendorへComposer installし、frontendもlockからnpm ciして全テスト・build・lintを確認しました。専用MySQLの空DB構築と旧データ移行、実HTTP/ブラウザ、実worker/SMTP登録を含みます。詳細と復旧手順は[最終検証結果](../docs/plans/archive/laravel-php/2026-10-22-laravel-php-s9-result.md)を参照してください。

既存の依存脆弱性、PHPイメージ内Node16・frontend用DockerのNode21・MySQL8.0のサポート終了は別途対応が必要です。今回のfrontend検証はホストNode22.10.0で行い、既存DockerのNode21で成功したとは扱いません。本番デプロイ、外部SMTP/S3、本番TLS/DB、worker/cron運用と永続backup/restoreは別タスクで確認します。


## JWT 7系の鍵要件（P2）

- firebase/php-jwtは7.2.1を使用します。登録確認メールのJWTは従来どおりHS256・30分期限です。
- `storage/app/private/jwt-private.key`の内容をHS256の共通鍵として読み込みます。7系は32バイト未満の鍵を拒否します。長さだけでなく、十分な暗号学的乱数から生成された鍵を使用してください。
- JWT鍵とAPP_KEYを更新作業で一括変更しないでください。同じ要件適合鍵で署名された、有効期限内の6系tokenを引き継ぐ方針です。鍵を変更すると既存メールリンクに影響するため、再送・未処理queue・切替時点を含む移行を別途計画してください。
- 開発用鍵の最低長は値を表示せず確認しました。本番鍵の長さ・生成方法・メール/queue運用は未確認です。本番反映前に別途確認が必要です。

## Nodeとfrontendのビルド

PHP image内のNode 16/npmはP3で削除しました。現在のReact/Viteの開発・ビルドは
Composeのnodeサービスで行います。導入・起動手順は[frontend README](../frontend/README.md#dockerでの開発)を参照してください。
backend/package.jsonとwebpack.mix.jsの旧Laravel Mix設定は今回変更していませんが、
PHP container内では旧Mixのnpmコマンドを実行できません。
リポジトリルートの`npm run backend:generate-error-codes`等はホストnpmからDocker内PHPを呼ぶ手順であり、
PHP image内Nodeの削除による変更はありません。

## MySQL更新用の隔離baseline（P5・A0）

通常Composeとは別の `docker-compose.mysql-upgrade.yml` を使います。以下はMySQL8.0.21の初期baseline準備手順です。隔離検証の第1段階Aと、承認後の元環境適用の第2段階Bは完了しました。Aの手順は通常Composeや実データに流用しないでください。[P5計画](../docs/plans/2026-11-02-mysql-lts-update.md)を参照してください。

- projectは`boxing-mysql-p5`、DB名は`boxing_p5_baseline`、DB serviceは`db80`。ホストへの公開ポートはありません。
- DBはproject専用`baseline_db80` volume、DB/PHPはinternal networkだけを使います。元の`db`・`my_data`・通常Composeのnetworkを使いません。
- Git除外の`docker/db/p5-runtime/`に、tracked backendファイルのenvなしコピー・独立vendor・合成設定`synthetic.env`・証跡を置きます。元の.env、鍵、storage、vendor、config cacheはコピーしません。合成.envにはコメントだけを書きます。起動時に必要な`storage/app/private/jwt-private.key`も、runtime内だけにRSA2048以上で新規生成し、600で保存します。元の鍵は使用しません。
- `P5_RUNTIME_DIR`はこのruntimeの絶対パス、`P5_PHP_IMAGE`は既存Dockerfileに対応する検証済みローカルPHP imageのIDです。`P5_ROOT_PASSWORD`/`P5_DB_PASSWORD`/`P5_APP_KEY`は合成専用値を生成し、設定ファイルを600・runtime親を700にしてGitへ入れません。実環境の値は使いません。
- 合成設定の作成と接続先・mount・空DBの事前確認後、以下をリポジトリルートから実行します。設定ファイルがなければ停止します。通常Composeで代用しないでください。

```sh
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml run --rm --no-deps deps
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml up -d php
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml exec -T php php /p5-tools/baseline.php preflight
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml exec -T php php /p5-tools/baseline.php migrate
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml exec -T php php /p5-tools/baseline.php seed
docker compose --env-file docker/db/p5-runtime/synthetic.env -f docker-compose.mysql-upgrade.yml exec -T php php /p5-tools/baseline.php verify
```

`migrate`は完全に空のDBだけ、`seed`は35履歴適用済み・19データtableが全て空のDBだけで許可します。接続先/版/hostnameが違う場合も拒否します。再確認は`verify`を使い、再投入のためにDBを初期化しないでください。

合成ユーザー3・選手4・試合3など計64行を作り、元データは使用しません。tokenable_idが数値でusers.idがUUIDという既存の型差があるため、無理な変換や孤立tokenを入れずtoken表は空にします。jobs/failed_jobsも空で、worker・メール・API操作は実行しません。投入用パスワードは実行時にランダム生成してハッシュ化し、実ログインの資格情報としては提供しません。

件数・FK・NULL・UTF8・soft deleteと、全20tableの内容/schema hashを確認します。これは合成データの準備確認であり、MySQL更新・バックアップ復元・本番互換の成功を意味しません。baselineへRefreshDatabaseや全テストを向けないでください。停止する場合はこの専用Composeの`stop`を使い、volumeを削除しません。


### P5続行状況：第1段階Aの隔離検証結果（2026-11-02）

合成baselineのschema限定SQLdumpを、専用restore80（boxing_p5_restore80 / 別volume）へ復元し、20table・64行・35履歴の内容/構造/索引/FK/採番が完全一致することを確認しました。routines/events/triggersは0を確認済みで、dumpでは明示的にskipしています。SQLとchecksumはGit除外runtime/dumpsとevidenceへ600で保持しています。

Checkerの待機原因は、既定optionの暗黙接続・パスワード入力待ちでした。`--no-defaults`と`run --interactive=false`で補正後、8.0.46向けはerror0/warning14、8.4.13向けはerror0/warning24/notice2。既定値変更と転送しないroot権限の通知を全件評価し、raw JSONと別の受容根拠を保持してReviewer確認後に進めました。警告を除外していません。

`relay80`（8.0.46 / boxing_p5_relay80 / relay_db80）と`db84`（8.4.13 / boxing_p5_migrated84 / migrated_db84）は専用internal network・別volume・ホスト公開なしです。各段階の20table・64行・35履歴と内容/構造/索引/FK/採番は完全一致。SQLite全件は172成功・既存skip1・446assertionsです。

別schema `boxing_p5_regression84` のMySQL固有5テストは、独自PHPUnit bootstrapとhandler監視の干渉で全件riskyとなり一旦停止しました。その後ユーザー承認により、接続先/実効設定/版の事前確認を別PHP processで終了させ、PHPUnitは標準autoloadで実行する方式へ補正。5成功・34assertions、failure/error/risky/skipは全0です。risky/warning/incomplete/skipも失敗扱いにして実行しました。アプリ・テスト本体は変更していません。

専用schema `boxing_p5_fresh84` が空であることと実接続先/版を確認して、8.4.13で既存35migrationを新規実行し、全20tableを作成できました。列/索引/FK/engine/collationとmigration履歴は移行済みDBと一致。AUTO_INCREMENTの現在値だけは合成データ入りDBと空DBで異なるため、構造比較から分けて記録しています。seedや移行済みDBへの再migrationは行っていません。

8.4のapp schema限定dumpを、`restore84`（boxing_p5_restore84 / 別restore_db84 volume / 固定8.4.13 digest）へ復元し、全内容/構造/索引/FK/採番が一致。旧8.0.21の別regression schemaでも同じ5件/34assertionsが成功し、識別子単位でも8.4と一致しました。

MySQL8.4の全173識別子は、1件ずつprocess isolationで実行して172成功/既存skip1/446assertions、failure/error/risky0。通常の一括実行では、既存fixtureの固定ID前提とMySQLのrollbackで採番が戻らない仕様が干渉し57件失敗しましたが、アプリ・テスト・制約を変更せず実行方法だけで補正しました。raw失敗と成功の両方を保存しています。フロント定数同期テスト用の1fileはPHPへRO mountします。

別schema boxing_p5_business84_finalでは、新規caching_sha2_passwordへのPHP接続、CRUD/rollback、2接続ロック、専用queueの実job1件処理を確認。コンテナ内loopbackの実HTTP25requestsでCookie/CSRFログイン・ログアウト/権限/入力拒否、コメントのUnicode保存・投票集計公開条件・管理者CRUDを確認しました。HTTP用SESSION_DRIVER=file/SANCTUM_STATEFUL_DOMAINS/APP_URL/FRONT_APP_URL/SESSION_COOKIEは専用process内だけに設定し、ホストへポート公開していません。

A終了時には専用サービスを全停止し、5つのDB volumeと旧版/中継/8.4 dumpを保持しました。この時点まで元環境は不変でした。その後、下記Bを別承認で実行しています。

### P5第2段階B：元環境のMySQL8.4.13への切替（2026-11-02）

保存状況の追記: ユーザー依頼により今回の変更を作業branchの本コミットへ保存します。以下の「未コミット」は保存依頼前の確認時点の記録です。元branchへのコミット統合は別途行います。定期DBバックアップの仕組みは未実装で、後日検討します。

元worktreeの`codex/laravel-php-upgrade`で通常ComposeのDB imageを固定8.4.13 digestへ変更し、保存先を`mysql84_data` named volume（実名`boxing_talking_mysql84_data`）へ切り替えました。通常Composeは元環境用です。作業worktreeの検証では専用Composeを使い、このvolumeを共用しないでください。別環境で旧`my_data`を使っていた場合も、単に新Composeを起動するだけでは既存データを移行できません。

元DBは20table・53migration履歴で、現35ファイルは全適用済み。旧DBを一時書込み停止し、8.0.21→別8.0.46→新8.4.13へapp schemaだけを論理移行しました。全内容/構造/索引/FK/CHECK/採番と未処理jobs3件（failed0）が完全一致。元の`docker/db/my_data`を8.4で開いたり、migrationを再適用したりしていません。

新DB再作成時の書込みの隙間を避けるため、切替中だけsuper_read_onlyを永続化し、起動直後のread_only/super_read_only=1/1を確認。実PHP接続・内部HTTPと全snapshot比較後、永続値を解除し0/0へ戻して通常利用を再開しました。公開boxer/match APIも200/JSON、Web/PHP/Node/DBは稼働しています。実データ保持DBにRefreshDatabase/seed/workerを向けず、更新系25HTTP/CRUD/queue等は新8.4上の別合成schemaで検証し、そのschema/専用userだけを片付けました。既存jobsは実行していません。

実.envの本文・実鍵は表示/コピーせず、移行用の秘密値は既存コンテナの環境から一時メモリ内で利用しました。通常Composeの比較/適用も--env-file /dev/nullを明示し、必要値を内部継承。通常アプリは従来の自身の設定で起動し、確認結果にはDB版・一致判定・件数だけを出力しています。

旧8.0.21の`my_data`・imageと、元worktreeのGit除外`docker/db/backup/mysql-lts-update-p5-20261102/`（親700/ファイル600）を保持しています。source-8.0.21.sql、relay-8.0.46.sql、target-8.4.13.sql、checksum/各snapshotとoriginal-compose.ymlが復旧点です。停止済みの一時8.4候補コンテナは削除し、稼働中volumeを二重起動しないようにしました。volumeや旧データは削除していません。

復旧時はまず現在の書込みとWebを止め、新8.4データ/最新dumpを保全します。8.4データを8.0で開かず、保持した旧image/旧`my_data`/旧Composeの組を使います。今回は既に書込み再開済みなので、旧DBへ単純に戻すと以後の更新が失われます。再開後の差分回収・整合性・復旧手順を再評価し、無断で巻き戻さないでください。P5は更新・切替検証まで完了し、P4残監査/P6/本番公開承認は別です。変更は未コミットです。
