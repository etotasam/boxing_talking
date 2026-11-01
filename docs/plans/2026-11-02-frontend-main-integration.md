# P4のmain-worktree統合・起動確認

## Goal

P4の変更・保留記録を元worktreeの現在のブランチへ統合し、衝突・テスト・通常起動を確認した後、作業用worktreeへ戻る。ユーザーが実行を明示承認済み。

## Background / Context

- 2026-11-02 JST。統合元は専用worktreeのcodex/frontend-build-update（実装先端a2e3e709、P4j調査文書は未commit）。統合先は元worktreeのcodex/laravel-php-upgrade、a5648642。
- 統合先は統合元の祖先で、fast-forward可能。frontend/runtime以外のアプリ差分はない。
- 元側に以前のP1〜P3統合結果のtracked文書2件とuntracked統合文書/.codex環境ファイルがある。ユーザー差分は保持し、今回のcommitに含めない。環境ファイルは参照しない。
- 元Composeのweb/php/node/dbは稼働中。DB/queueは既存状態を維持する。

## Scope

- P4j調査と本計画を作業側へ保存し、元branchへff-onlyで統合。
- 元tracked文書だけをpath指定でstash退避し、統合後に復元。全体計画書の文書衝突はP4進捗と元P1〜P3記録を両方保持して解決する。コードの分岐があれば再評価する。
- ff前に実nodeを一時停止し、旧依存で新ソースをhot-reloadさせない。既存named volumeを別volumeへ複製してから通常npm ci。元サービスを再起動して開発画面/APIの読取動作を確認。
- 既存DB/queueの前後hashを比較。backend全件は統合ソース+実vendorの完全隔離環境で実行し、元DBでテストしない。
- frontendは元の実依存volumeと秘密env/生成物を除いた統合ソースのコピーで全204件・lint/型/build/coverage/Storybook/UIを確認。
- テスト後に結果を作業側へ保存して元側へ追加ffし、両branchが同じ実装/記録を含む状態で作業用worktreeへ戻る。

### Out of Scope

- 新規仕様/テスト追加、Node/MySQL/Composerの追加更新、本番反映、push。
- 元DBのmigrate/fresh/seed、既存queueのworker/retry/delete、実アカウント/投稿/投票の作成。
- 本番env/secret参照、元環境ファイル編集、未追跡環境ファイルのstage、元ユーザー文書のcommit。

## Impact Area

P4のfrontend・計画文書、元node_modules volumeとnodeサービス。backendコード/DB/imageは今回変更しない。MySQLのcontainer/volumeを再作成しない。

## Options / Decision

- ff-onlyを採用。祖先関係を保持して重複commitや不要なmerge commitを作らない。
- 通常merge commit/cherry-pickは不要なため不採用。元文書はpath指定stashと別のbyte backupの両方で保護し、統合内容を失わず復元する。
- 既存node_modulesをbackup volumeへ複製してから再導入し、失敗時の旧依存を保持する。元vendorは読取専用で隔離テストへ利用する。

## Tasks

- [x] 元/作業側のbranch・HEAD・差分・祖先関係を確認、元文書を別保存。
- [x] Reviewerによる統合/保持/検証方針確認（補正後問題なし）。
- [ ] 調査文書と本計画をcommit、元文書退避、ff統合・文書復元。
- [ ] 元DB/queue基準取得、依存backup/ci、全件・各build、元環境再起動・読取確認。
- [ ] DB/queue不変、元ユーザー差分保持、最終Reviewer確認。
- [ ] 結果記録・保存と元側への追加ff、作業用worktreeへ戻って報告。

## Test Plan

- npm ci/実npm ls exit0、全52ファイル204件・coverage207対象・lint/型/build/Storybook、既存story/Vitest UI。既知VoteIcon RecoilRoot制限は基点と区別。
- backendは元DBと通信不能なDocker内で既存173識別子（172成功・skip1）を確認。既存sqlite設定はdatabase.sqlite固定のため、隔離コピーの一時phpunitでDB_CONNECTION=testing・DB_TEST_DATABASE=:memory:をforce指定し、実効connection/databaseを先に確認する。合成キー/array mail/queueを用い、元envをコピーしない。
- 元localhost:3000/8080で一覧→詳細/過去/規約の読取表示を確認。実ログイン・登録等の書込を伴う操作はしない。
- MySQL全tableのschema/行数/内容hashとjobs/failed_jobsを前後比較し、元DB/queue不変を確認。DB内容/secretはログやチャットへ出さない。
- 元tracked文書の既存追記・untracked文書のbyte維持、環境ファイル未参照/未変更、git未解決なしを確認。

## Risks

- 元に既存変更があるため、stashは残して復元を検証し、紛失を防ぐ。元の履歴記録は古い日付の事実として保持する。
- 元nodeは依存再導入中に一時停止する。web/php/dbの既存状態・IDを保持、queue workerは起動しない。
- moderate14と2advisoryは未解決の保留事項。統合成功を監査0/P4全体完了や本番公開可能と扱わない。
- 復旧は保存した元HEAD/文書/依存volumeを用いて個別に判断し、reset --hardや強制削除を行わない。

## Evidence

Git除外docker/db/backup/frontend-main-integration-p4k-20261102へ文書backup・状態/依存/DBhash/テスト/ログ/結果を保存。DB内容・鍵・envを含めない。

## Reviewer設計確認の補正

- SQLite標準設定がDB_DATABASEを使わずdatabase.sqlite固定である点を指摘。隔離コピーだけにtesting/:memory:をforceした一時phpunitを作り、実効接続を検証してから全件を実行する。
- 元Viteのhot-reloadを避けるため、node停止をff前へ移動。元web/php/dbは維持する。
