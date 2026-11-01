# Laravel13/PHP8.5成果の元worktree統合・確認・引き継ぎ

> 履歴文書（2026-10-22作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

S9までの成果を元worktreeのcodex/laravel-php-upgradeへ統合し、元環境で動作確認する。成功後に旧作業worktreeを保護・アーカイブし、次期更新用worktreeを統合完了地点から作成する。2026-10-22、ユーザーがこの順序を「では実行しましょう」で承認。ライブラリ/Node/MySQLの更新実装・push・本番反映は今回行わない。

## Background / Context

- 元: /Users/terashimamasato/learns/my_project/boxing_talking、codex/laravel-php-upgrade、e3e50cef。追跡ファイルclean、未追跡.codex/environments/を保持する。
- 旧作業: /Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking、codex/laravel-php-s9、50cc397b（文書保存後）。
- 開始時は統合先独自commit0/作業側9commit。文書commit50cc397b後、10commitをfast-forward統合済み。
- 元Dockerを起動し、PHP8.2.30/Laravel8.83.29/Node21.6.1と永続MySQL8.0.21を確認。backend APP_ENV=local、frontend localhost3000/API localhost8080。本番設定参照なし。
- 元DBdumpをdocker/db/backup/laravel-php-integration-20261022/before.sqlへ保存済み。Git除外・非公開permissionで保管。
- 旧worktreeは管理ツールが「別チャット所有」と返しattach不可。強制削除やGit削除で迂回しない。所有元チャットによるarchiveかユーザー操作が必要なら、元環境確認後に説明する。

## Scope

### In Scope

文書方針更新・保存、fast-forward統合、元DockerのPHP再build・lock導入・DB未適用migration、隔離テストと元URLのブラウザ主要動作、復旧情報・必要データ保存、許可された旧worktreeアーカイブ・次期worktree準備。

### Out of Scope

ライブラリ/Node/MySQL更新、開発DBへのfresh/RefreshDatabase、既存ユーザーや既存データ削除、.env.production/本番秘密情報参照、外部送信・本番接続、force merge/reset/再帰的強制削除、push。アーカイブ不可を強制削除で回避しない。

## Impact Area

- 既存S9文書と次期計画、本統合計画・結果。
- 元worktreeの追跡コードは既存のS0〜S8実装を統合。新機能の追加なし。
- 元PHP image/vendor/bootstrap cache、必要な未適用migration。既存.env/APP_KEY・DB/storageを維持。
- 元frontendの依存整合・既存Node21での起動/主要フロー。パッケージ版やNodeは変更しない。
- テスト用の合成ユーザー/投稿/投票等とloopback SMTP。既存ユーザー宛に送らない。

## Options

1. コード統合だけ行う。元環境のvendor/image/DB整合を保証できない。
2. バックアップ→文書commit→fast-forward→元環境確認→旧worktreeアーカイブ→次期worktree。ユーザー承認済みの案。
3. 全て新環境だけで検証する。元worktreeでの動作確認という依頼を満たさない。

## Decision

案2。既存S9検証を基準に元環境への反映を確認する。メインが作業し、Reviewerが方針と結果を確認する。git-commitメッセージ承認は別途必要。

## Rationale

Laravel/PHP更新の完了地点を確定してから、依存・実行環境更新を独立して進める。元環境のデータと設定を保護し、ブラウザ検証の成功前に旧作業環境を片付けない。

## Tasks

- [x] 元/旧worktreeのstatus・基点・差分・fast-forward可否、元Docker実版と永続DB保存先を確認。
- [x] 元DBdumpをGit除外された保存先へ取得。
- [x] 元image/lock/storage/envと旧worktreeの必要ignoredデータを非公開backupへ保護し、DBdumpを別DBへrestore確認。
- [x] Reviewerが統合・データ保護・元環境テスト・archive境界を確認。
- [x] 文書だけをstage/検証し、日本語Conventional Commitメッセージを提示・承認後にcommit。
- [x] backup/restore成功後、元PHP/Nginx/Nodeと関連workerを停止してからgit merge --ff-only。未追跡設定は保持。旧PHP/vendorで統合後コードを処理させない。
- [x] サービス停止中に元PHP再build・composer install/validate/platform/cache整合、DB名・履歴・schemaを確認して未適用分だけmigrate。SMTP overrideと依存/DB整合を確認後にサービスを再開。
- [x] 元worktreeソースを使い、専用SQLite/storageのDockerで全backendと識別子を確認。
- [x] 元frontend起動・API health、ブラウザ通常/guest/admin・投稿/投票・実ローカルメール登録を確認。
- [ ] Reviewer最終確認、元環境の結果・完了地点を保存。
- [ ] 旧worktreeの変更/必要ignoredデータ/稼働プロセスを確認し、所有制約を満たす方法でarchive。不可なら保留して報告。
- [ ] 統合完了commitからcodex/backend-sdk-securityの新worktreeを用意。P1実装は開始しない。

## Test Plan

- 元DBのテーブル/行数・migration履歴・主要schemaを前後比較し、未適用分だけを適用。dumpは別DBへ復元して確認する。既存データを初期化しない。
- 開始前にjobs/failed_jobsの件数・IDと内容hashを保存する。メール検証では新規の合成ユーザーに対応する検証jobだけを、ID/作成時点/class/payloadを照合して専用queueへ移し、そのqueueを指定してworker処理する。既存default queueをworkerで巡回しない。既存jobのretry/forget/deleteは対象外で、既存job/failed_jobの内容保持を最後に照合する。
- backup/restore成功後に元PHP/Nginx/Node/関連workerを停止して統合し、PHP image/vendor/cache/DBとSMTP overrideが整合するまで再開しない。
- backendテストは元worktreeをbindしたDockerの専用SQLiteファイル・storageで実行し、元DBや元SQLiteをRefreshDatabaseで壊さない。基準171識別子/170成功1既存skip/440assertionsを維持。
- 元PHP CLI/FPM8.5.12/Laravel13.38.0、Composer2.9.4、実拡張/ini・validate/platform/install dry-runを確認。
- root Composeの既存DB/Node/Nginx構成を保持し、元URL localhost3000→API localhost8080で確認。テストSMTPのみ一時Compose overrideでloopback受信先に向け、永続.envや外部SMTPを変更しない。
- 元DBに必要な合成正常/管理者アカウントと最小fixtureを別名で用意する場合は既存データを再利用/上書きしない。実ユーザーのパスワードを取得・変更しない。
- 通常/guest/admin login/logout、一般管理URL拒否、一覧/詳細、コメント投稿/reload、投票、管理者フォーム、一般DELETE拒否/admin成功、仮登録→実worker/ローカルSMTP受信リンク→本登録→新規login。未提供の削除UIは実HTTPで補完する。
- browser screenshotとDB状態を保存。元環境のブラウザ確認が未達なら旧worktreeをarchiveしない。
- ドキュメントだけのcommitでは空白・リンク・差分混入チェック。アプリ実装は既存レビュー済みだが統合後の結果もReviewer確認。
- 秘密/メール/JWT/cookie/DBdump/ignored設定はGitへ含めない。.env.productionはbackup対象にも含めない。

## Risks

- 元環境独自のDB/schema/設定差があれば、勝手に緩和せず根拠と最小修正案を提示。
- Docker停止後は旧tmpfsデータが失われ得る。S9等の成功結果は保存記録を基準とし、復旧用dumpの実在・restoreを確認する。
- 旧worktreeのarchive toolは他チャット所有を理由に拒否される。ユーザーの削除依頼があっても所有チェックを迂回せず、必要なら所有元への依頼許可/ユーザー操作を求める。
- 元環境のignored依存や設定はGitのmerge対象外。vendor/image/DB更新を別に確認する。
- メール送信は一時SMTP overrideが有効であることを先に確認する。外部サービスへテスト送信しない。既存queueの処理やretry/forgetをせず、検証jobだけを専用queueで実行する。
- 復旧は元commit e3e50cef、元image/lock、保存DB/storage/envの組。稼働中DBのデータファイルをコピー/上書きせず、別環境へのrestoreを基準とする。
- 監査残件・EOL Node/MySQLは既知の次期更新課題であり、本番公開承認とは扱わない。

## References

- [S9結果](2026-10-22-laravel-php-s9-result.md)
- [次期更新計画](../../2026-10-22-dependency-runtime-update.md)

- [元worktree統合結果](2026-10-22-laravel-php-integration-result.md)


## 後続記録への参照（文書整理時の注記）

上の未チェック3項目と未実行表記は当時の計画です。最終確認・旧worktree処理・次期作業先準備の完了は[全体計画のP0](../../2026-10-22-dependency-runtime-update.md#p0-s9結果と作業基点を保存)と[統合結果](2026-10-22-laravel-php-integration-result.md)を参照してください。当時のチェック表は書き換えていません。
