# P6: 最終統合検証・公開準備の作業案

## Goal

P0〜P5の最終構成を合成隔離環境で再構築・総合検証し、検証結果と公開前の未解決事項を判断可能にする。P6検証完了、本番公開可否、実デプロイを分ける。本書は未承認の提案であり、実行承認ではない。

## Background / Context

- 2026-11-02 JST。元worktreeと既存mysql-lts-update worktreeはともに`710864720e67f1c0042278536ddd9f8531eb9184`、計画作成前cleanを確認。元branchは`codex/laravel-php-upgrade`、作業branchは`codex/mysql-lts-update`。P5は保存・元branchへのff-only統合済み、push未実施。
- [全体計画](2026-10-22-dependency-runtime-update.md)と[P5記録](archive/dependency-runtime/2026-11-02-mysql-lts-update.md)の保存直前の「未コミット」「元branch統合別」は当時の履歴。P0〜P3完了、P4個別更新・統合済みだが残監査により全体未完了、P5完了、P6実行未着手。
- 引き継ぎ上の元環境はMySQL8.4.13固定digest、新volume `boxing_talking_mysql84_data`、通常利用再開済み。20table/53migration履歴/jobs3/failed0はP5切替確認時の値であり、現在不変とは主張しない。
- 旧my_data/8.0.21 image、元worktreeの`docker/db/backup/mysql-lts-update-p5-20261102/`、停止済み合成DB volumeを保持する。P5の比較結果・テストログ・検証スクリプト275ファイルは、元worktreeのGit除外`docker/db/p5-archive/20261102/`へ保存し、保存元との全件一致を確認済み。再構築可能なruntime本体と合成dumpは保存対象外。SQL本文は機密として参照・表示しない。
- 比較基準はbackend173識別子=172成功/既存skip1/446assertions、frontend52ファイル204成功。MySQL全件は固定ID fixtureと採番rollback仕様のためP5同様process isolationが必要。
- 監査・版は過去記録であり、今回再取得していない。frontend moderate14/devのみ・omit-dev0/2advisory、Composer Mime medium1、Node24.22.1暫定版を未解決として引き継ぐ。

## Scope

### In Scope

- 承認後に、元worktree `/Users/terashimamasato/learns/my_project/boxing_talking`を使用し、必要ならその中で`codex/security-runtime-final-check` branchを作成する。新worktreeは作成しない。P5作業用worktreeは記録保存後に削除することを別途承認済みで、継続利用しない。P6実行の承認は含まない。
- lockと固定imageからの独立再構築、全自動テスト、production buildを使う画面/API、合成ローカルメール/queue/日次処理、DB fresh/論理移行/復元の総合確認。
- 監査・サポート・暫定版の再評価と、公開前課題・復旧手順・検証限界の記録。
- 成果物は本計画の結果追記、全体計画/計画一覧の現在状態整理、必要なREADMEの検証/復旧情報。テスト補助/専用Compose等は実行前の構成提示後、承認範囲内だけで追加する。

### Out of Scope

- 実.env/.env.production/実鍵の本文参照・表示・コピー、実バックアップSQL本文参照、実データ複製。
- 元環境のDB更新・migration/seed/RefreshDatabase/worker、コンテナ再起動、設定変更、既存jobs処理。
- 依存/image版更新、監査ignore/強制override、アプリ仕様変更、既存fixture修正。必要なら別提案・承認。
- 定期DBバックアップ機能の実装、既存バックアップ/旧DB/image/volume/runtimeの削除。
- 外部SMTP/SES/S3、本番設定/鍵確認、本番HTTPS検証、push、元branch統合、デプロイ。いずれも別途承認。

## Impact Area

| 対象 | 承認後の扱い |
| --- | --- |
| frontend/backendのtracked source・lock | 検証対象。機能・依存更新は行わない |
| Docker構築 | 現行Dockerfileから専用imageを構築し、元の稼働image/containerへ適用しない |
| 隔離runtime | P6専用project/network/volume/vendor/node_modules/storageを使いP5証跡を上書きしない |
| DB/メール/queue | 合成専用。実DB/network/credentialsとは分離 |
| docs/plans・README | 実行結果、保存/統合状態、残課題、復旧制約を記録 |

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| A: P5証跡の整理だけ | 実行負荷と変更が少ない | 最終frontend/backend一体の画面・メール等を再実証できない |
| B: 合成隔離環境で最終再構築・総合検証 | 通常利用と保持証跡を保護し、最終構成を実証できる | 専用構成・検証時間が必要。本番適合は別確認 |
| C: 元環境を再構築して総合検証 | 元環境での直接確認が可能 | 稼働停止・実データ/既存jobsへの影響があり今回の制約に合わない |

## Decision

案Bを提案する。今回は計画書作成とReviewer設計レビューまで。P6の検証用設定作成・環境起動・テスト実行は承認後とする。

## Rationale

P5は既に実データ切替と通常利用再開まで完了している。再切替・実DBテストの利益よりリスクが大きい。最終lockの再現性と主要動作を独立環境で確認し、P5の実データ保持証跡と併記する方法を採る。更新候補の評価と適用を分け、失敗原因と承認範囲を明確に保つ。

## Tasks

- [x] Git状態、規約、全体計画/P4保留/P5記録を読み取りで確認。
- [x] Reviewer subagentの設計評価を反映。必須指摘なし、Git除外/権限とSMTP healthの任意補強を採用。
- [ ] ユーザーの実行承認を得る。
- [ ] P6-1: 作業branch/HEAD/lock hashを記録。実行前に専用project・mount・network・ポート・DB名・生成先・容量を確定し、通常環境とP5保存物を参照しないことを検査する。不一致なら起動しない。
- [ ] P6-2: tracked sourceのみを専用runtimeへ準備。env/鍵/storage/vendor/node_modules/config cacheは流用せず、合成設定/鍵を新規生成。runtimeのGit除外を確認し、親700、設定/鍵/SQL/認証証跡600で保存する。Docker内で独立vendorへComposer install、独立node_modulesへnpm ci。lock不変、platform要件、実版/digestを記録する。
- [ ] P6-3: backend SQLite/MySQL全件、frontend全件/build/lint、Storybook/coverage/Vitest UIを確認。
- [ ] P6-4: 合成DBでfresh/既存相当の論理移行/別DB復元、実HTTP/HTTPSとproduction buildのブラウザ、メール/実queue/日次処理を確認。
- [ ] P6-5: lockを変えずComposer audit、npm audit全依存/omit-devを再取得。公式advisoryと上流依存範囲、各runtimeの公式サポート情報を実行日時付きで確認。P4再開条件、Mime修正経路、Node候補imageの存在を評価し、更新は別提案とする。
- [ ] P6-6: 証跡・未実施・既存警告/新規問題・公開前課題・復旧情報を整理。Reviewer subagentで結果/文書差分を確認し、文書のリンク/diffチェックを行う。
- [ ] 合成環境を停止しvolume/証跡を保持。P6検証結果と保存候補差分を報告する。commit/元統合/pushは別依頼を待つ。

## Test Plan

全PHP/artisan/PHPUnit/ComposerはDocker内、frontendも現行Node imageのDocker内。実行前に実効接続先・専用DB名/空状態・mountを確認する。通常Composeのテストコマンドで代用しない。

| 検証 | 方法・保証する振る舞い |
| --- | --- |
| lock再現性 | 空の独立vendor/node_modulesへinstall/ci、Composer validate/check-platform-reqs、lock上の依存整合と前後hash比較。既存共有依存は再構築しない |
| backend全件 | SQLiteとMySQL8.4の各173識別子を照合し、172成功/既存skip1/446assertionsを基準に差分理由を記録。MySQLはP5と同じprocess isolation。新規skip/failure/error/riskyを許容しない |
| frontend | `npm test -- --run`、`npm run build`、`npm run lint`。52ファイル204件を基準に差分理由を確認 |
| 開発補助 | `npm run build-storybook`とloopback起動・代表story表示、非対話coverage生成、Vitest UI起動/結果表示。VoteIcon単独storyの既知RecoilRoot不足は別記し、全story成功とは記録しない |
| DB構築/移行/復元 | 新規8.4への35migration/20table、合成の旧版相当DBから8.0.46経由8.4への論理移行、8.4 dumpを別専用volumeへ復元。内容/列/索引/FK/CHECK/採番を比較。元53履歴の再現や実データの再検証とは区別する |
| DB/PHP | 合成ユーザーのcaching_sha2_password接続、CRUD/rollback/2接続ロック。保存用baselineをテスト実行先にしない |
| HTTP/HTTPS | Cookie/CSRF/CORS/認証/認可/validation/エラー形式、Laravel13送信元/token組合せを既存ケースに沿って確認。HTTPSは隔離CAをclient単位で信頼し、OS信頼変更・証明書警告迂回を行わない |
| 主要画面 | production buildでPC/SPのhome/試合一覧・詳細/過去一覧/空状態、guest/一般/admin login/logout、管理URL拒否、コメント保存後reload、削除権限、投票と集計、管理フォームを確認。API status/JSONと画面再表示を照合する |
| 登録/メール/queue | 外部送信不能なlocal SMTP sinkのhealthを送信前に確認し、専用queueで仮登録→実database worker→HTML受信リンク→本登録→login。正常/失敗時のusers/pre_users/jobs/failed_jobs状態を確認。合成宛先だけを使う |
| session/cache/日次/log | 保存session/cache形式の互換を既存S9手順に沿って確認。`delete_logout_guest_users:info`のTokyo日付境界と対象選別、合成ジョブ後の状態を確認。ログは秘密値を出力せず、新規例外の有無を記録する |
| 監査 | exit codeだけで判定せずseverity/package数/advisory ID/実利用/修正経路を記録。P4保留とMimeを0件扱いしない。情報取得失敗は未確認とする |

テスト追加は件数目的で行わない。公開動作の保証に不足が見つかった場合は、そのケースと変更範囲を提案し、承認後に追加する。既存ケースが網羅する振る舞いは再利用する。

### 完了判定

- lockからの再構築と上記必須検証が成功し、既存skip/警告との違いを説明できること。未実施の必須検証があればP6検証完了にしない。
- P5証跡を再利用する項目は、再利用理由・対象commit/構成一致・未再実行範囲を個別に明示する。失敗を過去の成功で置き換えない。
- P6の検証完了と、P4全体完了・全脆弱性解消・本番公開可は別判定。重大残課題や未承認の必須運用項目が残れば公開可能としない。

## Risks

- 通常利用再開後の新しい更新があり得る。旧DBへ単純rollbackせず、障害時は最新8.4データを保全し、再開後差分の回収/整合を含めて復旧案を再承認する。8.4データを8.0で開かない。
- 合成環境の成功だけで本番HTTPS/Cookie/CSRF/CORS、鍵強度/生成方法、外部SMTP/SES/S3、queue worker/cron/監視、切替/cache/worker再起動順序を確認済みにしない。公開前の担当/手順/承認待ち事項として一覧化する。
- 定期backupは未実装のまま後日対応。今回はP5復旧資材の所在と、最新dump/別DB復元/保持期間/監視等の未整備事項を文書化するだけで、自動化や実DBへの新規dumpは行わない。
- Node暫定版、Mime、P4 advisoryは時点情報。修正版が見つかっても勝手に更新せず、影響と追加検証を提案する。
- 新規障害・想定外依存変更・network/mount混入・OOM等を検知したら該当検証を停止し、証跡を保持して報告する。失敗ログを成功で上書きしない。
- 長時間の全件/再構築を含む。検証用の追加コストが生じるが、委任はReviewerだけとし、主エージェントが調査・設定・検証を担当する。
