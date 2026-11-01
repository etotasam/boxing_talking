# S7: PHP 8.3→8.4 実行記録

> 履歴文書（2026-10-22作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## 状態

**S7完了。実装・必須検証・最終Reviewer確認済み。S8未着手。**変更は未コミット、push・本番反映なし。

2026-10-22、具体計画の提示・Reviewer設計確認後、ユーザーの「go ahead」で承認を取得した。メインが実装・検証、Reviewer subagentが設計・差分を確認した。

## 実行対象と版

- worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。
- branch: `codex/laravel-php-s7`、基点HEAD: `6b62b109bb0333c2245eb2b17c9aeebb972ea55d`（S6完了）。主checkout・旧branch・旧DBを保持。
- PHP **8.3.35→8.4.27**、Laravel **13.38.0固定**。Composer2.9.4、イメージ内Node16.13.2、MySQL8.0.21を維持。
- 公式base: `php:8.4.27-fpm-trixie@sha256:070c5a1dac19c108905c09093e3f5cf228ece8feaea84e33135b3da99de32946`、linux/amd64。
- 構築イメージ: `boxing-talking-php:s7-8.4.27`、ID `sha256:50c620788c2d05ce1d80a911c6c8c9284b58ef26887682ce9b34a2334165c061`。ビルド成功、実行版とCLI/FPM両経路を確認。

## 実装

- 4例外のpreviousとTitleRepository/interfaceのorganizationId、計6宣言をnullable明示へ変更。省略/null/値ありの意味を維持。
- CSVのfputcsv2か所でescapeを従来のバックスラッシュとして明示。8.3で取得した公開outputの出力と8.4の出力をバイト比較して一致。
- native sessionの非推奨6設定をコメント化。アプリからraw PHP sessionの直接利用は見つからず、Laravel Store独自のID生成を確認。実値はnativeが32桁/16進数、Laravelが従来の40文字。Cookie名・guard・保存先・serializationは維持。
- PHP要件を^8.4へ更新。DockerのComposerで`update --lock --no-install --no-scripts`を実行し、全120パッケージのversion/referenceを維持。
- lockはcontent-hash/platformとfirebase/php-jwtの取得URL2か所が更新された。同一commitのまま公式リポジトリ移転先googleapisを指す。旧GitHub URLからの公式リダイレクトを確認済み。
- READMEへ実行版と互換設定を反映。新しい環境変数、API仕様・DBスキーマ・frontendコードの変更なし。

## 検証

| 項目 | 結果 |
| --- | --- |
| 更新前全backend | 163成功/既存1skip/392assertions |
| 追加テストの8.3での事前確認 | 既存1件を含む8成功/51assertions |
| 更新後全backend | **170成功/既存1skip/440assertions** |
| 検出比較 | 旧164識別子すべて保持、追加7、計171 |
| PHP構文 | 手書きコード等240ファイル成功 |
| Composer | validate/platform要件/実install/install dry-run成功 |
| CLI拡張 | 8.3との増減0。必要な実拡張・ini・Tokyo timezone・E_ALL・SQLite往復成功 |
| FPM実HTTPS | sapi=fpm-fcgi、PHP8.4.27、secure=true、実拡張/ini/SQLite往復成功 |
| 実HTTP/HTTPS主要フロー | artisan HTTPとFPM HTTPSで各23項目成功 |
| CSRF実HTTP/HTTPS | web更新メソッド・送信元・token各条件とSanctum、135通り成功 |
| 保存互換性 | 8.3作成のHTTP/HTTPS認証session・cacheを同origin/APP_KEY/configの8.4で読取り/更新成功 |
| 旧ジョブ | 8.3で投入→8.4実worker→ローカルSMTP→実受信tokenで本登録/新規login成功 |
| MySQL | S6dumpを専用DBへ復元、35履歴・既存データ保持、主要read/write成功 |
| MySQL回帰 | 専用rollback DBで5成功/41assertions、同DBに35履歴あり実MySQL使用を確認 |
| 日次処理 | Tokyo境界テスト成功。実コマンドでも2日前だけ削除、前日/当日/active保持 |
| 旧token・ログ | 期限NULL/日時cast/read-writeとhash/abilities維持、3ログ出力成功 |

追加7ケースは、例外4種のmessage/code/previous、省略/null時の団体横断削除2ケース、CSV1ケース。CSVにはcomma/quote/backslash直後のquote/newline/null/空値を含める。型宣言だけをなぞるテストは追加していない。

## ブラウザ

- loopback HTTPで通常/guest/admin login/logout、一般ユーザーの管理URL拒否、一覧・詳細、管理者フォーム表示を確認。
- 通常/guestのコメント投稿成功。reload後に通常コメント1件保持、guestコメントは一般DELETE401/管理者DELETE200を実HTTPで確認し、ブラウザ再表示でも消失を確認。未提供の削除UIは追加していない。
- guest投票で合計5→6票、結果表示更新を確認。
- 過去試合は合成データに対象0件で、空一覧の案内を確認。
- ブラウザ仮登録→database queue実worker→ローカルSMTP受信HTMLのリンク→本登録成功表示→新規loginまで確認。最終user1/pre_user0/jobs0/failed_jobs0。
- ブラウザのHTTPS再検証は計画どおり行わず、HTTPSはCA検証付き実HTTPで補完。OSの証明書登録・警告迂回・証明書検証無効化なし。

### SMTP受信環境の復旧

初回のブラウザ登録では、旧S5のSMTP11033プロセス停止によりconnection refused。MailSendJobは当該仮登録を削除し、失敗ジョブ1件を残した。アプリの更新起因とは扱わない。

S7専用loopback SMTP11036を起動し、S7専用Compose内の接続先だけを変更。同じテストアカウントでブラウザ仮登録から再実行し、実worker送信・受信メール・本登録・loginを確認した。旧ジョブの失敗1件は接続先と対象emailを照合し、証跡を一時領域へ保存してからそのfixtureだけqueue:forgetで整理した。製品コードやメールの例外処理は変更していない。

## 診断と残リスク

- 新規の未説明PHP診断なし。コンテナ起動ログのPHP Deprecated/Warning/Fatal/Parse一致0。
- Composer autoloadには既存の2テストクラスnamespace不一致の通知がある。対象クラスは検出一覧と全テストに残り、今回の変更対象外。
- MySQL回帰のartisan実行にはS6にも存在した`--configuration`二重指定のCLI警告があり終了コード1。テスト自体は5成功、専用MySQLの履歴と実状態を確認。PHP8.4の新規非推奨とは区別する。
- 追加テストの初回では複合主キーのTitleに単一idを前提とするassertModelExistsを使って失敗。既存と同様の全キーによるDB検証に修正して8.3/8.4で成功した。業務期待値の変更ではない。
- Composer auditは既知4件/3packages（aws/aws-sdk-php2、firebase/php-jwt1、mtdowling/jmespath.php1）、Laravel0、新規例外なし。audit終了コード1はこの既知残件による。
- PHP8.4.27の公式changelogには前段階の重大2件の修正が掲載されている。環境全体に脆弱性がないとは判断しない。
- frontend Vitest/build/lintはS7で未再実行。frontendコード・API契約を変更せず、全体計画の中間PHP段階の条件に従う。S6のfrontend204成功は今回の結果と混同しない。
- 本番・外部SMTP・S3・公開デプロイの検証なし。S5で記録した既存表示課題の原因や解消も断定しない。

## 環境・証跡・復旧

- `/private/tmp/boxing-upgrade-s7/compose.yml`、project `boxing-upgrade-s7`。専用tmpfs MySQL、vendor/storage/bootstrap-cache/.envを分離。
- loopback: artisan18083、HTTP→FPM18084、TLS→FPM18443、別origin TLS18444、Vite13004。HTTP/HTTPSは別FPMサービスでAPP_URLとSecure Cookieを適切に分けた。
- ローカルSMTP11036、受信HTMLプレビュー11035。実workerはstop-when-emptyで停止。秘密値・Cookie・JWT・受信メールはGitへ含めない。
- S6復旧点: HEAD6b62b109、`boxing-talking-php:s3-8.3.35`、`php83-before.sql`、`composer-s6.json/lock`、`php83-ini/`、元のS6専用runtime/storage。
- S7確認済みDB: `php84-verified.sql`（30,859 bytes）。一時領域なので永続バックアップとは扱わない。旧DB・dumpを保持し、復旧はコード/lock/イメージ/保存データの組で行う。reset --hard・旧DB初期化・再帰的強制削除を使わない。
- 主なログ: baseline-tests/new-tests-php83/backend-tests、test-detection.json、build/composer/platform/php-lint、http-results/http-cli-results、csrf-http-matrix、compat-result/http-session-compat、fpm-http-runtime、mysql-regression、daily-check、audit、final-state。
- ブラウザ証跡: browser-normal-comment、browser-normal-permission、browser-guest-vote、browser-admin-form、browser-past-empty、browser-after-delete、browser-registration-success、browser-signup-login。受信メール/JWTを含む画面URLは結果文書へ転記しない。

## 参照

- [承認済みS7計画](2026-10-22-laravel-php-s7-plan.md)
- [全体計画](2026-10-19-laravel-php-upgrade.md)
- [PHP8.4.27修正](https://www.php.net/ChangeLog-8.php#8.4.27)
- [php-jwt公式移転先](https://github.com/googleapis/php-jwt)
## 最終確認

Reviewerは必須指摘・未実施ゲートなし、追加修正不要と判断。終了前の全backend再実行も170成功/既存1skip/440assertions、終了コード0。git diff --check成功。S7完了としてS8前で停止する。
