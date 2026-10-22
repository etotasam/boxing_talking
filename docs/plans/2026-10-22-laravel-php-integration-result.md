# Laravel13/PHP8.5 元worktree統合結果

## 完了した統合

- 元checkoutの`codex/laravel-php-upgrade`を`e3e50cef`から`50cc397b`へfast-forward。S0〜S9と次期更新計画を統合した。未追跡`.codex/environments/`を保持。
- 元ComposeのPHPを再buildし、lockから依存を導入。PHP CLI/FPM 8.5.12、Laravel13.38.0、Composer2.9.4。installed/lockの120パッケージ版が一致し、validate/platform/dry-runも成功。
- Node21.6.1・MySQL8.0.21は維持。ライブラリ・Node・MySQLの次期更新には着手していない。

## データ保護

- 元DBdumpを別MySQLへ復元し、UTCに正規化した20テーブル全件の一致を確認した。元DBへの復元・初期化は行っていない。
- 元環境のenv/storage/cache/sqlite/lock/image情報と旧worktreeの必要ignoredデータを、Git除外の`docker/db/backup/laravel-php-integration-20261022/`に保護。秘密を含むarchive/SQLは非公開permissionで保存した。
- 元DBのmigration履歴52件とソース35件を照合し、未適用だった`personal_access_tokens.expires_at`追加1件だけを実行。履歴53件。移行直後、19データテーブルの既存列・行が完全一致した。
- ブラウザ確認で、開始時に残っていた既存ゲスト1行がログアウトにより論理削除されたことをReviewerが指摘。保存した元DBと照合し、対象IDと現在値を条件に`updated_at`/`deleted_at`2項目だけを元値へ限定復元した。その後、全20テーブルで全既存行の内容保持を再確認（`data-final.json`）。合成データ・migration以外の差分はない。
- 確認用通常/管理者ユーザー各1、ゲスト1、コメント1、投票1を追加。使い捨て選手は管理者DELETE確認で削除済み。既存アカウントのパスワードは変更していない。管理者作成はユーザーの明示承認後に実行した。
- 既存jobs3件・failed_jobs0件は内容hashまで一致。新規仮登録のjob16だけをclass/本人ID/メール/既存ID除外で照合し、専用queueで処理した。default queueの巡回・既存jobのretry/forget/deleteなし。

## テストとブラウザ

| 項目 | 結果 |
| --- | --- |
| 元ソースを使う隔離Docker backend | 171識別子、170成功・既存skip1、440 assertions |
| 元Node21のfrontend | 52ファイル・204成功、lint/build成功 |
| API health | 200 |
| 元ブラウザURL | frontend localhost:3000 / API localhost:8080 |
| guest/normal/admin | login/logout成功 |
| 一覧・詳細 | 予定・過去一覧、試合詳細表示成功 |
| 通常ユーザー | コメント保存/reload、投票成功（あなたの投票表示） |
| 管理画面 | 管理者の選手登録フォーム表示、一般ユーザーは一覧へリダイレクト |
| HTTPによる削除補完 | 一般DELETE401、管理者の使い捨て選手DELETE200 |
| 実メール登録 | 仮登録→専用queueの実worker→ローカルSMTP→メールリンク→本登録→新規login成功 |

backendはtmpfs storage・SQLite memory・合成JWT鍵で元データから隔離。最初は隔離storageのJWT鍵不足で4失敗、鍵準備後はfrontend参照不足で追加skip1が出たが、読み取り専用mountを追加し基準件数で再実行成功した。アプリコード変更なし。フロントのBrowserslist/chunk size警告とComposerの既存PSR-4警告は残る。

投稿ボタンと開発用query devtoolsが画面右下で重なるため、コメント送信はボタンのキーボード操作で確認した。UI調整は次期改善候補であり今回の統合差分には追加していない。

証跡は上記Git除外backupフォルダの`backend-test.txt`、`backend-identifiers.txt`、`frontend-test.txt`、`frontend-check.txt`、`http-result.json`、DB比較JSON、`browser-normal.png`/`browser-admin.png`/`browser-denied.png`/`browser-past.png`。S9当時の`/private/tmp/boxing-upgrade-s9`は現在存在せず、S9過去結果はコミット済み結果文書を参照する。今回の元環境確認は新たに実施した。

## 引き継ぎ状況

- 一時SMTP overrideを解除し元mail設定へ復帰。PHP/Nginx再起動後もAPI health200、ブラウザreload後の通常ログインsession保持を確認。隔離テストPHP・ローカルSMTP・メールpreviewは停止済み。
- Reviewerによる最終確認: 既存ゲストの限定復元と最終照合を再確認し、必須指摘なし。
- 旧worktree: 別チャット所有のためこのチャットではarchive不可。ユーザー承認を得て所有元「LravelとPHPのUpgrade」へarchiveだけ依頼済み。旧worktreeを参照するVS Code補助プロセス8件と端末1件が残るため、所有元はarchive直前で停止。該当ウィンドウ/端末を閉じる許可の確認が必要。
- 次期worktree: 旧worktree処理と統合結果保存の後、統合完了地点から`codex/backend-sdk-security`を準備する。P1実装は開始しない。

本結果はローカル統合の確認であり、本番公開判定ではない。監査残件とNode/MySQLサポート終了への対応は[次期計画](2026-10-22-dependency-runtime-update.md)で別途進める。
