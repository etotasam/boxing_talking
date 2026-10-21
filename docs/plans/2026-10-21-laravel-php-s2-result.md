# S2: Laravel 9→10 実行結果（2026-10-21）

## 状態と範囲

- **S2完了**。実装・必須検証・最終Reviewer確認を完了。未解決の実装指摘なし。S3は開始しない。
- 基点 `37eee6e3`、ブランチ `codex/laravel-php-s2`。既存worktree `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking` を使用。
- ユーザーからS2実装の承認を受領。主PHP更新・認証仕様変更・既存DBの初期化・実利用者へのメール送信は対象外。未コミット、push・本番反映なし。

## Tasks

- [x] 公式ガイド・既存設定・S1の基準と復旧手順を確認し、具体案をReviewerが確認。
- [x] Laravel9の合成トークン入りDBをdumpしてS2専用DBへ復元。
- [x] Laravel10と必須周辺依存へ部分更新し、PHP実要件とlock整合性を確認。
- [x] Sanctum用expires_at列を新規マイグレーションで追加。
- [x] PHPUnit10のXMLとテスト検出を移行し、名称対応表で既存96件の継続を確認。
- [x] 新しい期限列のNULL保存と日時保存・castを検証する2テストを追加。
- [x] backend/frontend/監査/MySQL新規・引継ぎ・戻し再適用/実HTTP/Monolog/日次処理を確認。
- [x] ブラウザ・登録メールと非同期ワーカー・本登録までの確認。
- [x] 最終Reviewer確認と結果記録。S3前で停止。

## 実行環境・依存

| 対象 | 更新前 | 更新後 |
| --- | --- | --- |
| PHP | 8.2.30 | 8.2.30（維持） |
| Composer | 2.9.4 | 2.9.4（維持） |
| Laravel | 9.52.22 | 10.50.3（安定版） |
| Sanctum | 2.15.1 | 3.3.3 |
| Monolog | 2.10.0 | 3.12.1 |
| Ignition | 1.7.2 | 2.9.1 |
| Collision | 6.4.0 | 7.12.0 |
| PHPUnit | 9.6.22 | 10.5.66 |

- PHPイメージ `boxing_talking-php:latest`、ID先頭 `967f0c79493d`、Debian13/trixie・linux/amd64。PHPパッチ更新は別作業で未実施。
- PHP要件を `^8.1`、frameworkを `^10.48.29@stable` にし、minimum-stabilityをstableへ変更した。
- `composer update laravel/framework laravel/sanctum spatie/laravel-ignition nunomaduro/collision phpunit/phpunit -W --minimal-changes --no-interaction`。2追加・29更新・2削除。全依存一括更新ではない。
- composer validate/platform要件は成功。lockからのinstall dry-runは差分なし。クリーンダウンロードからの再構築はS9で確認する。
- Monolog独自Handler/Formatterは未検出。既存ログ設定を維持し、stackのerror経路でlaravel.log/error.log、task経路でtask.logへのマーカー実出力を確認した。
- 検証.envはLOG_CHANNEL=singleのため、初回のdefault Log::errorではerror.logを確認できなかった。検証スクリプトで明示的にchannel('stack')を選んで確認し直した。アプリ設定を変更して通したわけではない。
- DB::rawはselect式での使用のみ、手動QueryException生成・旧datesプロパティ・dispatchNow等の直接衝突は未検出。不要なAPI/Kernel/guardの変更なし。

## DB移行

- 新規 `2026_10_21_000000_add_expires_at_to_personal_access_tokens_table.php` で、nullable timestampのexpires_atを追加。既存2019年の履歴やtokenable_id型・ID生成方式を変更していない。
- S1 PHPとViteを停止してから依存更新した。同じbackendを共有する旧版プロセスの継続実行を避けた。S1 DBは停止/削除せず保持。
- S1専用DBに合成トークン1件を追加してdumpし、S2専用DBへ復元。更新前は履歴34件・user4件・token1件。実利用者データではない。
- S2の既存データ入りDBでは新しい1件だけ適用。空DBでは全35件成功。既存トークンのhash/abilities/name等を保持し、expires_atはNULL。MySQLでも期限保存・再取得・NULLへ復元を確認した。
- 複製DBでdown→upを2回行い、期限列以外の既存トークン情報を保持。戻しはexpires_at列の値を失うため、復旧にはdumpを使い、実データを安易にdownしない。
- 最終DB: `boxing_upgrade_s2` / `_fresh` / `_rollback` はすべて移行履歴35件。
- 既存のtokenable_idは整数、User/GuestのIDはUUIDという非整合がある。今回のテストは期限列の保存・castと既存行保持を保証するもので、未使用のBearerトークン認証の成立を保証しない。Cookie認証は実HTTPとブラウザで別途確認する。

## PHPUnit移行と自動テスト

- XMLはPHPUnit10のsource/include形式へ移行。旧coverageのprocessUncoveredFilesは削除。期待値や既存スキップを変更していない。
- @testのみで検出されていた10メソッドへtest接頭辞を付け、全テストから冗長な@testメタデータを除去。対応表は以下。テスト名以外の既存ケース本体に変更なし。

| ファイル | 旧メソッド | 新メソッド |
| --- | --- | --- |
| `backend/tests/Feature/AuthController/GuestAuthTest.php` | `noGuestAuthCheck` | `testNoGuestAuthCheck` |
| `backend/tests/Feature/AuthController/GuestAuthTest.php` | `hasGuestAuthCheck` | `testHasGuestAuthCheck` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `emptyEmailInput` | `testEmptyEmailInput` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `invalidEmailFormat` | `testInvalidEmailFormat` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `emptyPasswordInput` | `testEmptyPasswordInput` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `emailNotExistsOnDatabase` | `testEmailNotExistsOnDatabase` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `passwordMistake` | `testPasswordMistake` |
| `backend/tests/Feature/AuthController/UserLoginTest.php` | `loginSuccess` | `testLoginSuccess` |
| `backend/tests/Feature/AuthController/UserCreateTest.php` | `successUserCreate` | `testSuccessUserCreate` |
| `backend/tests/Feature/MatchController/StoreMatchTest.php` | `storeMatchSetUpTest` | `testStoreMatchSetUpTest` |

- 更新前: 96検出・95成功/既存1スキップ・272 assertions。
- 更新後: **98検出・97成功/既存1スキップ・279 assertions・errors/failures 0**。上表を適用して旧96件すべて残存、追加はSanctumTokenExpirationTestの2件のみ。
- 最終実行でdeprecations / phpunit-deprecations / notices / warningsの表示を有効にし、新規診断なし。既存スキップはBoxerTitleSnapshotUpdateTest::testSetUp。
- 初回の新規2テストはPersonalAccessTokenのmass assignmentで関連キーが除外され失敗した。テストデータ作成時に関連キーを明示代入する形式へ修正し、アプリのモデル保護や期待値を緩めず成功した。
- frontendは52ファイル・204件成功。フロントのソース/依存変更なし。build/lintはS0成功後のフロント実装変更がないためS2では省略。既存Router future flag警告あり。

## 監査と例外

- 更新前15件/7パッケージ→更新後 **13件/6パッケージ、終了コード1**。監査は成功と扱わない。
- 消失したIDは `PKSA-8qx3-n5y5-vvnd`（ファイル検証）と `PKSA-z3gr-8qht-p93v`（PHPUnit）。新規IDなし。
- 修正版到達に合わせファイル検証の例外を削除。残4件はdebug XSS/一時署名URL/メールCRLFの別登録2件。apply:blockのみとし監査表示を維持、理由をS2へ更新。追加の例外や検査全体の無効化なし。
- 他パッケージの既存9件は未解決。各段階で監査と照合し、最終公開前に修正版への更新と例外撤去を確認する。

| パッケージ | 残るID |
| --- | --- |
| `aws/aws-sdk-php` | `PKSA-4t1p-xpk2-nsss`, `PKSA-dxyf-6n16-t87m` |
| `firebase/php-jwt` | `PKSA-y2cr-5h3j-g3ys` |
| `laravel/framework` | `PKSA-d5tc-s1qs-h781`, `PKSA-m5cs-t1y6-qpcs`, `PKSA-3r5d-mb8f-1qw9`, `PKSA-mdq4-51ck-6kdq` |
| `mtdowling/jmespath.php` | `PKSA-mnyp-475s-ywph` |
| `psy/psysh` | `PKSA-4s4z-t146-6123` |
| `symfony/yaml` | `PKSA-xz3r-9gp4-4m1z`, `PKSA-v5yj-8nmz-sk2q`, `PKSA-ft77-7h5f-p3r6`, `PKSA-b14r-zh1d-vdrc` |

## 実HTTP・ログ・日次処理

- 実HTTP22項目すべて成功。CSRF Cookie204、欠落/不正トークン419、正しいトークンでログイン、Cookieセッション継続、許可Origin/credentials、一般ユーザーの管理書込み/削除拒否、管理者削除、非許可Originを反射しないことを確認。
- 日次ゲスト削除は2日前の論理削除対象だけが消え、前日/当日/未削除は保持。DB存在確認済み。常駐cronは操作していない。
- stack/error/taskの出力とtokenの保存確認は上記の専用スクリプトで実行した。

## ブラウザ・非同期メール

- 通常ユーザー・ゲストのログイン/ログアウト、一覧/試合詳細、双方のコメント/投票（合計2票・50%ずつ）、再読み込み後の通常セッションと保存結果、過去試合0件の表示を確認。
- 管理者は登録フォームへアクセス可能。新規一般ユーザーで同じ管理URLへ直接遷移するとホームへ戻されることを確認。
- 仮登録をブラウザで送信し、pre_users1/jobs1を確認。queue:work --once --queue=default --tries=1でMailSendJob DONE、専用ローカルSMTPが受信。
- 受信HTML本文のボタンから本人確認画面へ進み、AXで「アカウントが作成されました」を確認。その資格情報で新規ユーザーのログインまで成功。
- 登録後DBは対象user1、pre_user0、jobs0、failed_jobs0。外部メール配送なし。
- メールのアプリ名は継続使用する検証.envのBoxingTalkingS0。名前と確認先はS2用であることを確認。APP_URLとSanctum stateful domainはS2のポートへ合わせた。
- browser-signup-success.pngは本文空白のため成功画面の証拠にしない。成功判断はAX・DB・新規ログインを根拠とする。browser-new-user.pngは親がS2 New Userと試合一覧の描画を目視済み。

## Reviewer

- 設計と実装差分に修正必須の指摘なし。テスト検出一覧の古い名前1件を再生成して揃える指摘を反映し、最終JUnit・一覧・対応表を同じ実装で確認。
- 最終JUnit・テスト検出比較・HTTP・DB移行/既存トークン保持/down/up・Monolog・日次削除・メールワーカー・新規ログイン画像と文書を照合し、S2完了は妥当、問題なし、未解決の実装指摘なしと評価。最終レビュー後は完了状態の文書更新のみ。

## 環境・証跡・復旧

- 専用Compose project `boxing-upgrade-s2`。API `127.0.0.1:18081`、frontend `127.0.0.1:13001`、ローカルSMTP `127.0.0.1:11027`。MySQL8.0.21は独立network/tmpfsでホストポート非公開。
- 証跡は `/private/tmp/boxing-upgrade-s2/` のcompose.yml、laravel9-before.sql、restored-before.sql、laravel10-after.sql、composer-dry-run.log、composer-update.log、composer-install-dry-run.log、dependency-diff.txt、test-name-map.json、backend-before.log、backend-tests-final.log、backend-test-list.txt、frontend-tests.log、audit-laravel10.json、mysql-existing.log、mysql-fresh.log、mysql-rollback.log、mysql-final.log、token-log-probes.log、http-results.json、daily-check.log、mail-worker.log、registration-db.log、test-detection-comparison.json。
- 最終JUnitはworktree内backend/storage/logs/s2-tests-final.xml。ログ・dump・鍵・env・vendor・node_modulesはコミット対象外。
- 復旧は今回分のコード/lockを基点37eee6e3へ戻し、同じPHP imageでDocker内composer install、専用DBをLaravel9のdumpから復元。既存開発DB/本番環境をreset/downで復旧しない。
- tmpfsと一時ファイルは恒久的な復旧資産ではない。再開時に存在・接続先・imageを確認する。
- PHP本体のセキュリティパッチ、HTTPS/ALB、本番データ、外部SMTP/S3、Bearer認証のUUID整合性は本段階の完了保証に含めない。
- 参考: https://laravel.com/framework/docs/10.x/upgrade / https://github.com/laravel/sanctum/blob/3.x/UPGRADE.md
