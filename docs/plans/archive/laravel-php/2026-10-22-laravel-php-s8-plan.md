# S8: PHP 8.4→8.5 実行提案

> 履歴文書（2026-10-22作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

Laravel 13.38.0を維持し、PHP8.4.27から8.5.12へ更新する。先にPHP8.4のまま必要なライブラリ2つを更新して検証し、その後PHP8.5へ進める。本書は実装承認前の具体案。S9は開始しない。

## Background / Context

2026-10-22 JST確認。

- worktree: /Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking。
- 開始branch: codex/laravel-php-s7、HEAD: 225c5b0c97660d4c94489c2486258f9d301877b5。S7コミット済み、作業ツリーclean。
- Docker実版を再確認: PHP8.4.27 / Laravel13.38.0。Composer2.9.4、イメージ内Node16.13.2、MySQL8.0.21は維持する。
- S7最終基準: backend171識別子=170成功/既存1skip/440assertions。CLI/FPM、実HTTP/HTTPS、MySQL、ブラウザ主要フロー成功。今回まだ全件は再実行していない。
- S7専用Composeとphp84-verified.sql（30,859 bytes）が存在する。実装前に新しいdump、storage、コード/lock/イメージの対応と復元を再確認する。一時領域は永続バックアップとは扱わない。
- 公式php:8.5.12-fpm-trixie配布確認済み。index digest: sha256:f665ad19c093eee54db3a03c89102d6828b1bbf4f327689e5947a8686c6585a1。
- composer prohibits php 8.5.12 --lockedで拒否するのはnette/schema1.3.2（PHP8.1–8.4）とnette/utils4.0.5（PHP8.0–8.4）の2つ。Laravel→league/commonmark→league/config→nette/schema→nette/utilsの依存で、手書きコードの直接参照は見つからない。
- 候補schema1.3.3はPHP8.1–8.5、utils4.0.8はPHP8.0–8.5を許可することを公開メタデータで確認した。
- PHP8.4で対象2つを版指定したpartial update --minimal-changes --dry-run --no-scriptsは成功。0追加/2更新/0削除、Laravel更新なし、監査は既知4件のまま。lock/vendorは変更していない。
- 手書きの既知対応箇所はphp.iniのdisable_classes/report_memleaks、config/database.phpのPDO::MYSQL_ATTR_SSL_CA。register_argc_argvは既にOff、opcacheを外部ロードする有効設定はない。
- 既存MailSendJobTestは登録メールのMarkdown実描画も検証するため、ライブラリ更新の回帰確認に利用できる。

## Scope

### In Scope

- 新規branch codex/laravel-php-s8をS7コミットから作成する。
- PHP8.4でnette/schema1.3.2→1.3.3、nette/utils4.0.5→4.0.8を先に更新・検証する。直接依存への追加はせず、Composerによるlock/vendorの部分更新を行う。
- DockerfileのPHPを8.5.12-fpm-trixieと上記digestで固定する。Composer/Node/MySQLは維持する。
- PHP要件を^8.5へ更新しlockのplatform/hashをComposerで整合させる。
- php.iniの削除済みdisable_classesと非推奨report_memleaksの有効指定をコメント化する。register_argc_argv=Offを維持し、他の設定は必要な互換修正に限る。
- config/database.phpのPDO::MYSQL_ATTR_SSL_CAをPdo\Mysql::ATTR_SSL_CAへ置き換える。pdo_mysql存在判定と既存の環境変数・array_filter・SSL CA設定値を維持し、TLS条件や証明書検証を変更しない。
- PHP8.5固有の非互換/非推奨/拡張変更を実利用と照合し、実行して確認する。必須の追加対応が見つかれば根拠と最小案を提示する。
- 変更に必要なREADME、計画/結果/復旧記録。既存テストで不足する動作に限るテスト補完。

### Out of Scope

- Laravelの版変更、依存の一括更新、新機能、API/DBスキーマ/認証/エラーコードの仕様変更。
- 本番・外部SMTP/S3・デプロイ、OS信頼ストア変更、新しいツールの導入。
- frontendコード、Node/React/Vite/MySQL更新、PHP8.5新機能への書き換え、不要なリファクタリング。
- S9の最終統合検証、commit/push。コミットは別途git-commit手順で扱う。

## Impact Area

| 対象 | 変更・確認 |
| --- | --- |
| backend/composer.lock | Nette2つの版と必要なPHPメタデータ |
| backend/composer.json | PHP下限^8.5 |
| docker/php/dockerfile | PHP8.5.12/trixie/digest固定 |
| docker/php/env/php.ini | disable_classes/report_memleaksの有効指定を整理 |
| backend/config/database.php | PDO定数の移行。CAの指定意味を維持 |
| メール/設定管理 | CommonMark/league/config経由のNette利用。既存Markdown描画・実メールで回帰確認 |
| backend/tests | 171既存ケースの維持。不足が判明した公開動作だけ補完 |
| backend/README.md、docs/plans | 実版・設定・診断・検証・残課題・復旧情報 |

## Options

1. PHPだけ先に8.5へ上げる。既存NetteのPHP上限制約で導入に失敗する。
2. PHP8.4上で対象2つを更新・テストしてからPHP8.5へ上げる。ライブラリ更新とPHP更新を分けて原因を追跡できる。全backendテストは中間・最終で必要となる。
3. 依存全体を最新版へ更新してPHP8.5へ上げる。不要な変更が増え、Laravel固定と原因切り分けが難しくなる。

## Decision

案2を提案する。まず確定候補schema1.3.3/utils4.0.8だけを更新し、それ以外の118パッケージのversion/referenceとLaravel13.38.0を維持する。取得URL等のメタデータ差分は別途確認・説明する。PHP8.5実行時に追加対応が必要なら無断で対象を広げず、根拠と最小案を再提案する。

メインが調査・設計・承認後の実装とテストを担当し、Reviewerのみsubagentを利用する。具体案のReviewer確認・ユーザー承認後に実装する。

## Rationale

ユーザーと確認した「必要なライブラリをPHP8.5対応版にしてからPHPを更新する」順序を守り、S7の動作を復旧点として保持する。Netteは同一系列内の候補を採用し、版制約を偽装せず実PHP8.5で動作を確認する。ブラウザ確認をS9へ先送りしない。

## Tasks

- [x] S7コミット/clean状態/実版/復旧ファイルの存在、PHP8.5公式配布と移行情報を確認。
- [x] Nette2つの対応版を照会し、PHP8.4で2つだけのdry-run成功を確認。実更新なし。
- [x] Reviewerが設計を確認し、必須指摘なし・具体案の承認依頼へ進めると判断（2026-10-22）。
- [x] 具体案を提示し、ユーザーが「go ahead」で実装・検証を承認（2026-10-22）。
- [x] codex/laravel-php-s8を作成し、コード/lock/8.4イメージ/DBdump/storage/iniの復旧点を保存する。
- [x] S8専用Compose/tmpfs MySQL/vendor/storage/bootstrap-cache/合成.env/ローカルSMTPを用意し、S7dumpを復元する。DB名・接続先・受信環境を確認する。
- [x] PHP8.4のまま更新前の全backend/検出/実版/拡張/ini/監査を記録し、同origin/config/APP_KEYの保存session/cache/jobを用意する。
- [x] 候補2つだけをpartial updateし、他パッケージversion/reference固定・composer platform/validate・全backend/メール描画を確認する。中間ゲート通過前にPHPを上げない。
- [x] 8.5イメージを別タグでビルドし、PHP下限/lockメタデータ/PDO定数/ini/READMEを更新する。旧イメージ・データを保持する。
- [x] PHP8.5の実拡張/起動/Composer/非互換・非推奨と下記の自動・実HTTP・DB・ブラウザ検証を行う。
- [x] Reviewer最終差分確認、必要な修正、最後の関連テストを実施する。
- [x] 結果/残課題/復旧情報を保存し、S8完了後にS9前で停止する。

## Test Plan

### 実行環境と依存

- PHP/artisan/PHPUnit/ComposerはDocker経由のみ。8.4中間・8.5最終でComposer validate/check-platform-reqs/install dry-run・実install・変更依存/監査を確認。
- 全backendをS7基準、Nette更新後8.4、PHP8.5の3地点で確認し、失敗の発生段階を分離する。
- CLIと実HTTPS FPMのPHP8.5.12/SAPI、読み込みini、E_ALL、Tokyo timezone、pdo_mysql/pdo_sqlite/SQLite3/mbstring等の実拡張・SQLite往復を確認する。
- PHP8.5のOPcache常時組込みによる拡張増加は意図した差として記録し、外部opcache.soの二重ロードを行わない。既存拡張の欠落や新規診断を見逃さない。
- pdo_mysql有無の設定分岐、CA指定あり/なしでconfigへ渡る値とキーの意味を隔離プローブで比較する。実MySQL読み書きも確認する。本番のTLS接続確認とは扱わず、SSL検証無効化や本番秘密情報参照をしない。
- 移行ガイドのcast/配列キーnull/Reflection/SPL/cURL/シリアライズ/PDO/コンパイル診断等を実利用と照合する。vendor内の文字列一致だけで不具合と決めず、版ガードや実行経路を確認する。警告の一括抑制・vendor手編集・ignore-platform-reqsは禁止。
- 既知監査4件/3packages、Laravel0件と比較する。新規例外追加や監査無効化で解決しない。

### 自動テスト

- 旧171識別子をすべて維持し、170成功/既存1skip/440assertionsからの増減・理由を記録する。既存skipとPSR-4通知を新規診断と分ける。
- 既存MailSendJobTestのMarkdown実描画・登録リンク/内容、認証・認可・入力・API形状、CSV固定バイト列、nullable、日時境界、DB制約、CSRF61ケースを含む全件を確認する。
- 新規テストの件数目標は設けない。既存で保証できる同じ動作のテストは重複追加せず、具体的な不足が判明した動作だけ補完する。
- frontend/API契約は維持する。S0/S9でbuild/lint、中間は認証/API影響時に関連Vitestという全体計画に従い、追加影響があれば実行し、未実施理由を記録する。
- S7のMySQL artisan --configuration重複の既知CLI警告は、実DB接続・成否と区別して記録する。無関係なテスト基盤の修正を混在させない。

### DB・保存データ・実HTTP・ブラウザ

- S7dumpをS8専用MySQLへ復元し、35履歴と既存データ保持、主要read/write・制約・DB回帰/日次境界を確認。PHP段階なので独立freshの全履歴再確認は必須としない。既存開発DBへfresh/RefreshDatabaseを向けない。
- 8.4保存のHTTP/HTTPS認証session/cacheを同じorigin/config/APP_KEYの8.5で読み書きし、旧ジョブを8.5実worker→S8専用ローカルSMTPで処理する。Cookie名/guard/cache接頭辞/保存形式/ID生成を維持。
- artisan HTTPとFPM HTTPSの主要認証・権限・投稿/削除・CSRF・CORS、送信元/tokenの組み合わせを確認する。S6で採用したsame-originのトークン省略を維持し、HTTP一律拒否とは判定しない。
- loopback HTTPの実ブラウザで通常/guest/admin login/logout、一般の管理URL拒否、一覧/詳細、コメント投稿とreload、投票、管理者フォーム、過去一覧を確認する。未提供の削除UIは、ブラウザ投稿を実HTTPの一般拒否/管理者成功と再表示で補完する。
- 実ブラウザ仮登録→実queue worker→ローカルSMTP受信HTMLリンク→本登録成功→新規loginを確認する。合成宛先だけを使う。S7のSMTP停止を踏まえ、接続・受信確認後に送信を開始し、失敗時の仮登録/failed_jobsも確認する。
- HTTPSはCA検証付き実HTTPクライアントで補完し、実ブラウザHTTPSを確認したとは扱わない。OS信頼ストア変更・証明書警告迂回・curl -kなし。必要性が生じれば別途提案する。
- 必須未実施項目やReviewer重大指摘が残れば保留し、S9へ進まない。

## Risks

- PHP要件の上限が解消しても、実PHP8.5で依存の非推奨が残る可能性がある。追加対応が必要なら由来と最小案を示す。
- OPcache組込み・PDO・SQLite・ini・周辺ライブラリの変化。CLIだけで完了とせずFPM実HTTPとDBを補完する。
- PHPイメージ再構築時の既存Node16導入失敗。Node更新を混在させず、必要なら停止して再提案する。
- ブラウザの非同期処理・古いCookie・受信環境停止を更新不具合と混同しない。保存データ/同originを意図して用意し、結果と原因を分ける。
- 本番/外部サービス・TLS構成の本番検証は対象外。監査4件が残るため公開可能とは判断しない。
- 復旧はS7コミット225c5b0c、S7 lock/8.4.27イメージ、更新前DBdump/storage/iniの組で行う。旧DB/branch/イメージを保持し、reset --hardや再帰的強制削除を使わない。

## References

- [全体計画](2026-10-19-laravel-php-upgrade.md)
- [S7結果](2026-10-22-laravel-php-s7-result.md)
- [PHP8.5非互換](https://www.php.net/manual/en/migration85.incompatible.php)
- [PHP8.5非推奨](https://www.php.net/manual/en/migration85.deprecated.php)
- [PHP8.5その他変更](https://www.php.net/manual/en/migration85.other-changes.php)
- [PHP8.5.12](https://www.php.net/ChangeLog-8.php#8.5.12)
- [Nette Schema](https://packagist.org/packages/nette/schema)
- [Nette Utils](https://packagist.org/packages/nette/utils)

事前の隔離CLIプローブで、PHP8.4のPdo\Mysqlクラスの存在と、ATTR_SSL_CAが従来定数と同じキー値であることを確認した。設定ファイルの変更やTLS接続検証はまだ行っていない。
