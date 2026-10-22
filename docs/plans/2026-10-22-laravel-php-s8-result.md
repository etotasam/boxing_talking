# S8実行結果: PHP 8.4→8.5

## 状態

2026-10-22 JST。ユーザーが具体計画を「go ahead」で承認し、codex/laravel-php-s8で実装・検証を実施。最終Reviewerが必須修正・未実施ゲートなしと判断し、その後の全backend再実行も170成功/既存1skip/440assertionsで通過。S8完了。S9・commit/push・本番反映は未実施。

- worktree: /Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking
- 復旧元: S7 commit 225c5b0c97660d4c94489c2486258f9d301877b5。
- [承認済み計画](2026-10-22-laravel-php-s8-plan.md)

## 変更

1. PHP8.4のままnette/schema v1.3.2→v1.3.3、nette/utils v4.0.5→v4.0.8をComposerで部分更新し、全backendを確認。
2. PHPを8.5.12-fpm-trixieへ更新し、公式index digest sha256:f665ad19c093eee54db3a03c89102d6828b1bbf4f327689e5947a8686c6585a1で固定。
3. composer.jsonのPHP要件を^8.5へ変更。Composerでlockのhash/platformを整合。Laravel13.38.0と他118パッケージのversion/source referenceは固定。Netteを直接依存へ追加していない。
4. MySQL SSL CA定数をPdo\Mysql::ATTR_SSL_CAへ変更。pdo_mysql存在判定、array_filter、MYSQL_ATTR_SSL_CAの指定意味を維持。
5. php.iniの削除済みdisable_classesと非推奨report_memleaksをコメント化。register_argc_argv=Offを維持。READMEを更新。

既存テストが変更対象を保証し、実行上も不足が見つからなかったため、新規テストは追加していない。MailSendJobTestの実Markdown描画と実SMTP・ブラウザ登録も確認した。

## 実行環境と復旧

S8専用Compose /private/tmp/boxing-upgrade-s8/compose.ymlを使用。旧S7のイメージ・DB・runtimeを保持し、S8は別vendor/storage/bootstrap cache/合成.env/tmpfs MySQLを使用した。公開ポートはloopbackのみ。OS信頼ストアを変更していない。

| 項目 | 実測 |
| --- | --- |
| PHP CLI / FPM | 8.5.12 / 8.5.12、HTTPSリクエストでfpm-fcgi・secure=true |
| Laravel | 13.38.0 |
| Composer / image Node | 2.9.4 / 16.13.2 |
| DB | MySQL8.0.21、boxing_upgrade_s8 / boxing_upgrade_s8_rollback |
| 読込ini | /usr/local/etc/php/php.ini、追加scanなし |
| timezone / CLI E_ALL | Asia/Tokyo / 30719（実E_ALL一致） |
| SQLite | 3.46.1、日本語のINSERT/SELECT往復成功 |
| 旧拡張の欠落 | なし |
| 追加拡張 | Zend OPcache、lexbor、uri |

追加拡張はPHP8.5の組込み変更と一致する。外部opcache.soを追加ロードしていない。[公式移行情報](https://www.php.net/manual/en/migration85.other-changes.php)・[PHP8.5公式発表](https://www.php.net/releases/8.5/en.php)参照。

- 旧イメージ: boxing-talking-php:s7-8.4.27、sha256:50c620788c2d05ce1d80a911c6c8c9284b58ef26887682ce9b34a2334165c061。
- 新イメージ: boxing-talking-php:s8-8.5.12、sha256:73cc5ddeb8465e088adc624aa02b7ecf5c15abf1c123a723863ba4644e81f5f8。
- 一時証跡: /private/tmp/boxing-upgrade-s8/。永続バックアップとは扱わない。
- s7-composer.json/lock、s7-php.ini、s7-dockerfile、s7-database.php、compose-php84.ymlを保存。
- php84-before.sql、php84-sessions-job.sql、php84-storage-before.tar.gzを保存。S8専用MySQLへS7dumpを実際に復元し35履歴と既存データを確認。
- 最終dump: php85-verified.sql。復旧はS7コミットの別checkoutと旧lock/ini/8.4イメージ、dump/storageの組で実施する。現在の^8.5コードのまま旧Composeだけを起動することは復旧と扱わない。既存branchやデータをreset/強制削除しない。

## 検証

| 検証 | 結果 |
| --- | --- |
| 更新前PHP8.4 全backend | 170成功 / 既存1skip / 440assertions |
| Nette更新後PHP8.4 全backend | 170成功 / 既存1skip / 440assertions |
| PHP8.5 全backend | 170成功 / 既存1skip / 440assertions |
| テスト検出 | 171→171、追加0・脱落0 |
| MySQL専用回帰 | 5成功 / 41assertions |
| PHP構文 | app/config/routes/database/tests/bootstrap/public/index.php/artisan、240ファイル成功 |
| Composer | validate --strict、check-platform-reqs、実install、install --dry-run成功 |
| Nette以外の依存 | 118パッケージversion/reference固定 |
| 実HTTPS / artisan HTTP | 認証・権限・投稿/削除・CORS等、各23check成功 |
| 実HTTP/HTTPS CSRF | 135組み合わせ成功。既存自動CSRF61ケースも全件に含む |
| 保存session/cache | 8.4保存のHTTP/HTTPS認証session/cacheを8.5で読み書き。origin/config/APP_KEY維持 |
| 保存job | 8.4投入の登録jobを8.5実worker→ローカルSMTP→受信tokenで本登録→新規login成功 |
| PDO CA設定 | CAあり/なし、pdo_mysqlあり/なしの4分岐成功。実MySQL読み書き成功 |
| 旧Sanctum token | hash/abilities/nullable expiration・日時のread/write成功 |
| 日次処理 | 2日前削除、昨日/今日/active保持。schedule:list確認 |
| Monolog | laravel.log/error.log/task.logに個別マーカー出力 |
| 新規PHP診断 | 全backend、実Composer導入、php/fpm/fpm_httpコンテナログで0 |
| 依存監査 | 既知4advisories / 3packages、Laravel0、例外追加なし |

MySQL回帰はBoxerTitleSnapshotMigrationTestとDeleteGuestUserTest。別DBで制約・主キー往復・cascadeとTokyo日付境界を確認。両DBの最終migrationsは35。

### ブラウザ

HTTP http://localhost:18084で実操作。HTTPSはCA検証付き実HTTPで検証し、実ブラウザHTTPSを実行したとは扱わない。

- 通常login/logout、一般ユーザーの管理URL拒否、予定一覧・詳細、コメント投稿・reload後の保持。
- guest login/logout、投稿、勝敗投票成功。集計7票・あなたの投票表示。
- admin login/logout、管理フォーム「選手情報」、過去一覧の既存fixtureによる空表示。
- ブラウザguest投稿を実HTTPで一般DELETE401/adminDELETE200と確認。最終ブラウザreloadでguest投稿0・normal投稿1。削除UIは追加していない。
- 実ブラウザ仮登録→実database queue worker→S8専用ローカルSMTP11038受信→受信HTMLの実リンク→本登録成功→S8 Browser Userで新規login。
- 最終対象user1/pre_user0/jobs0/failed_jobs0。外部SMTPや実ユーザー宛の送信なし。
- SMTPは登録前に合成メールの受信health確認済み。旧jobはCLI worker設定に従いhttp://localhost:18083のリンク、ブラウザ用workerはAPP_URL/FRONT_APP_URL=http://localhost:18084で生成し、実リンクのoriginを確認。
- 証跡: browser-normal-comment.txt、browser-normal-permission.txt、browser-guest-vote.txt/png、browser-admin-form.txt、browser-past-empty.txt、browser-after-delete.txt、browser-preregistration.txt、browser-registration-success.txt/png、browser-signup-login.txt/png。

### 診断の区別と未実施範囲

- 既存PSR-4通知2件は従来どおり。171識別子はすべて検出された。
- MySQL artisan --configuration重複の既存CLI警告は継続し、exit1となるが5テストは成功。回帰用DBの35履歴も確認し、SQLiteで実行したとは扱わない。
- 一時PDOプローブの固定数値1009はPHP8.5で1008と異なったため、実Pdo\Mysql::ATTR_SSL_CAを使う意味の比較へ修正。各runtime内で新旧定数が同じキーを示すことを確認。8.5の旧定数を意図的に呼んだ比較時だけ期待したdeprecatedを観測した。アプリ設定は新定数を使用している。
- 初回旧job仮登録でS7と同じ合成nameが重複し422となったため、S8専用nameで再実行して成功。初回メール解析はCLI workerのURLをHTTPS固定と誤認したため修正し、受信した実tokenで登録確認した。
- ブラウザの初期読込/非同期処理中の操作・古い画面cacheは、読込完了とreloadを確認して再実行した。削除反映は最終reload後の0件を根拠にする。
- frontend/API契約の変更なし。全体計画に従いVitest/build/lintはS8では未実行。S9の最終統合検証は未着手。
- 本番・外部S3/SMTP・本番TLS接続は未検証。既知監査4件（aws/aws-sdk-php2、firebase/php-jwt1、mtdowling/jmespath.php1）は残る。

## 最終レビュー

Reviewerが差分・結果・証跡を確認し「問題なし」。先行確認のlock要件不一致はComposerで解消済み。必須修正・未実施ゲートなし。レビュー後の最終backendは170成功/既存1skip/440assertions、diff --checkも成功。**S8完了、S9未着手。** 変更は未コミット、push/本番反映なし。commit/pushは別途承認手順で扱う。最終ログはbackend-tests-final.log。
