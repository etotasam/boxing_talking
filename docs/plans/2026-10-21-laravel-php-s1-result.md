# S1: Laravel 8→9 実行結果（2026-10-21）

## 判定

- **S1完了**。実装・必須検証・最終Reviewer確認を完了し、未解決の実装指摘なし。S2には進まない。
- ユーザー承認: S1開始と、その後の「未公開の隔離環境で個別アドバイザリだけ一時例外にして段階更新」の方針を承認済み。
- ブランチ: `codex/laravel-php-s1`。基点 `7ee95218`。
- 作業先: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。ブランチを切り替えて既存worktreeを使用している。
- 未コミット。push・本番反映・S2実行はしていない。秘密値・受信生メール・一時DB・依存ディレクトリはGit対象外。

## Tasks

- [x] 公式ガイドと前段階の記録・現在版・変更範囲を確認。
- [x] 例外方式の設計をReviewerが確認し、ユーザー承認の範囲で適用。
- [x] Laravel8で隔離DBを再構築し、合成ユーザー入りdumpを別DBへ復元。
- [x] Laravel9安定版と必須依存の更新、CORS参照移行、Composer整合性・実PHP要件確認。
- [x] メールジョブの正常・失敗・既削除分岐を補う3テストを追加。
- [x] 全backend・frontendテスト、MySQL新規/引継ぎ、実HTTP、ブラウザ、非同期SMTP、日次削除を確認。
- [x] 最終Reviewer確認。S1の結果を報告し、S2開始指示前に停止。

## 更新版と依存差分

| 対象 | 更新前 | 更新後 |
| --- | --- | --- |
| PHP | 8.2.30 | 8.2.30（維持） |
| Composer | 2.9.4 | 2.9.4（維持） |
| Laravel | 8.83.29 | 9.52.22（安定版） |
| Sanctum | 2.15.1 | 2.15.1（維持） |
| PHPUnit | 9.6.22 | 9.6.22（維持） |
| Collision | 5.11.0 | 6.4.0 |
| Ignition | facade/ignition 2.17.7 | spatie/laravel-ignition 1.7.2 |
| Flysystem | 1.1.10 | 3.36.0 |
| Mailer | SwiftMailer 6.3.0 | Symfony Mailer 6.4.46 |

- `composer update laravel/framework nunomaduro/collision spatie/laravel-ignition facade/ignition fruitcake/laravel-cors -W --minimal-changes --no-interaction` で更新。全依存の一括更新はしていない。12追加・22更新（downgrade含む）・9削除。
- `composer validate`、`composer check-platform-reqs` 成功。`composer install --dry-run --no-scripts --no-interaction` は `Nothing to install, update or remove`。新規vendorへの全クリーンダウンロード再現はS9で確認する。
- PHPの制約をLaravel9の最小要件に合わせ `^8.0.2`、frameworkを `^9.52.22@stable` とした。実際の検証PHPは8.2.30のみ。
- Kernelの `Fruitcake\Cors\HandleCors` を `Illuminate\Http\Middleware\HandleCors` へ変更し、不要になったFruitcake Laravel CORS依存を除去。独自Corsミドルウェア・認証guard・API形状・権限仕様は維持した。
- SwiftMailer/Flysystem独自APIのアプリ呼出は見つからず、メール/ファイル設定の不要な置換はしていない。Flysystem localディスクで書込・読込・削除の往復を確認。S3外部サービスの実接続は対象外。
- `rorecek/laravel-ulid` はアプリのtrait/Facade利用を検出していないが、自動検出Providerとalias登録あり。ProviderはFactoryのsingletonを登録しbootは空。S1では削除せず、Laravel11前のS4で再評価する。

## 一時的な脆弱性例外と監査

- Laravel9への移行前の安定版dry-runは既知アドバイザリにより終了コード2。開発版には迂回していない。
- 個別5件の `config.audit.ignore` を `apply: block` と理由付きで設定。**監査レポートでの表示と非ゼロ終了は維持**。全体のblock-insecure無効化・グローバル設定変更なし。
- 例外はLaravel9の通過点を検証するためだけ。未公開であることは無影響の保証ではない。ループバック公開・合成データ・ローカルSMTPのみの条件で使用し、中間版を外部公開しない。
- 対象: `PKSA-d5tc-s1qs-h781`（debug XSS）、`PKSA-m5cs-t1y6-qpcs`（一時URL）、`PKSA-3r5d-mb8f-1qw9` / `PKSA-mdq4-51ck-6kdq`（同件メールCRLF）、`PKSA-8qx3-n5y5-vvnd`（ファイル検証）。
- `PKSA-w7xr-vk7n-rstm` は9.52.17以降で修正済みのため例外に追加していない。
- 各ステージ開始時に再評価する。ファイル検証は10.48.29以上、メールは12.60.0 / 13.10.0以上、一時URLは12.61.1 / 13.12.0以上、debug XSSは12.69.0 / 13.30.0以上を目安に、その時点の監査との照合後に不要なIDを削除。S9で例外なしの監査を確認する。
- `composer audit --locked --format=json`: 更新前 **51件/17パッケージ・終了コード3**（abandoned2件含む）。更新後 **15件/7パッケージ・終了コード1**。監査成功とは扱わない。`ignored-advisories` は空。更新後の新規IDは、承認済みの同件メールCRLFの別登録 `PKSA-mdq4-51ck-6kdq` のみ。他14件は更新前にも存在する。
- 残るLaravel以外の10件は下表。S1で新たな例外を追加していない。最終公開前のS9までに修正版への更新・対応を確認する必要がある。

| パッケージ | 残る既存ID |
| --- | --- |
| `aws/aws-sdk-php` | `PKSA-4t1p-xpk2-nsss`, `PKSA-dxyf-6n16-t87m` |
| `firebase/php-jwt` | `PKSA-y2cr-5h3j-g3ys` |
| `mtdowling/jmespath.php` | `PKSA-mnyp-475s-ywph` |
| `phpunit/phpunit` | `PKSA-z3gr-8qht-p93v` |
| `psy/psysh` | `PKSA-4s4z-t146-6123` |
| `symfony/yaml` | `PKSA-xz3r-9gp4-4m1z`, `PKSA-v5yj-8nmz-sk2q`, `PKSA-ft77-7h5f-p3r6`, `PKSA-b14r-zh1d-vdrc` |

## 自動テスト

- 更新前: 93件検出、92成功・既存1スキップ・250 assertions。
- 更新後: **96件検出、95成功・既存1スキップ・272 assertions、errors/failures/warnings 0**。S0記録の93件はすべて残り、追加はMailSendJobTestの以下3件のみ。テストを消したり期待するAPI動作を緩めたりしていない。
  - `testHandleSendsRegistrationMailAndKeepsPreUser`: 宛先・件名・名前・署名付きJWTの本人IDと30分期限・リンク・仮登録保持。
  - `testHandleMailFailureDeletesOnlyItsPreUserAndFailsJob`: send例外時、対象だけ削除・他人を保持・同じ例外でキュージョブをfail。
  - `testHandleMailFailureWhenPreUserWasAlreadyDeleted`: 仮登録が既にない場合も別例外を発生させずジョブfail。
- 残るスキップは既存の `BoxerTitleSnapshotUpdateTest::testSetUp`。frontend定数同期テストも実行した。
- 新規テストの作成途中にUUIDオブジェクト/文字列比較とMailFakeのrender未対応で失敗したが、外部仕様に合わせて文字列比較と実Markdownレンダラーでの本文検証に修正。最終全件成功。実送信は下記SMTPで別途確認した。
- frontend: **52ファイル・204件成功**。ソース変更なしのためbuild/lint再実行はS1では省略（S0で成功済み）。既存React Router future flag警告あり。API/認証に関連する既存テストを全件実行して回帰を確認した。

## 隔離MySQL・復旧

- Compose: `/private/tmp/boxing-upgrade-s1/compose.yml`、project `boxing-upgrade-s1`。
- PHP image `boxing_talking-php:latest`、ID先頭 `967f0c79493d`、PHP8.2.30、Debian13/trixie、linux/amd64（S0と同じ）。MySQL8.0.21。PHPの公開先は `127.0.0.1:18080`。MySQLのホスト公開ポートなし、データは専用tmpfs。
- S0当日の一時Compose/DBは消失していた。Laravel8で新規構築した `boxing_upgrade_s1` に合成ユーザー1件を作りdump。`boxing_upgrade_s1_restore` に復元し、双方migration34件・合成ユーザー1件が一致した。S0当日のDBや実利用者データを復元したという意味ではない。
- Laravel9で既存DBへmigrateすると `Nothing to migrate`。同じ合成ユーザーを取得・名前変更・再取得・元へ復元し、読み書きを確認した。
- 別の空DB `boxing_upgrade_s1_fresh` にLaravel9で全34件を適用して成功。snapshotはidなし・既存4列順の複合主キー・state nullableを確認した。
- アプリの履歴マイグレーション追加/変更なし。既存開発DBと本番環境は未操作。`.env.production`は未参照。
- 復旧基点は `7ee95218` のコード・composer.lockと上記PHP image。今回分だけを戻し、直前lockでDocker内composer install、専用DBをdumpから復元する。DBのdownや既存DBリセットを復旧方法としない。
- dump: `/private/tmp/boxing-upgrade-s1/laravel8-before.sql`。tmpfs・一時ディレクトリは恒久保存ではなく、再開時に存在と接続先を確認する。

## 実HTTP・ブラウザ・メール・日次処理

- frontend `http://127.0.0.1:13000`、API `http://127.0.0.1:18080`。検証用URLとSanctum stateful domainを合わせて設定。CSRF保護・認可を無効化せず確認。
- HTTP: **22項目すべて成功**。Cookie取得204、トークン欠落/不正419、正しいトークンでログイン200、セッション継続、許可Origin/credentials、未認証投稿401、一般ユーザーの管理書込/削除401、管理者削除200と再取得での消失、ログアウト200、非許可Originを反射しないことを確認。
- 初回HTTPスクリプトはadmin応答をJSON trueと期待して失敗したが、既存の生boolレスポンスは数値1のため期待値を修正。アプリの応答は変更していない。
- ブラウザ: 通常/ゲスト/管理者ログインとログアウト、一覧と試合詳細、通常/ゲストのコメントと投票（合計2票・50%ずつ）、通常ユーザーの再読み込み後のセッション/保存維持、管理者の登録フォーム表示を確認した。一般ユーザーで管理画面へ直接遷移するとホームへ戻され、過去試合0件の表示も確認した。
- 仮登録をブラウザで送信→pre_users1/jobs1→`queue:work --once --queue=default --tries=1`→Symfony MailerでローカルSMTP受信→受信HTML本文のボタンをクリック→「アカウントが作成されました」→新規ユーザーのログインまで成功。
- 登録後DBは対応user1、pre_user0、jobs0、failed_jobs0。外部宛の送信なし。受信件名と名前・リンクも確認。メールのアプリ名は検証.envで継続使用しているBoxingTalkingS0。
- 日次削除: 専用ダミーを作成し、2日前に論理削除した対象のみ物理削除、前日・当日・未削除ゲストは保持。コマンド終了だけでなくDBの存在を確認。cron常駐は検証対象外。

## 証跡

すべて `/private/tmp/boxing-upgrade-s1/`。生メールやJWT入りプレビューはGitへ追加しない。

- `compose.yml` / `composer-stable-dry-run.log` / `composer-exceptions-dry-run.log` / `composer-update.log` / `dependency-diff.txt`
- `laravel8-baseline.log` / `laravel8-before.sql` / `mysql-fresh.log`
- `backend-tests-final.log` / `backend-test-list.txt`（JUnitはworktreeの `backend/storage/logs/s1-tests-final.xml`）
- `frontend-tests.log` / `http-results.json` / `http_checks.py` / `mail-worker.log` / `daily-check.log`
- `audit-laravel8.json` / `audit-laravel9.json` / `composer-install-dry-run.log`
- ブラウザ画像: `browser-normal-vote.png` / `browser-guest-vote.png` / `browser-admin.png` / `browser-signup-success.png` / `browser-new-user.png`

- `browser-signup-success.png` は本文が空のため登録成功の視覚証拠にしない。成功はブラウザAXの「アカウントが作成されました」、登録後DB、新規ログインで確認。`browser-new-user.png` は親とReviewerがS1 New Userと試合一覧の描画を目視済み。

## Reviewer

- 例外方式の設計、composer lock差分、CORSと新規メールテスト、監査差分、実HTTP、MySQL、非同期SMTP・日次処理、最終JUnitとブラウザ証跡を照合。
- 実装差分は問題なし、修正必須指摘なし。本文空白の画像を成功証拠として扱わない旨を記録する条件を反映し、S1完了判定は妥当と評価。
- 最終レビュー後の変更は検証結果・画像制限の文書更新のみ。関連テストはレビュー済みの実装で最終全件成功。

## 制限と引き継ぎ

- 監査の残存15件は未解決。今回の通過点は公開可能な状態という判定ではない。PHP本体のセキュリティパッチ更新も別作業で未実施。
- HTTPS/ALB、本番データ、外部SMTP配送、外部S3、常駐cronの保証ではない。S6のHTTPS/送信元検証とS9の最終統合確認を維持する。
- 本実行はS1のみ。S2は開始指示待ち。コミットはユーザーの指示待ち。
