# S9 最終統合検証・引き継ぎ結果

## 状態

2026-10-22 JST。ユーザーのS9実行依頼に基づきcodex/laravel-php-s9で実施。基点はS8 commit 959490c5aa40b96368cb9fae55383a8a13dba0b5。最終Reviewerが必須指摘・未実施ゲートなしと判断し、その後の全backend再実行（170成功/既存1skip/440assertions）と差分チェックも成功。S9の機能・再構築検証は完了。PHP/Laravel/依存/アプリコード/テストコードは変更していない。文書のみ更新。commit/push・本番反映なし。

[実行計画](2026-10-22-laravel-php-s9-plan.md)・[全体計画](2026-10-19-laravel-php-upgrade.md)。

## 最終構成と再構築

| 項目 | 確認結果 |
| --- | --- |
| PHP / Laravel | CLI/FPMとも8.5.12 / Laravel13.38.0 |
| Composer | 2.9.4 |
| PHP base | php:8.5.12-fpm-trixie、index digest sha256:f665ad19c093eee54db3a03c89102d6828b1bbf4f327689e5947a8686c6585a1 |
| 再ビルド | Dockerfileを--no-cache --pull、linux/amd64で成功 |
| 新イメージ | boxing-talking-php:s9-8.5.12、sha256:74cc42bbf09883f68ce195efca5af5f67fed2f445fbced572d69e12672f29f45 |
| Composer導入 | 空vendorからcomposer install、120依存すべて最終lockのversion/source referenceと一致 |
| Composer検証 | validate --strict / check-platform-reqs / install --dry-run成功 |
| frontend再構築 | S8コミットのGit管理frontendを一時コピーしnpm ci。lock不変 |
| frontend検証Node/npm | ホストNode22.10.0 / npm10.9.0。PHPイメージ内Node16.13.2とは別 |
| DB | MySQL8.0.21、専用tmpfs DB。既存開発DBに操作なし |
| runtime | CLI/FPM実HTTPS、ini/Asia/Tokyo/E_ALL/拡張/PDO/SQLite日本語往復成功 |
| 拡張 | S8と同じ。OPcache/lexbor/uri含む。旧拡張欠落なし |

backend composer.json/lock、frontend package.json/lock、DockerfileのSHA256を前後比較し不変。Nette schema1.3.3/utils4.0.8を含め追加updateなし。apt等のOSパッケージまでは固定していないため、機能とlockの再現確認でありDockerイメージ全体のbit単位同一性は保証しない。

一時領域: /private/tmp/boxing-upgrade-s9/。Compose、空vendor、専用storage/cache/SQLiteファイル・合成.env・専用MySQLを使用。本番設定や秘密情報を参照していない。

## 自動テスト

| 項目 | 結果・証跡 |
| --- | --- |
| backend全件 | 170成功 / 既存1skip / 440assertions、backend-tests.log |
| 検出比較 | S8の171識別子すべて維持、追加0・脱落0、test-detection.json |
| MySQL回帰 | 5成功 / 41assertions、mysql-regression.log |
| PHP構文 | 240ファイル成功、php-lint.log |
| frontend Vitest | 52ファイル / 204件すべて成功、frontend-tests.log |
| frontend build | tscとVite build成功、frontend-build.log |
| frontend lint | max-warnings0で成功、frontend-lint.log |
| 新規テスト | 追加なし。既存テストと実検証を再実行し、不足は見つからなかった |

Vitest/build/lintは新しい一時コピーで実行し、リポジトリnode_modulesを手編集していない。CYPRESS_INSTALL_BINARY=0で導入しCypressは実行していない。S0/S5基準の52ファイル204件を維持。

既存PSR-4通知2件、MySQL artisan --configuration重複CLI警告（exit1だが5ケース成功）、Browserslistデータ9か月経過・buildの500kB超chunk通知を区別して記録。警告抑制やテスト期待値変更なし。buildの失敗とは扱わない。全backend・Composer導入・php/fpm/fpm_httpコンテナログの新規PHP診断は0。

## MySQL移行・復元・保存互換性

次の専用DBを分離した。既存開発DBにfresh/RefreshDatabaseを向けていない。

| DB | 検証 |
| --- | --- |
| boxing_upgrade_s9_fresh | 空DBから全35履歴成功 |
| boxing_upgrade_s9_legacy | S1保存のlaravel8-before.sql（34履歴）を復元し、未適用のexpires_at追加1件を適用して35履歴 |
| boxing_upgrade_s9 | S8のphp85-verified.sqlを復元した実HTTP/ブラウザ用。35履歴 |
| boxing_upgrade_s9_rollback | 同S8dumpを別DBへ復元。35履歴とS8登録済みユーザー保持を確認し、そのまま保存 |
| boxing_upgrade_s9_tests | 回帰5ケース専用。復元確認DBをテストで初期化しない |

- 旧DBの19データテーブルについて、元からある全カラムの行数とJSON内容ハッシュを移行前後比較し、すべて一致。migrationsは履歴が増えるため別確認。
- fresh/legacyのカラム型・null/default/extra/collation、主キー/索引、外部キー参照と更新/削除規則が完全一致。AUTO_INCREMENT値やmigrationsのbatch等はデータ状態として別扱い。
- 証跡: legacy-data-before.json、db-compare.log、schema-legacy-0〜3.tsv、schema-fresh-0〜3.tsv、mysql-fresh.log、mysql-legacy.log。
- S0の一時環境は現存しない。S1に保存された旧Laravel8相当dumpを使った検証であり、実本番DBの移行やS0環境そのものの復元とは扱わない。
- S8保存HTTP/HTTPS session/cacheを同origin/config/APP_KEY・新vendorで読み書き成功。ブラウザでもS8 Browser Userの認証が引き継がれた。証跡: http-session-compat.json、compat-result.json、browser-s8-session-preserved.txt。

## 実HTTP・ブラウザ・非同期

- artisan HTTP/CA検証付きFPM HTTPSで主要認証・認可・CSRF・CORS・投稿/削除等が各23check成功。
- HTTP/HTTPSの送信元/メソッド/token組合せ135ケース成功。Laravel13のsame-origin時token省略と、それ以外の検証、認証/認可を維持。
- 日次処理: 2日前の削除対象は削除、昨日/今日/activeは保持。schedule:list確認。
- 旧Sanctum tokenのhash/abilities/nullable expirationと日時read/write、Monologのlaravel.log/error.log/task.logへの出力成功。
- PDO CA指定あり/なし・pdo_mysqlあり/なしの分岐を確認。実MySQL読み書き成功。本番MySQL TLSの実証ではない。

ブラウザはHTTP http://localhost:18084で、新規npm ci/buildしたdistをVite preview（loopback13006）から配信して検証した。開発サーバーだけの確認ではない。HTTPSはCA検証clientsで補完し、実ブラウザHTTPSを実施したとは扱わない。証明書は2026-10-23 19:29:29 UTCまで有効、OS信頼変更/警告迂回なし。

- 通常/guest/admin login/logout、一般管理URL拒否、一覧/詳細、通常投稿/reload保持。
- guest投稿・投票成功、「あなたの投票」・集計8票を確認。
- adminフォーム「選手情報」、過去一覧の期待した空表示。小さい画面では「一般ページ」メニューから移動。
- 削除UIは未提供のため、ブラウザ投稿を実HTTPで一般DELETE401/adminDELETE200と確認。最終reloadでguest投稿0・normal投稿1。
- 実ブラウザ仮登録→実database worker→専用loopback SMTP11040→受信HTMLの実リンク→本登録成功→S9 Browser User新規login成功。
- SMTPは事前に合成メール送受信health確認。ブラウザ用workerのAPP_URL/FRONT_APP_URLはhttp://localhost:18084、受信リンクoriginも一致。
- 最終対象user1/pre_user0/jobs0/failed_jobs0。外部SMTP/実ユーザーへの送信なし。
- 証跡: http-results.json、http-cli-results.json、csrf-http-matrix.json、fpm-http-runtime.json、daily-check.log、token-log-probes.log、browser-*.txt、browser-final.png、browser-mail-worker.log。メール/JWT/cookie/private keyは一時領域だけに保持し、Git対象にしない。

## 準備中の問題と復旧

S9準備中、並行して残っていた旧検証環境のメモリ負荷によりS8一時DBがexit137/OOMKilled=trueで終了。最新live dump取得はできなかった。保存済みS8完了時php85-verified.sqlを復元元に使用し、別DBにも復元成功を確認した。S8終了以降のアプリデータ変更は行っていないため、完了時snapshotを基準とする。

S1/S2/S3/S7のこのアップグレード専用DBは非システムの合成DBをダンプ保存して停止し、S9のメモリを確保した。通常開発コンテナは停止していない。保存はboxing-upgrade-s*-db-1-preserved.sql。一時tmpfs DBを永続バックアップとは扱わない。

MySQL初期化中の一時サーバーがpingに応答してしまい、最初の準備ではruntime DB未作成となった。初期化完了後に専用DBを復元し直し、19テーブル/35履歴・データハッシュの最終結果を根拠にした。空の初回比較結果は成功証跡に使っていない。

復旧点はS8 commit 959490c5、対応lock、旧イメージboxing-talking-php:s8-8.5.12（sha256:73cc5ddeb8465e088adc624aa02b7ecf5c15abf1c123a723863ba4644e81f5f8）、S8保存dump/storage。S9一時領域にs8-composer.json/lock、s8-storage-backup.tar.gz、php85-verified.sqlを保持し、S9最終DBはphp85-final.sqlへ保存。restore DBに既存ユーザー1件を保持。復旧時は同じcode/lock/image/APP_KEY/storage/DBの組を専用環境へ戻す。破壊的reset/強制削除や既存DBへの上書きをしない。tmpは永続保存先ではなく、本番用backupの代替ではない。

## サポート・監査・公開前の残課題

2026-10-22に公式と実監査を再確認。

| 対象 | 結果 |
| --- | --- |
| PHP8.5 | active 2027-12-31 / security 2029-12-31 |
| Laravel13 | bugfix Q3 2027 / security 2028-03-17 |
| Composer audit | 既知4advisories / 3packages、Laravel0。aws/aws-sdk-php2、firebase/php-jwt1、mtdowling/jmespath.php1 |
| npm audit（全依存） | 脆弱と判定されたパッケージ111: critical7/high72/moderate29/low3 |
| npm audit --omit=dev | 同24: critical0/high15/moderate8/low1 |
| Node16（PHP image内） | 2023-09-11 EOL |
| Node21（既存docker/node/Dockerfile） | 2024-06-01 EOL |
| MySQL8.0 | 2026年4月EOL。8.0.21を検証用に維持 |

npmの数字は脆弱と判定されたパッケージ数であり、重複を除くCVE件数ではない。--omit=devでもbuild系パッケージを含む。browser bundleや本番の攻撃可能性を一律に実証した数字ではなく、該当経路を評価して対応が必要。全依存criticalは@vitest/coverage-v8、@vitest/ui、handlebars、proxy-addr、tar、tinypool、vitest。監査回避・npm audit fix・依存更新は行っていない。詳細はnpm-audit.json / npm-audit-production.json。

**機能と再構築の検証が成功しても、この構成を本番公開可能とは判定しない。** 公開前に別途、依存脆弱性対応とNode/MySQLの対応版への更新、配布/ビルド環境を確定する必要がある。

- PHP/Laravel: [PHP公式サポート](https://www.php.net/supported-versions.php)、[Laravel公式サポート](https://laravel.com/docs/13.x/releases#support-policy)。
- Node: [公式Release schedule](https://github.com/nodejs/Release)。
- MySQL: [公式EOL告知](https://www.mysql.com/support/eol-notice.html)、[8.0 release notes](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/)。

## 別途必要なデプロイ作業

本作業では本番設定を参照せず、外部サービス・本番へ接続/反映していない。公開前の別タスクで次を確定・検証する。

1. 監査残件とEOL Node/MySQLの対応方針、更新・再検証。
2. 本番のPHP拡張/ini、環境変数とAPP_KEY、HTTPS終端/信頼プロキシ、Cookie/CSRF/CORSを実構成で確認。
3. MySQLの実データbackupを永続保存し、移行と別環境へのrestore、停止時間・ロールバック判断を確認。履歴migrationの再実行や安全未確認のdownを使わない。
4. SMTP/S3等の接続・権限・送信先、queue workerの監視/再起動、cron/scheduler、ログ・障害監視を確認。
5. release手順、構築物/lockの配布、config/route/view cacheとworker更新の順序、運用責任者の判断を確定。

## 最終レビュー

最終Reviewerがソース不変・空環境導入・自動テスト・MySQL移行/復元・保存互換性・ブラウザ登録までの証跡を確認し、必須指摘・未実施ゲートなしと判断。レビュー後のbackend全件再実行は170成功/既存1skip/440assertions（backend-tests-final.log）、git diff --check成功。拡張一覧もS8と完全一致。**S9の機能・再構築検証を完了と判定する。本番公開承認は行わず、上記監査/EOL/運用課題を別途引き継ぐ。** 変更は文書だけ・未コミット、push/本番反映なし。
