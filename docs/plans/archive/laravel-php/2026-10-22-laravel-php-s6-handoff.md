# S6引き継ぎ：Laravel 12→13

> 履歴文書（2026-10-22作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## 最初に行うこと

新しいチャットでは現状確認とS6の具体案の提示から始める。依存・コード・DBの変更は、AGENTS.mdに従って提案・承認後に実施する。S7（PHP 8.4）以降へは進めない。

## 作業場所と基点

- 保存プロジェクトのルートとは別の、以下の既存worktreeで作業していた。
- worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`
- branch: `codex/laravel-php-s4-s5`
- S5完了コミット: `c1dae83e`（Laravelを12へ更新し日時境界テストを追加）
- S4中間コミット: `664033da`（Laravelを11へアップグレードして中間検証）
- 引き継ぎ文書作成前のworktreeはclean。この文書のみ新規・未コミット。S6用ブランチは未作成。
- 最初に実際のcwd・branch・HEAD・statusを確認する。保存プロジェクトの主checkoutや既存worktreeを無断で切り替えない。S6用ブランチ/作業場所の案も提示する。

## 必読文書

すべて上記worktreeからの相対パス。

1. `AGENTS.md`、`docs/development/backend.md`。frontendを調査・検証する際は`docs/development/frontend.md`も読む。
2. `docs/plans/archive/laravel-php/2026-10-19-laravel-php-upgrade.md`：全体計画、S6固有の承認事項、共通テスト、復旧方針。
3. `docs/plans/archive/laravel-php/2026-10-21-laravel-php-s5-result.md`：現在の実装、全検証結果、既知の残課題。
4. 必要に応じ`docs/plans/archive/laravel-php/2026-10-21-laravel-php-s4-result.md`：SQLite互換修正・テストfixture補完の理由。

過去チャットの全文を読む必要はない。実装状況はGitと文書を基準に確認する。

## 現在のバージョン・検証基準

- Laravel12.70.1、PHP8.3.35、Composer2.9.4、Sanctum4.3.3、Carbon3.15.0、PHPUnit11.5.57、Collision8.9.5。
- PHPイメージ`boxing-talking-php:s3-8.3.35`。イメージ内Node16.13.2。frontend検証はhost Node22.10.0/npm10.9.0。
- backend103件検出＝102成功/既存1skip/320assertions。frontend52ファイル204件成功。MySQL追加回帰5件41assertions。既存テストの検出数・識別子を更新後も比較する。
- MySQL新規構築35migration、引継ぎDB、schema/外部キー、CLI/FPM両HTTP、通常/guest/admin、投稿/投票、仮登録→実queue worker→ローカルSMTP→受信リンク→本登録→新規login確認済み。
- Laravelの監査例外4件は撤去済み、S5監査でLaravel0件。全依存では4件/3packagesが残った。PHP8.3.35の重大2件もS5では未修正。これらはS5時点の記録であり、開始時に現状を再確認する。

## S6で特に提案・確認すること

- Laravel12→13と必要な関連依存だけを更新。PHP8.3系を基準とし、PHP8.4/8.5への移行と混ぜない。PHPパッチの残課題の扱いも開始時に提案する。
- Laravel13公式upgrade guide・実際の依存制約を確認する。PHPUnit12移行後もテスト検出を維持し、警告/非推奨を一括抑制しない。
- CSRF/送信元検証：既存VerifyCsrfToken/Kernel/Sanctum設定を照合する。標準動作を採用するか現行のトークン必須条件を維持するかを、実装前に提案して承認を得る。
- HTTP/HTTPS、same-origin/same-site/cross-site、トークン有無・正否ごとの期待値を整理する。隔離HTTPS経路/TLS終端・必要なproxy設定を提案し、アプリがsecureと認識することも検証する。ブラウザの証明書警告を迂回しない。HTTPS必須確認が未達ならS6完了とはしない。
- セッション名・キャッシュ接頭辞・保存内容の互換性を確認。既存Kernel/Provider構造を新ひな型へ一括置換しない。
- Reviewerは必ずsubagent。設計案レビューと最終差分レビューを行う。他役割のsubagentには事前のユーザー承認が必要。
- backendのPHP/Composer/artisan/PHPUnitはDockerのみ。`.env.production`/本番秘密情報を参照しない。外部公開・外部SMTP・本番データ利用を行わない。

## 既知の事項

- Laravel11のSQLite native schema処理でboxing_matchesの外部キーが保持され、テストfixture不足が顕在化。5クラスに必要なSeeder等を補完済み。期待値/本番制約は緩めていない。
- snapshot表の主キー切替にSQLite限定互換分岐を追加済み。MySQL経路と適用済み履歴を再実行しない。
- コメント削除UIは未接続。管理者削除成功/一般拒否は実HTTPで代替しReviewer確認済み。削除UIを勝手に追加しない。
- 画面遷移後のコメント一時重複表示を観測。API1件/reload後1件。更新前の再現確認はなく原因未確定。S5結果の残課題を参照。

## 検証環境・一時証跡（存在を再確認する）

- Compose project `boxing-upgrade-s5`、定義`/private/tmp/boxing-upgrade-s5/compose.yml`。
- frontend`http://127.0.0.1:13002/`→Nginx/FPM18082。artisan serve18081。DBはMySQL8.0.21、ホスト公開なし。
- DB `boxing_upgrade_s5`、fresh/rollback専用DB。旧段階DBは保持。初期化しない。
- ローカルSMTP11033、受信HTML preview11034。queue/databaseと合成データのみ。
- `/private/tmp/boxing-upgrade-s5/`に検証ログ・audit・schema・画像。復旧基点`laravel11-before.sql`、S5最終検証DB`laravel12-verified.sql`。
- tmpfs DB/一時ファイルは永続バックアップではない。新チャットからプロセスのsession IDは引き継がない。稼働/ポート/データ保持を確認してから必要な環境を用意する。
- 受信JWT・メール・dump・秘密情報・生成物はコミットしない。検証用資格情報はこの文書へ転記しない。
