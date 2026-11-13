# S9 最終統合検証・引き継ぎ計画

> 履歴文書（2026-10-22作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

S8 commit 959490c5aa40b96368cb9fae55383a8a13dba0b5のLaravel13.38.0/PHP8.5.12を最終構成として再構築し、全自動テスト・DB移行・実HTTP/ブラウザ・メール/非同期/日次処理を総合確認する。ユーザーはS9の内容説明後に「実行しましょう」と実行を依頼済み。既に説明した検証範囲で進め、アプリ修正・依存更新が必要な場合は別途提案する。

## Background / Context

2026-10-22 JST。現在codex/laravel-php-s8、S8コミット済み・clean。S8はbackend171検出=170成功/既存1skip/440assertions、MySQL5成功41assertions、実HTTP/HTTPS各23・CSRF135、ブラウザ登録まで成功。依存監査4件/3packagesは残る。S8の一時Compose・runtime・dumpが存在する。S0一時ディレクトリは現存しないがS1保存のlaravel8-before.sqlを利用できる。S9では以前の成功を再実行結果の代用にしない。

## Scope

### In Scope

- S8を基点にcodex/laravel-php-s9を作成。検証用一時環境・合成データを別に用意し、旧環境の復旧点を保持。
- 固定Dockerfileを別タグで再ビルドし、空vendorからcomposer install。composer updateせずlock/JSON不変と120依存のversion/referenceを照合。
- frontendもGit管理ソースの一時コピーとlockからnpm ciし、Vitest/build/lint。既存node_modulesの手編集やCypress実行なし。
- 専用MySQLの空DBへ全履歴適用と、旧Laravel8相当dumpから最新への未適用分移行・データ保持・スキーマ比較。S8最終dumpも別の実HTTP/ブラウザ用DBに復元する。
- CLI/FPMの実版・拡張・ini・PDO/SQLite、全backend171ケース、MySQL回帰、HTTP/HTTPS主要認証・CSRF・CORS、通常/guest/adminブラウザ、投稿/削除補完/投票/実メール登録、実キューワーカー・日次処理・ログ。
- サポート期限、Composer監査・frontend監査、既知警告と配布/構築上の制約を再確認し、README/最終結果/復旧/別途デプロイ課題を記録。
- Reviewer設計確認・最終証跡確認。検証用プローブは一時領域に限定し、秘密・JWT・メール・cookie・生成物はコミット対象にしない。

### Out of Scope

PHP/Laravel/Node/MySQL/依存の追加更新、新機能、API/DB/権限仕様変更、本番/外部SMTP/S3、OS証明書信頼変更、デプロイ、commit/push。問題発見時にテスト期待値や警告抑制で通過させない。

## Impact Area

原則アプリコード/lockは不変。docs/plans、backend/README.mdと検証用一時ファイルのみ。frontendは一時ソースコピーでテストとbuildを行い、本番設定を参照しない。MySQL検証は専用DBだけを使用。

## Options

1. S8証跡のみを最終結果とする。再現性・frontend・空DB/旧DB統合の確認が不足する。
2. S8版を固定した分離再構築と総合検証。検証時間は増えるが、導入から主要動作まで確認できる。
3. 残る監査対象やNode/MySQLも更新する。変更範囲が広がりS9の最終確認から逸脱する。

## Decision

案2。メインが検証・文書化、Reviewerのみsubagent。既にユーザーが確認したS9範囲の実行承認を使用し、アプリ修正が必要なら具体案を提示して承認を得る。

## Rationale

既存環境の成功と再構築成功を区別し、S0→S8で守った公開動作・データ・検出テストを最終構成で保証する。セキュリティ監査残件と公開可否は機能検証の完了とは分けて明示する。

## Tasks

- [x] S9実行依頼・S8コミット/clean・既存手順と専用dumpの存在を確認。
- [x] Reviewerが検証計画・境界・復旧・停止条件を確認。
- [x] S9branch・旧lock/image/DB/storageの復旧点を保持。
- [x] 固定Dockerfileを再ビルドし、空vendorから最終lockをinstall・validate/platform/hash照合。
- [x] 一時frontendをlockから再構築しVitest/build/lintと監査。
- [x] 空DB全履歴/旧dump移行/S8最終dump復元とスキーマ/データ/制約を確認。
- [x] backend全件・検出・構文・MySQL・runtime・監査/警告を確認。
- [x] 実HTTP/HTTPSとブラウザ主要フロー・実worker/SMTP登録・日次/ログを確認。
- [x] 復旧点を別DBへ復元確認し、サポート期限・残課題・最終構成/デプロイ引き継ぎを記録。
- [x] Reviewer最終確認・最後の関連チェック、S9結果を報告して停止。

## Test Plan

- Docker内PHP/artisan/Composerのみ。backend170成功/既存1skip/440assertions・171識別子維持を基準にする。テスト追加の件数目標を設けず、不足があれば保証する動作を示して提案。
- frontendはnpm ci（Cypressバイナリ導入を省略し、実行もしない）後npm test -- --run / npm run build / npm run lint。S0/S5基準52ファイル204成功と比較し増減を説明。使用Node/npm実版を記録しイメージ内Node16と混同しない。
- fresh/legacy/runtime/rollback DBを分離し名前を実行前に確認。旧dumpのテーブル件数・主要値を移行前後比較。fresh/legacyのカラム型/null/default・主キー/索引/FKを比較し、AUTO_INCREMENT値や移行バッチ等のデータ依存差は分ける。現存しないS0環境を復元済みと称さない。
- S8保存session/cacheが新vendor/同origin/config/APP_KEYで読めることを確認。実HTTPS FPMとHTTP、CSRF135組合せ・CORS・認証認可をS6承認済み仕様で確認。HTTPSはCA検証clients、ブラウザはHTTP。証明書期限を確認し、OS信頼変更/警告迂回はしない。
- 通常/guest/admin login/logout、一般管理URL拒否、一覧/詳細、投稿/reload、一般DELETE拒否/admin成功/画面reload、投票、管理フォーム、過去一覧。削除UIは未提供なので実HTTPで補完する。
- 専用loopback SMTPを送信前にhealth確認。ブラウザ仮登録→実database worker→受信HTMLの実リンク→本登録→新規login。合成宛先のみ、最終user/pre_user/jobs/failed_jobsを確認。
- 日次ゲスト削除のTokyo境界、旧tokenのnullable expirationとread/write、Monolog3出力、schedule確認。実行時PHP診断と既存PSR-4/テストCLI警告を分ける。
- 最終lock再構築と旧dump復元・データ保持の証跡を保存。tmpfs/一時領域は永続バックアップと扱わない。
- PHP8.5サポート: active2027-12-31/security2029-12-31。Laravel13: bugfix Q3 2027/security2028-03-17を公式で再確認。既知4advisoriesを再監査し、新規例外/監査無効化で解決しない。
- 必須失敗/未実施/Reviewer重大指摘があればS9を保留。残る脆弱性や旧Node/MySQL等の公開阻害要因を明示し、機能確認成功を本番公開承認と扱わない。

## Risks

- 再構築でapt/npm等可変配布の影響が現れる。Node更新やlock更新を混在させず記録/提案する。Dockerfileはbase/Composer digest固定だがapt依存まで完全固定ではない。
- ローカルDB/SMTP/ブラウザの一時状態を更新不具合と混同しない。health・非同期完了・reloadとログで切り分ける。
- frontend監査/既知依存4件/旧Node・MySQLは更新対象外。新たに重大問題を認めた場合は公開可否と別途対応を明示。
- 本番の秘密情報/TLS/S3/SMTP/worker/cron/backup運用は今回実証しない。
- 復旧はS8 commit 959490c5、対応lock/PHP8.5.12イメージ、更新前dump/storageの組。破壊的reset・強制削除・既存開発DBへのfreshを使わない。

参照: [全体計画](2026-10-19-laravel-php-upgrade.md)、[S8結果](2026-10-22-laravel-php-s8-result.md)、[PHPサポート](https://www.php.net/supported-versions.php)、[Laravelサポート](https://laravel.com/docs/13.x/releases#support-policy)。
