# S0: Laravel / PHP 更新前の基準結果

## 判定

- 実行日: 2026-10-20（日本時間）。ユーザーからS0のみ開始しS1の前で停止する指示を受けて実施。
- **S0完了。基準テスト・実操作・最終レビューまで完了し、未解決の実装指摘なし。S1は開始指示待ちのため進まない。**
- 初回S0の基準取得ではLaravel / PHP / 依存lock / アプリ実装 / テスト実装を変更していない。その後、不要とのユーザー指示で `frontend/src/App.tsx` のTest importと `/test` Routeの2行だけを削除した。その後、ユーザー承認で対象履歴マイグレーションのid削除と戻し処理も修正した。バージョン・lockは変更していない。既存稼働DBは変更していない。
- Reviewer: レビュー完了。「問題なし」。証跡と記録の一致、およびS0保留・S1停止の判断を確認済み。コミット・push・本番反映は未実施。

## 作業場所と隔離

- 基点: `codex/laravel-php-upgrade`、`e3e50cef29c6a393efcb560c2d44f5efe8c1f332`。
- S0ブランチ: `codex/laravel-php-s0`。
- worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。
- 元のcheckoutは変更していない。既存の未追跡 `.codex/environments/` は対象外。
- 停止中だったDocker Desktopを起動すると既存の開発コンテナも復帰した。それらのDBには接続・変更していない。
- S0用Compose: `/private/tmp/boxing-upgrade-s0.compose.yml`、project名 `boxing-upgrade-s0`。
- S0のPHPはworktreeのbackendを使用し、frontendを `/var/www/frontend` に読み取り専用マウントした。php.iniはworktreeの既存設定を読み取り専用で使用。
- MySQLは専用コンテナ `boxing-upgrade-s0-db-1`、独立network、`/var/lib/mysql` はtmpfs。ホストへDBポートを公開していない。
- 検証DBは `boxing_upgrade_s0`、復元DBは `boxing_upgrade_s0_restore`。既存の `docker/db/my_data` はマウントしていない。
- 検証用 `.env`、JWT鍵、アプリ鍵は新規生成したもの。既存の秘密値はコピー・出力していない。`.env.production`は参照していない。
- この環境はLaravel開発サーバーを使うため、既存Nginx / ALB / HTTPS経路の動作確認にはならない。

## 実行環境

| 対象 | 確認結果 |
| --- | --- |
| PHP | 8.2.30 CLI / NTS |
| Laravel | 8.83.29 |
| Sanctum | 2.15.1 |
| PHPUnit | 9.6.22 |
| Composer | 2.9.4 |
| SQLite | 3.46.1、pdo_sqlite / sqlite3あり |
| MySQL | 8.0.21、pdo_mysqlあり |
| PHP OS / architecture | Debian GNU/Linux 13 (trixie) / linux/amd64 |
| ホストNode / npm | 22.10.0 / 10.9.0（既存Nodeコンテナでの実行結果ではない） |
| PHPイメージ | `boxing_talking-php:latest` |
| PHPイメージID | `sha256:967f0c79493da979089eb14c7bf7d7d1365ef5431a8d9d159a92ff27dc1f5740` |
| RepoDigest | ローカルビルドのため空。イメージIDを確認地点にする |

- PHP依存は元checkoutのvendorをS0用worktreeへコピーした後、`composer validate` / `check-platform-reqs` / `install --dry-run --no-scripts --no-interaction` で確認した。
- composer.jsonはvalid、PHPプラットフォーム要件は全項目成功、lockの導入差分は `Nothing to install, update or remove`。クリーンダウンロードからの再現性までは未確認。
- Composerは `fruitcake/laravel-cors` と `swiftmailer/swiftmailer` のabandoned警告を出した。セキュリティ監査を通過したという意味ではない。
- フロントは `CYPRESS_INSTALL_BINARY=0 npm ci --offline --no-audit --no-fund` で1774パッケージを導入。lock変更なし。Cypress本体の導入・実行はしていない。
- npm導入時にはESLint 8、tar、glob等の非推奨警告あり。監査は本ステージでは未実施。
- 日次処理は `delete_logout_guest_users:info`、`0 0 * * *` として登録されていることを `schedule:list` で確認。スケジューラー実運用・削除動作の成功は未確認。

## テスト・検証結果

| 確認 | 結果 | 補足 |
| --- | --- | --- |
| PHPテスト検出一覧 | 93件 | 末尾に一覧を記録 |
| backend全テスト（最終） | **92成功 / 1スキップ / 250 assertions** | errors / failures / warnings は0 |
| frontend全テスト | **52ファイル / 204成功** | 失敗・スキップ0 |
| frontend lint | 成功 | 終了コード0 |
| frontend build | 初回失敗 → **不要ルート削除後に成功** | 初回は `@/page/Test` 不在で終了コード2。削除後は終了コード0 |
| MySQL空DBへの全履歴移行 | 初回失敗 → **修正後34件成功** | 新しい専用DBでidなし・4列複合主キーを確認 |
| 検証DBバックアップ・別DB復元 | **完全スキーマと合成ユーザー1件で成功** | 双方20テーブル・34件の移行履歴・合成ユーザーを確認。実運用データの復元検証ではない |
| ブラウザ主要フロー | **成功** | 通常・ゲストの認証、コメント・投票、管理者権限、本登録、再読み込み、過去一覧0件、NotFoundを確認 |

### SQLiteの準備と再実行

`phpunit.xml`は `DB_DATABASE=:memory:` を指定する一方、`config/database.php` のsqlite接続は `database_path('database.sqlite')` を直接使用する。
そのため、fresh worktreeでファイル未作成の初回実行は **5成功 / 87 errors / 1スキップ、8 assertions** だった。

S0用worktreeのGit除外対象 `backend/database/database.sqlite` を新規作成すると **91成功 / 2スキップ、249 assertions** になった。
さらにfrontendを読み取り専用マウントして定数同期テストを有効にし、最終結果が **92成功 / 1スキップ、250 assertions** になった。
ソースやphpunit.xmlは変更していない。元の開発用SQLiteをコピーしておらず、テストはS0用ファイルだけを使用した。

- 最終スキップは `Tests\Unit\BoxerTitleSnapshotUpdateTest::testSetUp`。既存コードが `markTestSkipped()` を無条件に呼ぶため。
- `CustomErrorCodesTest::testFrontendCustomErrorCodesAreSynced` は通常マウントでスキップされるが、最終構成では実行・成功した。
- フロントにはReact Routerのv7 future flag警告が残る。`test-setup.tsx` は既存のReact act警告抑制を持つため、テスト成功から「警告なし」とは判断しない。

### フロントビルドの阻害要因

- `frontend/src/App.tsx:15` が `@/page/Test` をimportし、60行目で `/test` ルートに使用している。
- 当該ファイルはGit管理対象に存在せず、ルート `.gitignore` が `frontend/src/page/Test.tsx` を除外している。
- エラー: `TS2307: Cannot find module '@/page/Test' or its corresponding type declarations.`
- このため、既存checkoutの未管理ファイルに依存して動いていた可能性がある。元ファイルのコピー・ダミー追加・ルート削除で隠さず、仕様に沿った修正を別途提案する。

### MySQL移行の阻害要因

- `2024_12_23_134621_create_boxer_title_snapshots_table.php` は `$table->id()` で主キーを作成する。
- `2024_12_23_234609_update_boxer_title_snapshots_table.php:16` は、その主キーを残したまま4カラムの複合主キーを追加する。
- エラー: `SQLSTATE[42000] ... 1068 Multiple primary key defined`。
- 対象は専用の空DBからの構築。既存本番DBの状態・適用履歴を示すものではない。既存開発DBにも移行を実行していない。
- id主キーを残して複合unique制約にするか、複合主キーへ切り替えるかは、利用箇所・既存データ・意図を確認して決める。S0では修正も履歴のスキップも行わない。

### バックアップと復元

- 部分スキーマの検証DBへ専用の `s0_backup_probe` テーブルと合成データ1行を追加し、`mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF` で取得した。
- ダンプ: `/private/tmp/boxing-upgrade-s0/mysql-partial-baseline.sql`。
- 別の専用DBへ復元し、双方21テーブル、migrations履歴29件、probeの値が一致することを確認した。
- 完全なアプリの初期データ入りバックアップは**未確認**。マイグレーション修正後、代表データとスキーマの復元確認が必要。
- tmpfsのDBはコンテナ停止・再作成で失われ得る。一時ファイルもOSの清掃対象になり得るため、このダンプを恒久的な復旧資産とは扱わない。

## 再現コマンドと証跡

本書のS0用Compose・検証鍵・依存を準備した環境で実行した。初回の環境構築手順は上記「作業場所と隔離」「SQLiteの準備と再実行」を参照する。

```sh
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php php -v
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php php -m
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php php artisan --version
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php composer validate
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php composer check-platform-reqs
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php composer install --dry-run --no-scripts --no-interaction
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php ./vendor/bin/phpunit --list-tests
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php php artisan test --log-junit /var/www/html/storage/logs/s0-tests-final.xml
docker compose -f /private/tmp/boxing-upgrade-s0.compose.yml exec -T php php artisan schedule:list
```

frontendディレクトリで以下を実行した。

```sh
npm test -- --run --reporter=default --reporter=json --outputFile=/private/tmp/boxing-upgrade-s0/frontend-tests.json
npm run build
npm run lint
```

- 生ログ: `/private/tmp/boxing-upgrade-s0/` の `backend-test.log`（初回）、`backend-test-with-sqlite.log`、`backend-test-final.log`、`backend-test-list.log`、`mysql-migrate.log`、`frontend-test.log`、`frontend-build.log`、`frontend-lint.log`。
- 最終JUnit: worktreeの `backend/storage/logs/s0-tests-final.xml`。フロント詳細JSONは上記outputFile。
- 一時ログが消えても検出数の減少を比較できるよう、以下にbackendの93テストとfrontendの52ファイルごとの件数を記録する。

## 初回時点の未確認項目と再開条件（後続の追加対応で解消）

1. `/test` ページは不要とのユーザー指示を受け、importとルートを削除済み。ビルド・204テスト・lintは成功。主要ブラウザ操作は修正済みDBへ検証用アプリの接続を切り替えてから確認する。
2. MySQLの二重主キーは承認済みのid削除で解消。空DBから34件成功、戻し・再適用とデータ・cascadeを検証した。完全スキーマと合成ユーザーのバックアップ・復元も成功。既存稼働DBへの適用は行わず、別途評価が必要。
3. 本登録メール・実HTTP Cookie / CSRF・通常ユーザー / 管理者 / ゲスト・コメント / 投票は自動テストだけでは実ブラウザの成功を保証できない。正常な隔離環境で確認する。
4. メールジョブhandle・失敗時データ、非同期ワーカーとテストメール受信、日次削除の境界は既存テストで十分な保証がない。S1のメール基盤移行とS5のCarbon移行に向けて必要な補強を提案する。
5. 本書の失敗と未実施項目を解消、または扱いを明示して承認を得るまでS0は保留。S1は開始しない。

lockとバージョンは基点コミットから変更なし。コード差分は末尾の不要Testルート削除と対象マイグレーション修正。復旧・再開時は上記PHPイメージID、基点のlockとS0専用設定を使用する。既存開発DBのリセット・本番設定の参照は不要。

## Backend検出一覧（93件）

```text
Tests\Unit\BoxerService\ParseRequestNameTest::testParseRequestNameInThatCaseNull
Tests\Unit\BoxerService\ParseRequestNameTest::testParseRequestNameInThatCaseJapanese
Tests\Unit\BoxerService\ParseRequestNameTest::testParseRequestNameInThatCaseEnglish
Tests\Unit\BoxerTitleSnapshotUpdateTest::testSetUp
Tests\Unit\BoxerTitleSnapshotUpdateTest::testThrowExceptionWhenResetFailed
Tests\Unit\BoxerTitleSnapshotUpdateTest::testUpdateBoxerTitleSnapshotState
Tests\Unit\BoxerTitleSnapshotUpdateTest::testNewBoxerTitle
Tests\Unit\BoxerTitleSnapshotUpdateTest::testDeleteNewTitleSnapshot
Tests\Unit\BoxerTitleSnapshotUpdateTest::testStoreOrUpdateBoxerTitleSnapshot
Tests\Unit\CustomErrorCodesTest::testCustomErrorCodesAreUnique
Tests\Unit\CustomErrorCodesTest::testFrontendCustomErrorCodesAreSynced
Tests\Unit\MailSendJobTest::testMailQueueSetToJob
Tests\Unit\TitleService\DeleteTitleTest::testDeleteTitle
Tests\Unit\TitleService\StoreTitleTest::testUpdateTitlesTable
Tests\Unit\TitleService\StoreTitleTest::testThrowExceptionIfFailedStoreTitle
Tests\Feature\AuthController\GuestAuthTest::noGuestAuthCheck
Tests\Feature\AuthController\GuestAuthTest::hasGuestAuthCheck
Tests\Feature\AuthController\GuestAuthTest::testSuccessGuestLogin
Tests\Feature\AuthController\PreUserCreateTest::testPreUserCreate
Tests\Feature\AuthController\UserAuthCheckTest::testHasAuthCheck
Tests\Feature\AuthController\UserAuthCheckTest::testAuthCheck
Tests\Feature\AuthController\UserCreateTest::testExpiredToken
Tests\Feature\AuthController\UserCreateTest::testUnmatchedSecretKey
Tests\Feature\AuthController\UserCreateTest::successUserCreate
Tests\Feature\AuthController\UserLoginTest::emptyEmailInput
Tests\Feature\AuthController\UserLoginTest::invalidEmailFormat
Tests\Feature\AuthController\UserLoginTest::emptyPasswordInput
Tests\Feature\AuthController\UserLoginTest::emailNotExistsOnDatabase
Tests\Feature\AuthController\UserLoginTest::passwordMistake
Tests\Feature\AuthController\UserLoginTest::loginSuccess
Tests\Feature\AuthController\UserLogoutTest::testFailLogoutWhenNotBeLogin
Tests\Feature\AuthController\UserLogoutTest::testLogoutSuccess
Tests\Feature\BoxerController\DestroyBoxerTest::testDeleteBoxerWithoutAdminAuth
Tests\Feature\BoxerController\DestroyBoxerTest::testDeleteBoxerHasMatch
Tests\Feature\BoxerController\DestroyBoxerTest::testDeleteIfNotExistsBoxer
Tests\Feature\BoxerController\DestroyBoxerTest::testDeleteBoxerFailed
Tests\Feature\BoxerController\DestroyBoxerTest::testDeleteBoxer
Tests\Feature\BoxerController\IndexBoxerTest::testBoxerFetchDefault
Tests\Feature\BoxerController\IndexBoxerTest::testBoxerFetchWithLimit
Tests\Feature\BoxerController\IndexBoxerTest::testBoxerFetchWithAssignPageNum
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerWithoutTitles
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerWithTitles
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerWithFailedStoreTitle
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerReturnsAlreadyExistsErrorCodeWhenNameIsDuplicated
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerReturnsAlreadyExistsErrorCodeWhenEngNameIsDuplicated
Tests\Feature\BoxerController\StoreBoxerTest::testStoreBoxerReturnsNoErrorCodeWhenNameIsRequired
Tests\Feature\BoxerController\UpdateBoxerTest::testUpdateBoxerWithoutAdmin
Tests\Feature\BoxerController\UpdateBoxerTest::testUpdateBoxer
Tests\Feature\CommentController\IndexCommentTest::testCommentsFetchRequestWithNotExistsBoxingMatchId
Tests\Feature\CommentController\IndexCommentTest::testSuccessCommentsFetch
Tests\Feature\CommentController\IndexCommentTest::testSuccessCommentsFetchWithCursor
Tests\Feature\CommentController\IndexCommentTest::testCommentsFetchIgnoresLimitParameter
Tests\Feature\CommentController\StoreCommentTest::testPostWithNoAuth
Tests\Feature\CommentController\StoreCommentTest::testFailedPostComment
Tests\Feature\CommentController\StoreCommentTest::testPostByLoginUser
Tests\Feature\CommentController\StoreCommentTest::testPostByLoginUserWithMaxLengthComment
Tests\Feature\CommentController\StoreCommentTest::testPostByLoginUserWithEmptyComment
Tests\Feature\CommentController\StoreCommentTest::testPostByLoginUserWithTooLongComment
Tests\Feature\CommentController\StoreCommentTest::testPostByLoginUserWithoutMatchId
Tests\Feature\CommentController\StoreCommentTest::testPostByGuestUser
Tests\Feature\MatchController\DestroyMatchTest::testDeleteMatchSetUp
Tests\Feature\MatchController\DestroyMatchTest::testDeleteMatch
Tests\Feature\MatchController\DestroyMatchTest::testDeleteMatchIfMatchNotExists
Tests\Feature\MatchController\DestroyMatchTest::testDeleteMatchWithNoAdmin
Tests\Feature\MatchController\IndexMatchTest::testSetUp
Tests\Feature\MatchController\IndexMatchTest::testFetchMatchesDefault
Tests\Feature\MatchController\IndexMatchTest::testFetchPastMatches
Tests\Feature\MatchController\IndexMatchTest::testFetchAllMatchesWithoutAdminAuth
Tests\Feature\MatchController\IndexMatchTest::testFetchAllMatchesWithAdminAuth
Tests\Feature\Feature\MatchController\ResultStoreTest::testUpdateBoxerRecordWithResult
Tests\Feature\Feature\MatchController\ResultStoreTest::testUpdateBoxerRecordWithResultAndAlreadyHasResult
Tests\Feature\Feature\MatchController\ResultStoreTest::testUpdateBoxerTitleStateWhenRedBoxerWins
Tests\Feature\Feature\MatchController\ResultStoreTest::testUpdateBoxerTitleForResultDraw
Tests\Feature\Feature\MatchController\ResultStoreTest::testUpdateBoxerTitleAlreadyHasState
Tests\Feature\Feature\MatchController\ResultStoreTest::testAdjustTitleWithResult
Tests\Feature\Feature\MatchController\ResultStoreTest::testNotHasTitle
Tests\Feature\MatchController\StoreMatchTest::storeMatchSetUpTest
Tests\Feature\MatchController\StoreMatchTest::testStoreMatchWithTitleMatch
Tests\Feature\MatchController\StoreMatchTest::testStoreMatchWithNonTitleMatch
Tests\Feature\MatchController\StoreMatchTest::testStoreMatchWithNotAdmin
Tests\Feature\MatchController\StoreMatchTest::testStoreMatchReturnsVenueTooLongErrorCode
Tests\Feature\MatchController\UpdateMatchTest::testUpdateMatchFailedNoAdminUser
Tests\Feature\MatchController\UpdateMatchTest::testUpdateMatchWithOnlyTitlesData
Tests\Feature\MatchController\UpdateMatchTest::testUpdateMatchWithBothData
Tests\Feature\MatchController\UpdateMatchTest::testUpdateMatchReturnsVenueTooLongErrorCode
Tests\Unit\ApiRequestMiddlewareTest::testApiRequestToSnakeCase
Tests\Feature\PredictionController\FetchMatchPredictionTest::testFutureMatchPredictionsAreHiddenFromAnonymousUser
Tests\Feature\PredictionController\FetchMatchPredictionTest::testFutureMatchPredictionsAreHiddenFromUnvotedUser
Tests\Feature\PredictionController\FetchMatchPredictionTest::testFutureMatchPredictionsAreHiddenFromUnvotedGuest
Tests\Feature\PredictionController\FetchMatchPredictionTest::testFutureMatchPredictionsAreVisibleToVotedUser
Tests\Feature\PredictionController\FetchMatchPredictionTest::testFutureMatchPredictionsAreVisibleToVotedGuest
Tests\Feature\PredictionController\FetchMatchPredictionTest::testTodayMatchPredictionsAreVisibleToAnonymousUser
Tests\Feature\PredictionController\FetchMatchPredictionTest::testNotFoundIsReturnedForMissingMatch
```

## Frontend実行ファイル（52ファイル・204件）

| ファイル | テスト数 |
| --- | --- |
| `src/__test__/queryClient.test.tsx` | 1 |
| `src/components/atomic/__test__/FlagImage.test.tsx` | 5 |
| `src/components/module/Header/__test__/AdminMenuPopover.test.tsx` | 4 |
| `src/components/module/Header/__test__/Header.test.tsx` | 7 |
| `src/components/module/Header/__test__/HeaderAuthInfo.test.tsx` | 7 |
| `src/components/module/Header/__test__/HeaderDeviceSwitch.test.tsx` | 1 |
| `src/components/module/Header/__test__/HeaderNavigation.test.tsx` | 2 |
| `src/components/module/Header/__test__/SpAdminMenuPopover.test.tsx` | 4 |
| `src/components/module/Header/__test__/SpCommonMenuPopover.test.tsx` | 4 |
| `src/components/module/Header/hooks/__test__/useHeaderHeightRef.integration.test.tsx` | 1 |
| `src/components/module/Header/hooks/__test__/useHeaderHeightRef.test.tsx` | 2 |
| `src/components/module/MatchComponent/__test__/MatchView.test.tsx` | 4 |
| `src/components/module/MatchComponent/__test__/boxerRecord.test.ts` | 5 |
| `src/components/module/MatchComponent/component/MatchInfo/__test__/MatchInfo.test.tsx` | 14 |
| `src/components/module/MatchComponent/component/MatchInfo/__test__/TaleOfTheTape.test.tsx` | 2 |
| `src/components/module/MatchComponent/component/MatchInfo/components/__test__/BoxerTitles.test.tsx` | 6 |
| `src/components/module/MatchComponent/component/PredictionVoteModal/__test__/PredictionVoteModal.test.tsx` | 4 |
| `src/components/module/MatchSetForm/EditMatchForm/__test__/EditMatchForm.test.tsx` | 1 |
| `src/components/module/MatchSetForm/EditMatchForm/__test__/functions.test.ts` | 2 |
| `src/components/module/MatchSetForm/RegisterMatchForm/__test__/RegisterMatchForm.test.tsx` | 1 |
| `src/components/module/MatchSetForm/__test__/MatchSetForm.test.tsx` | 6 |
| `src/components/module/__test__/AdminNavigation.test.tsx` | 5 |
| `src/components/module/__test__/MatchCard.test.tsx` | 8 |
| `src/hooks/__test__/useInitializeDevice.test.tsx` | 5 |
| `src/hooks/__test__/useReactQuery.test.tsx` | 2 |
| `src/hooks/apiHooks/auth/__test__/useAdmin.test.tsx` | 8 |
| `src/hooks/apiHooks/auth/__test__/useAuth.test.tsx` | 3 |
| `src/hooks/apiHooks/auth/__test__/useGuest.test.tsx` | 2 |
| `src/hooks/apiHooks/auth/__test__/useGuestLogin.test.tsx` | 3 |
| `src/hooks/apiHooks/auth/__test__/useGuestLogout.test.tsx` | 2 |
| `src/hooks/apiHooks/auth/__test__/useLogin.test.tsx` | 3 |
| `src/hooks/apiHooks/auth/__test__/useLogout.test.tsx` | 2 |
| `src/hooks/apiHooks/auth/__test__/usePreSignUp.test.tsx` | 8 |
| `src/hooks/apiHooks/auth/__test__/useSignUpIdentification.test.tsx` | 4 |
| `src/hooks/apiHooks/boxer/__test__/useDeleteBoxer.test.tsx` | 4 |
| `src/hooks/apiHooks/boxer/__test__/useFetchBoxers.test.tsx` | 3 |
| `src/hooks/apiHooks/boxer/__test__/useRegisterBoxer.test.tsx` | 2 |
| `src/hooks/apiHooks/boxer/__test__/useUpdateBoxerData.test.tsx` | 2 |
| `src/hooks/apiHooks/comment/__test__/useDeleteComment.test.tsx` | 3 |
| `src/hooks/apiHooks/comment/__test__/useFetchComments.test.tsx` | 9 |
| `src/hooks/apiHooks/comment/__test__/usePostComment.test.tsx` | 8 |
| `src/hooks/apiHooks/match/__test__/useDeleteMatch.test.tsx` | 2 |
| `src/hooks/apiHooks/match/__test__/useFetchAllMatches.test.tsx` | 1 |
| `src/hooks/apiHooks/match/__test__/useFetchMatchById.test.tsx` | 1 |
| `src/hooks/apiHooks/match/__test__/useFetchMatches.test.tsx` | 1 |
| `src/hooks/apiHooks/match/__test__/useFetchPastMatches.test.tsx` | 3 |
| `src/hooks/apiHooks/match/__test__/useMatchResult.test.tsx` | 2 |
| `src/hooks/apiHooks/match/__test__/useRegisterMatch.test.tsx` | 2 |
| `src/hooks/apiHooks/match/__test__/useUpdateMatch.test.tsx` | 2 |
| `src/hooks/apiHooks/prediction/__test__/useFetchUsersPrediction.test.tsx` | 4 |
| `src/hooks/apiHooks/prediction/__test__/useVoteMatchPrediction.test.tsx` | 2 |
| `src/utils/validation/signUpValidation.test.ts` | 15 |


## 追加対応: 不要なTestページ参照の削除

- ユーザー依頼: `@/page/Test` は不要なので対処する。
- 提案した変更: `frontend/src/App.tsx` のTest importと `/test` Routeの2行だけを削除。`/test` は既存NotFoundルートで扱う。
- 未管理ファイルの追加・コピーや `.gitignore` の変更はしていない。
- 修正後: `npm run build` 成功、`npm test -- --run` 相当の全52ファイル・204テスト成功、`npm run lint` 成功。既存機能の新規テスト追加は不要と判断し、既存テストと実際のビルドで確認した。
- ビルドにはBrowserslistデータの古さと500kB超チャンクの既存警告がある。警告抑制や依存更新は行わない。
- 証跡: `/private/tmp/boxing-upgrade-s0/` の `frontend-build-without-test-page.log`、`frontend-test-without-test-page.log`、`frontend-tests-without-test-page.json`、`frontend-lint-without-test-page.log`。
- Reviewer: 差分レビュー完了。「問題なし」。追加修正・新規テスト不要。ブラウザでの `/test` 表示は未確認。コミット未実施。
- MySQLの二重主キー問題は変更していない。新しいworktree専用の障害ではなく、同じ履歴から空のMySQL DBを構築する場合の既存不整合として扱う。S0保留・S1未着手を維持する。


## 追加対応: 二重主キーを解消するマイグレーション修正

- 承認範囲: `2024_12_23_234609_update_boxer_title_snapshots_table.php` で、idカラムを削除してから既存4列の複合主キーを作成する。
- `up()`はSchema処理を分け、id削除→複合主キー追加の順序を明示した。
- `down()`はmatch_id外部キーを一時解除→複合主キーを削除→id主キーと元のmatch_id外部キー（cascade）を復元する。外部キー用索引を手動で足す初期案は再適用時に重複するため採用していない。
- `down()`で元のidカラム構造は戻るが、削除前のid値は復元しない。既存データを戻す場合はバックアップが必要。
- 検証専用の空DB `boxing_upgrade_s0_fixed` で全34マイグレーションが成功。対象表はidなし、主キーは順にmatch_id / boxer_id / organization_id / weight_division_id。
- 複製DB `boxing_upgrade_s0_rollback` でdown→upを2サイクル実行し成功。さらに関連テーブルと代表スナップショットを作り、down→up後の4列・state保持、同一複合キーの重複拒否、試合削除時のsnapshot連動削除を確認した。
- MySQLの確認は隔離DBのみ。SQLiteでは既存全テストのup経路を確認した。SQLiteでのdownは検証対象外であり、成功を主張しない。
- 最終バックエンド全テスト: 93件検出、92成功 / 1スキップ / 250 assertions、errors / failures / warnings 0。既存スキップ1件は変更していない。
- 完全構築DBにFactoryの合成ユーザー1件を作成してダンプし、`boxing_upgrade_s0_fixed_restore` へ復元。双方20テーブル・migrations34件、復元先の合成ユーザー1件を確認した。
- 既存の部分DB `boxing_upgrade_s0` と過去の証跡は維持している。Web用PHPプロセスの接続先はまだ旧検証DBのため、ブラウザ確認前に修正済みDBへの接続設定の切替が必要。
- 証跡: `/private/tmp/boxing-upgrade-s0/mysql-migrate-id-fixed.log`、`mysql-id-down-up.log`、`mysql-id-data-roundtrip.log`、`mysql-full-restore-check.log`、`mysql-full-baseline.sql`、`backend-test-id-migration-final.log`、`s0-tests-id-migration-final.xml`。
- 一時ダンプ・tmpfsは恒久資産ではない。再開時は接続先と保存状態を再確認する。
- Reviewer: 最終証跡の再確認まで完了。「問題なし」。未解決の実装指摘なし。コミット未実施。
- S0は主要ブラウザ確認待ち。S1には進まない。


## 最終確認: ブラウザ・実HTTP・メール・日次処理

### 範囲と準備

- ユーザーからS0の残りの実操作を確認する指示を受領。S1開始の承認ではない。
- 検証用backend `.env` の接続先を `boxing_upgrade_s0_fixed` へ切り替えた。起動URLはfrontend `http://127.0.0.1:13000`、API `http://127.0.0.1:18080`。
- frontendの既存 `.env.example` にあるサイト名・説明・URL・ゲスト表示名を検証用 `.env.local` に補った。サイト名未設定ではHelmetのtitle検証で詳細画面が描画できなかったが、設定を補い再読み込みすると正常に表示された。ソース修正で隠していない。
- APIのみのFactoryで通常ユーザー・管理者・将来日の試合とスナップショットを作成した。使用したデータはすべてS0専用の合成データ。外部サービスの既存アカウント・メールアドレスは使用していない。
- 認証・投稿・投票・登録の実操作はCodexのブラウザで行った。CSRF保護や認可を無効化せず、通常のフォーム・Cookie経路で検証した。
- メールはDBキューを使用。ローカルSMTP受信（127.0.0.1:11025）を用意し、コンテナからhost.docker.internal経由で接続。外部へのメール送信はしていない。
- 今回の追加確認では実装・テストコード・lockの変更なし。追跡対象の更新は結果を記録する文書のみ。環境設定と合成データはGit対象外。

### ブラウザ確認結果

| 項目 | 結果 |
| --- | --- |
| 通常ユーザーログイン | 名前付きユーザーメニューとログイン成功表示を確認 |
| 試合一覧・詳細 | 合成試合と選手情報・戦績・会場・予想表示が正常 |
| 通常ユーザーのコメント | 投稿成功表示と一覧反映。再読み込み後も表示 |
| 通常ユーザーの投票 | 投票成功表示、あなたの投票、1票・100%を確認 |
| セッション・保存結果 | 再読み込み後も通常ユーザー認証・投稿・投票結果を維持 |
| 通常ユーザーの管理画面 | 管理者用の登録画面へ直接遷移するとホームへ戻される |
| 通常ユーザーログアウト | ログアウト成功表示とログインフォームへの復帰 |
| ゲストログイン・投稿・投票 | ゲスト表示、コメント反映、投票成功、合計2票・50%ずつを確認 |
| ゲストログアウト | ホームへ戻り、ログインフォームが再表示される |
| 管理者ログイン・画面 | 管理用4導線を表示し、選手登録フォームへ遷移できる |
| 管理者ログアウト | 通常のログインフォームへ復帰 |
| 仮登録 | 入力条件を満たす合成データで「仮登録が完了しました」を表示 |
| メール経由の本登録 | SMTP受信本文のリンクをクリックし「アカウントが作成されました」を表示 |
| 新規登録ユーザーのログイン | 本登録時に指定した資格情報でログインし、S0 New Userのメニューを表示 |
| 過去試合0件 | 「過去の試合が見つかりませんでした」と表示 |
| 削除した `/test` | 既存NotFound画面で「404 Not Found」を表示 |

### 実HTTPの補完確認（22項目すべて成功）

- CSRF Cookie取得204、トークン欠落・不正でログイン419、正しいCookie＋トークンでログイン200。
- Cookie付きの後続API呼び出しでセッション継続。許可したfrontend OriginとcredentialsのCORSヘッダーを確認。
- 未認証のコメント投稿401、通常ユーザーの管理者限定書込み401、通常ユーザーのコメント削除401。
- 管理者で同じ検証コメントの削除200、再取得時に削除されたコメントがないことを確認。ブラウザUIには削除導線が見当たらないため、削除だけは実HTTPで補完した。
- 通常・管理者ともAPI経由のログアウト200。
- 管理者判定APIは認可拒否のHTTPエラーではなく真偽値を200で返す既存仕様。falseが空本文として返る形式も考慮して検証した。初期の検証スクリプトの期待値を修正したもので、アプリの認可を変更したわけではない。
- 証跡: `/private/tmp/boxing-upgrade-s0/http-checks.json` / `http-checks.log` / `http_checks.py`。セッションCookie・CSRFトークン・パスワードは結果ログへ出力していない。

### メール・キュー・登録後DB

- 仮登録後のjobs1件とpre_users1件を確認し、`php artisan queue:work --once --queue=default --tries=1` を実行した。
- MailSendJobがProcessedになり、ローカルSMTPで件名 `BOXING TALKING 【アカウント作成】` のメールを1件受信した。
- 受信メールのHTMLをローカルのプレビュー（127.0.0.1:11026）で開き、実際のボタンから本人確認画面へ遷移して本登録が完了した。
- 最終DB確認: 合成の本登録ユーザー1件、対応pre_users0件、jobs0件、failed_jobs0件。
- 生メール・検証鍵・確認用tokenはコミットしない。外部SMTP・実受信サービスでの配送可否は検証対象外。

### 日次削除処理

- S0専用DBへ、2日前に論理削除したゲスト、前日に論理削除したゲスト、当日論理削除したゲスト、未削除のゲストを作成した。
- `delete_logout_guest_users:info` を実行し、2日前の対象だけが物理削除され、前日・当日・未削除の対象が残ることを確認した。実装の `whereDate(deleted_at, '<', yesterday)` 相当の現行境界を記録したもので、削除仕様を変更していない。
- コマンドの終了コードだけでなく各行の存在をDBで確認した。OSのcron常駐や本番スケジューラーは操作していない。

### 最終自動検証と証跡

- backend: **93件検出、92成功 / 1スキップ / 250 assertions**。errors / failures / warnings 0。
- frontend: **52ファイル・204成功**。最終設定で全Vitestを再実行し、ビルドも成功。
- lintは現在の実装差分で成功済み。今回の追加確認ではソース変更がないため再実行は省略。
- 既存のスキップ1件、React Router future flag警告、Browserslistデータとチャンクサイズのビルド警告は既知の基準として残す。今回一括抑制・依存更新はしていない。
- 最終証跡: `/private/tmp/boxing-upgrade-s0/backend-final-baseline.log`、`s0-final-baseline.xml`、`frontend-final-baseline.log`、`frontend-final-baseline.json`、`frontend-final-build.log`、`browser-mail-worker.log`、`daily-job-check.log`。
- ブラウザ画像: 同ディレクトリの `browser-user-vote.png`、`browser-guest-vote.png`、`browser-admin-page.png`、`browser-signup-success.png`。
- Reviewer: 最終実操作と証跡のレビュー完了。S0完了判断は妥当、未解決の実装指摘なし。コミット未実施。S1は開始しない。

### 残リスク

- 確認は上記ローカル構成に限定する。HTTPS / ALB / 本番設定・実利用者データ・外部メール配送・OS cron運用の保証ではない。
- HTTP送信元・CSRFのLaravel 13での変更は、計画どおりS6でHTTPS経路を含め再確認する。
- キュー失敗時の振る舞い等のテスト不足はS1の変更方針に反映する。今回の正常系受信成功から失敗経路まで保証したとはしない。
- 一時設定・ログ・SMTPプレビュー・DB tmpfsは恒久的な復旧資産ではない。再開時にコンテナ・イメージ・lock・接続先を再確認する。


### 最終判定と画像の補足

- S0は完了。初回に記録したビルド・MySQLの問題は承認済み修正で解消し、残っていた実操作も成功した。
- Reviewerは実HTTP22項目、メール・キュー・登録後DB、日次処理、最終自動テストとビルドを確認し、未解決の実装指摘なしと評価した。
- `browser-signup-success.png` は遷移直後の空本文が写っていたため、登録完了の視覚的証拠としては使用しない。本登録成功はブラウザの「アカウントが作成されました」の確認、登録後DB、新規ユーザーのログインで検証した。
- 描画完了後の `browser-new-user-logged-in.png` を追加取得し、画面右上にS0 New Userが表示された状態を確認した。通常・ゲスト投票と管理者画面の画像はReviewerが内容を確認済み。
- S1未着手。作業は `codex/laravel-php-s0` の未コミット差分として保持する。次段階前に今回の変更を保存し、S1の具体的方針・開始承認を別途確認する。
