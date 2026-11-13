# S3: Laravel 10のPHP 8.2→8.3 実行結果（2026-10-21）

> 履歴文書（2026-10-21作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## 状態と範囲

- **S3完了**。実装・必須検証・最終Reviewer照合を完了。未解決の実装・必須検証の指摘なし。S4は開始しない。
- 基点 `e8f7015a`、ブランチ `codex/laravel-php-s3`。既存worktree `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking` を使用。
- ユーザー承認済みのPHP主更新のみ。Laravel・依存lock・認証/API/DB仕様・Nodeの更新なし。未コミット、push・本番反映なし。

## Tasks

- [x] 公式移行ガイド・配布状況を確認し、具体案をReviewerが確認する。
- [x] S2のPHPイメージと合成データ入り専用DBの復旧基点を保存する。
- [x] PHP・Composer取得元を固定してイメージをビルドする。
- [x] CLI/FPM設定・拡張・Composer・構文・全バックエンドテストを確認する。
- [x] 専用MySQLの引継ぎ・主要読み書き、両HTTP経路、メールキュー、日次処理、ログを確認する。
- [x] ブラウザ主要操作・最終Reviewer確認を終えて記録し、S4前で停止する。

## 実行環境・実装

| 対象 | 更新前 | 更新後 |
| --- | --- | --- |
| PHP | 8.2.30 | 8.3.35 |
| Laravel | 10.50.3 | 10.50.3（維持） |
| Composer | 2.9.4 | 2.9.4（維持） |
| Node / npm | Node16.13.2を導入する既存手順 | 16.13.2 / 8.1.2（手順維持） |
| OS | Debian 13/trixie | Debian 13.7/trixie |
| platform | linux/amd64 | linux/amd64 |

- `docker/php/dockerfile`: PHPを `php:8.3.35-fpm-trixie@sha256:d39c9597ccbf6dd86be11e933831e37c6f5fd7719a4571c569d7d208e45e73f8` に固定。
- Composerは `composer:2.9.4@sha256:22a95bd2bc3cf6ff19550a246208138d35f0015602db3d67dc6841945324acc1` から取得。Node導入の既存行は変更せずビルド成功。
- 作成イメージ `boxing-talking-php:s3-8.3.35`、ID `sha256:eea1a60ec115c7cc26283ac5cdcaf4d03543cf0e257b0d52de6bad7ea4b00cbd`。
- 初回ビルドはapt/拡張コンパイル/Node導入を実行して成功。2回目はキャッシュを利用した再ビルド成功。aptやnpmの取得先は可変のままなので、将来の完全な同一イメージ再生成を保証しない。クリーン環境からの総合再構築はS9の対象。
- アプリ・テスト・php.iniに互換性修正は不要だった。composer.json/lockは更新前のSHA256と一致。
- READMEに現在版・取得元・未修正事項を追加。Dockerfileの正式Gitパスは小文字 `docker/php/dockerfile`。

## 検証結果

- CLI/FPMともPHP8.3.35。FPM設定テスト成功。読み込んだiniは `/usr/local/etc/php/php.ini`。timezone Asia/Tokyo、memory_limit128M、error_reporting E_ALL=32767を確認。
- 拡張の増減なし。PDO MySQL / PDO SQLite / sqlite3 / mbstring / curl / DOM / XML等を維持。SQLiteメモリDBで日本語の書込み・取得を確認。
- 既存のディレクトリ全体マウントによりconf.d追加読込みなし。pdo_mysqlは既存php.iniのextension指定で有効。構成の整理は混在させない。
- composer validate / check-platform-reqs / install --dry-runは成功。追加・更新・削除なし。PHP83実環境でlockを使用可能。
- app/routes/database/testsのPHP215ファイルで構文検査成功。
- backend: **98件検出、97成功・既存1スキップ、279assertions、errors/failures0**。S2のJUnitと全98件のクラス/メソッド名を比較し、欠落・追加なし。警告・非推奨・noticeの表示を有効にし新規診断なし。既存スキップはBoxerTitleSnapshotUpdateTest::testSetUp。
- S2専用DBをS3の新規tmpfs MySQLへ復元。更新前dumpと復元直後dumpは完全一致。35件のマイグレーションを保持し、migrateはNothing to migrate。
- MySQLの既存トークン1件のhash/name/abilities/期限NULLを保持。期限日時の保存・cast・NULLへの復元を確認。既存user7/comment4を保持し、HTTP登録・ブラウザ登録とコメント投稿でuser9/comment5へ増加。
- 実HTTPはartisan serve(18081)とNginx→FPM(18082)の両方で各23チェックすべて成功（集約チェックを含む）。CSRF cookie204、欠落/不正419、未認証/通常権限拒否401、通常/管理者login/session/logout、コメント投稿/一覧/管理者削除、不許可Originの非反映を確認。
- メール: FPMで仮登録→database queue→worker DONE→loopback SMTP11029受信→メール内signupパラメーターで本登録200→新規login/session/logout成功。登録対象user1/preuser0/jobs0/failed_jobs0。外部メール送信なし。
- 最初の検証用メールパーサーはtokenパラメーターを想定しリンク未検出で停止した。実テンプレートのsignupパラメーターに合わせて検証スクリプトだけ修正し、再試行成功。アプリ・メール本文の変更はしていない。
- ブラウザ仮登録→完了案内→database queue→SMTP受信→HTMLメール内ボタン→別タブの本登録成功案内→新規ユーザーloginを確認。対象user1/preuser0/jobs0/failed_jobs0。HTTP登録とは別の合成ユーザーで実施。新規login/権限拒否後のホーム画像 `/private/tmp/boxing-upgrade-s3/browser-new-user.png` も保存。
- 日次ゲスト削除: 2日前の削除済みのみ除去、昨日/今日/activeを保持。schedule:list成功。
- Monolog: stack経由のlaravel.log/error.logとtask経由task.logへの一意マーカー実出力成功。
- ブラウザ: 通常ユーザーlogin/logout、試合詳細・既存コメント・投票2票50/50の保持、新規コメント投稿とreload後のセッション/内容保持、ゲストlogin/logoutと新規投票後3票67/33の反映を確認。管理者login→ボクサー登録フォーム表示→logoutも成功。新規一般ユーザーで同じ管理者URLへ直接アクセスするとホームへredirectされ、フォームは表示されなかった。画面のS2表示は前段階からの検証用タイトル・合成データを引き継いだもの。投稿表示の画像 `/private/tmp/boxing-upgrade-s3/browser-comment.png` を保存。
- frontendコード・API契約変更がないためVitest/build/lintはS3で再実行せず。直前S2の204件成功を基準とし、実ブラウザと実HTTPでPHP更新による接続動作を検証する。
- Composer audit: **13件/6パッケージ、終了コード1**。S2からID増減なし。既承認4IDのapply:block例外は変更していない。

- Reviewer最終確認: S3完了の判断は妥当、問題なし。管理者/一般の画面権限・ブラウザ登録/メール/本登録/新規ログイン、各ログ・DB・画像を照合済み。未解決の実装・必須検証の指摘なし。

## 復旧・証跡

- コード/lock基点 `e8f7015a`、旧イメージ `boxing-talking-php:s2-8.2.30`（ID `sha256:967f0c79493da979089eb14c7bf7d7d1365ef5431a8d9d159a92ff27dc1f5740`）。
- S2専用MySQLは停止・初期化せず保持。S2 PHPのみ停止し、S3は別Compose project `boxing-upgrade-s3` とDB `boxing_upgrade_s3` を使用。元の開発/本番DBには接続しない。
- `/private/tmp/boxing-upgrade-s3/laravel10-php82-before.sql`、`restored-before.sql`、検証後 `laravel10-php83-after.sql`、`compose.yml`、`nginx.conf`、build/rebuild/runtime/composer/tests/http/audit等の検証ログを保存。これらは一時資産であり、tmpfsとともに永続的なバックアップ保証ではない。
- S3検証を停止したうえで、基点コードと旧イメージ・S2のDB/Composeに戻すことで前段階を再開できる。依存lock・DB構造変更がないためダウングレード用migrationは不要。S3合成データを保持したい場合は停止前にdumpする。
- JWTを含む受信メール・dump・ログ・環境変数・生成物はGitへ含めない。

## 残リスク・公式資料

- PHP公式に8.3.36と重大な2件の修正（CVE-2026-109618/109619）を確認。実行時の公式Docker `php:8.3.36-fpm-trixie` はnot found、8.3タグは8.3.35を指していた。トップページは21 Oct、ChangeLogは22 Oct表記のため、本書では掲載確認と記録する。
- **8.3.35では2件未修正**。既承認の合成データ/loopback/ローカルSMTP限定の中間検証であり、公開可能の判断ではない。修正イメージ取得後の更新・再検証が必要。
- 既存Composer監査13件、Node16、Bearer認証の既存UUID不整合、HTTPS/本番構成・外部SMTP/S3は今回の解消対象外。
- [PHP 8.3互換性変更](https://www.php.net/manual/en/migration83.incompatible.php)
- [PHP 8.3非推奨機能](https://www.php.net/manual/en/migration83.deprecated.php)
- [PHP公式の版・セキュリティ情報](https://www.php.net/)
- [PHP 8 ChangeLog](https://www.php.net/ChangeLog-8.php)
