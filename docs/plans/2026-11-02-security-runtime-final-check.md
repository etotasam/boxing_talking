# P6: 最終統合検証・公開準備の作業案

## Goal

P0〜P5の最終構成を合成隔離環境で再構築・総合検証し、検証結果と公開前の未解決事項を判断可能にする。P6検証完了、本番公開可否、実デプロイを分ける。P6-1の事前確認は完了。その後、ユーザーが4担当への委任と追加コストを含めP6-2〜P6-6の実行を承認した。依存更新の適用・本番操作・通常DBへのテストは含まない。

## Current Progress

2026-11-03 JST。承認済み縮小範囲のP6-1〜P6-6検証・最終レビュー・停止/保全とP5/P6検証ソースの整理は完了・PASS。その後のユーザー承認で、過去検証の停止済みcontainer18件と未使用image17件も除去した。現在は通常稼働4container/4imageのみ。全30volume metadata・通常4の起動情報は不変、実backup/旧my_data/P5・P6 archiveも保持。追加image整理の削除後独立確認PASS・必須指摘なし。
証跡等764payloadはGit除外`docker/db/p6-archive/20261103/`へ保全済みで、削除後も全件hash/byte数/600を確認した。過去節のruntime/evidence等のパスは当時の所在であり、現存する保存先はarchive manifestの対応表を参照する。ユーザーのcommit依頼により、検証記録・監査報告・README更新と検証用ソース削除を本コミットで保存する。Git除外証跡/backupや無関係な`.vscode/`は含めない。ゴミ箱の消去、push、依存更新、本番操作は未実施。過去節の未commit表記は当時の状態。P6ローカル検証の完了と、未解消監査・本番公開可否は別判定。

## Background / Context

- 2026-11-02 JST。元worktreeと既存mysql-lts-update worktreeはともに`710864720e67f1c0042278536ddd9f8531eb9184`、計画作成前cleanを確認。元branchは`codex/laravel-php-upgrade`、作業branchは`codex/mysql-lts-update`。P5は保存・元branchへのff-only統合済み、push未実施。
- [全体計画](2026-10-22-dependency-runtime-update.md)と[P5記録](archive/dependency-runtime/2026-11-02-mysql-lts-update.md)の保存直前の「未コミット」「元branch統合別」は当時の履歴。P0〜P3完了、P4個別更新・統合済みだが残監査により全体未完了、P5完了、P6実行未着手。
- 引き継ぎ上の元環境はMySQL8.4.13固定digest、新volume `boxing_talking_mysql84_data`、通常利用再開済み。20table/53migration履歴/jobs3/failed0はP5切替確認時の値であり、現在不変とは主張しない。
- 旧my_data/8.0.21 image、元worktreeの`docker/db/backup/mysql-lts-update-p5-20261102/`、停止済み合成DB volumeを保持する。P5の比較結果・テストログ・検証スクリプト275ファイルは、元worktreeのGit除外`docker/db/p5-archive/20261102/`へ保存し、保存元との全件一致を確認済み。再構築可能なruntime本体と合成dumpは保存対象外。SQL本文は機密として参照・表示しない。
- 比較基準はbackend173識別子=172成功/既存skip1/446assertions、frontend52ファイル204成功。MySQL全件は固定ID fixtureと採番rollback仕様のためP5同様process isolationが必要。
- 監査・版は過去記録であり、今回再取得していない。frontend moderate14/devのみ・omit-dev0/2advisory、Composer Mime medium1、Node24.22.1暫定版を未解決として引き継ぐ。

## Scope

### In Scope

- 承認後に、元worktree `/Users/terashimamasato/learns/my_project/boxing_talking`を使用し、必要ならその中で`codex/security-runtime-final-check` branchを作成する。新worktreeは作成しない。P5作業用worktreeは記録保存後に削除することを別途承認済みで、継続利用しない。worktree整理の承認と、その後のP6実行承認は別に記録する。
- lockと固定imageからの独立再構築、全自動テスト、production buildを使う画面/API、database queue/日次処理、DB fresh/論理移行/復元の総合確認。queueは承認済み範囲変更によりP5成功証跡を再利用する。
- 監査・サポート・暫定版の再評価と、公開前課題・復旧手順・検証限界の記録。
- 成果物は本計画の結果追記、全体計画/計画一覧の現在状態整理、必要なREADMEの検証/復旧情報。テスト補助/専用Compose等は実行前の構成提示後、承認範囲内だけで追加する。

### Out of Scope

- 合成ローカルメール送信・登録フロー全体の再検証。2026-11-03のユーザー承認で、今回のqueue確認はDB保存/取得/処理/削除に限定した。
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

案Bを提案する。当初の計画書作成・Reviewer設計レビュー後、P6-1の事前確認のみユーザー承認を得た。その後、4担当分担の提案に対するユーザーの「go ahead!」により、P6-2〜P6-6の検証用設定作成・合成環境起動・検証実行を承認済み。

## Rationale

P5は既に実データ切替と通常利用再開まで完了している。再切替・実DBテストの利益よりリスクが大きい。最終lockの再現性と主要動作を独立環境で確認し、P5の実データ保持証跡と併記する方法を採る。更新候補の評価と適用を分け、失敗原因と承認範囲を明確に保つ。

## Tasks

- [x] Git状態、規約、全体計画/P4保留/P5記録を読み取りで確認。
- [x] Reviewer subagentの設計評価を反映。必須指摘なし、Git除外/権限とSMTP healthの任意補強を採用。
- [x] P6-2〜P6-6の実行とWorker/Tester2名/Explorerへの委任について、担当・並行化理由・追加コストを提示し、ユーザー承認を得た。
- [x] P6-1: 作業branch/HEAD/lock hashを記録。専用project・mount・network・ポート・DB名・生成先・容量の構成案と既存資源の衝突を確認。実行用Composeの実効mount/network/接続先検査はP6-2で別途行い、不一致なら起動しない。
- [x] P6-2: tracked sourceのみを専用runtimeへ準備。env/鍵/storage/vendor/node_modules/config cacheは流用せず、合成設定/鍵を新規生成。runtimeのGit除外を確認し、親700、設定/鍵/SQL/認証証跡600で保存する。Docker内で独立vendorへComposer install、独立node_modulesへnpm ci。lock不変、platform要件、実版/digestを記録する。
- [x] P6-3: backend SQLite/MySQL全件、frontend全件/build/lint、Storybook/coverage/Vitest UIを確認。
- [x] P6-4: 合成DBのfresh/論理移行/別DB復元、実HTTP/HTTPS、最小production buildブラウザ接続を確認。日次は今回の全件テスト内2件成功、database queueはP5成功証跡を再利用。メール/登録フロー全体と機能/全画面総当たりは承認済み縮小範囲の対象外。
- [x] P6-5: lockを変えずComposer audit、npm audit全依存/omit-devを再取得。公式advisoryと上流依存範囲、各runtimeの公式サポート情報を実行日時付きで確認。P4再開条件、Mime修正経路、Node候補imageの存在を評価し、更新は別提案とする。
- [x] P6-6: 結果・対象外・既存警告/失敗履歴・監査/運用残課題・復旧情報を整理。Reviewer独立最終確認PASS・必須指摘なし。文書参照先97件存在・diffチェック成功。工程3の専用停止/保全は別途未実行。
- [x] 合成環境停止/証跡保全と独立確認後、ユーザー承認の削除を実施。P6専用container/networkと検証ソースを削除、生成dir3件はゴミ箱移動。4volume/参照imageとarchiveを保持。削除後の独立確認PASS・必須指摘なし、commit/元統合/pushは別依頼。

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
| 主要画面 | 承認済み縮小案によりproduction buildのPC/SP初期表示、実APIの一覧→詳細、詳細URL直接reloadに限定して成功。一般合成login1回は閲覧準備。全画面/全権限/全フォームを再走査せず、既存frontend/backendテストと実API結果を根拠にする |
| database queue | ユーザー承認により、DBへの保存・実worker取得/処理・削除に限定。P5の合成1job成功証跡をmanifestと関連code/lock照合で再利用し、新workerは実行しない。メール送信・登録フロー全体は対象外 |
| session/cache/日次/log | session/cacheは別process往復とHTTP sessionで確認済み。日次は今回のMySQL/SQLite DeleteGuestUserTest各2件/14assertionsの成功を利用し、追加手動実行なし。例外/失敗の履歴は削除せず、最終成功と区別する |
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

## P6-1: 事前確認結果（2026-11-02 JST）

### 承認範囲と作業基点

- ユーザーへP6-1を説明後の「go ahaed」を、事前確認の実行承認として扱う。主エージェントがbranch/lockと既存Dockerメタデータを確認し、専用構成案を記録した。P6全体の実行承認には広げない。
- 元worktree `/Users/terashimamasato/learns/my_project/boxing_talking`、branch `codex/laravel-php-upgrade`、HEAD `0beb3ef8b0cd5a90df3f0da67fadc5aecd7f5ba7`。開始時clean、新worktree/branchは作成していない。P5作業用worktreeは削除済み。
- lock SHA256: backend/composer.lock `716f87f1c2709c63582901776f8ab429b0e699d876bb2e646f6603ff8421ec57`、frontend/package-lock.json `23f48ed27a7597e7ff8fe86b5203d144a0ae1a5751a53a66eb58760e79a52117`。manifest/Dockerfileのhashも証跡へ保存した。旧Mix/pnpm等の非採用lockは今回の再構築入力としない。

### 専用構成案

以下は名前・保存先・境界を確定するための構成案で、実行用Composeや設定ファイルはまだ作成していない。既存のP5 Composeは流用起動しない。

| 項目 | P6専用の値・制約 |
| --- | --- |
| project / Compose | `boxing-runtime-p6` / `docker-compose.final-check.yml`（未作成）。通常Composeの継承・併用はしない |
| runtime | 元worktree内`docker/db/p6-runtime/`（未作成）。backend/frontend/tools/evidence/web-config/tlsはこの配下に独立作成する |
| DB volume | `boxing-runtime-p6_baseline_db80`、`boxing-runtime-p6_relay_db80`、`boxing-runtime-p6_migrated_db84`、`boxing-runtime-p6_restore_db84`。既存volumeのexternal指定・再使用は禁止 |
| DB schema | `boxing_p6_baseline80`、`boxing_p6_relay80`、`boxing_p6_migrated84`、`boxing_p6_regression84`、`boxing_p6_fresh84`、`boxing_p6_business84`、`boxing_p6_restore84`。保存用/回帰用/業務用は分ける |
| network | 実行時は`boxing-runtime-p6_isolated`をinternal指定。依存導入だけ`boxing-runtime-p6_downloads`を使用し、DBをこのnetworkへ接続しない。通常/P5 networkへ接続しない |
| bind mount | 全入力は新runtime配下のみ。PHP用backend、frontend定数コピー、tools、evidence、Node用frontend、Web用public/dist/専用config/TLSを用途別にmount。元の稼働backend/frontend/storage/vendor/node_modulesはmountしない |
| ports | 必要時だけ127.0.0.1へ公開。HTTP18086、HTTPS18446、Storybook16066、Vitest UI15126、SMTP UI18026。DB/PHP/SMTP配送portはホスト公開しない |
| 設定・鍵 | 実env/鍵/config cacheは参照・複製しない。後続で合成専用値を生成し、明示した合成envだけでComposeを評価する |
| 容量・並行度 | host空き約25GiB、Dockerメモリ約3.82GiB。起動前にhost空き8GiB以上を再確認。DBは通常最大2台を目安に必要分だけ起動し、Nodeの本格buildとbackend全件を同時実行しない。実効メモリ制限と実測適合は後続の起動前に確認する |

### 確認できたこと・未確認のこと

- 上記project/container接頭辞・network・volume名の既存資源との衝突なし。runtimeは未存在で、証跡保存先とともにGit除外を確認。候補5portは一時bind/即時解放により確認時点で利用可能（予約ではないため起動前再確認）。
- 宣言したbind sourceは全て新runtime配下。通常DB volume、旧my_data、実backup、P5 archive/runtimeへのmount案はない。P5のDB内容/dumpを再利用せず、移行検証も新規合成データから開始する。
- 稼働4serviceは通常network `boxing_talking_default`と元worktree/named volumeを利用していることを限定metadataで確認。Docker環境変数、実env/鍵、SQL本文、実DB内容は取得していない。コンテナ/volume/networkの作成・起動・停止・再起動やDB接続も行っていない。
- Git除外`docker/db/p6-preflight-20261102/`にpreflight.jsonとdocker-inventory.jsonを保存（親700/ファイル600）。この時点のbranch/commit/lock hash、候補mount/network/volume、既存Dockerメタデータを含み、合成env等の実行設定は含まない。
- 未確認: 実行用Composeの展開結果、実際のmountとnetwork、合成資格情報、DB接続先/空状態、image再構築、メモリ適合。P6-2で構成を作成して起動前検査を通すまで起動不可。今回の構成案検査だけで実行環境の安全性を実証したとは扱わない。
- 検証はhash/名前衝突/パス境界/Git除外/ポート/容量の事前確認のみ。確認前後の全コンテナmetadataとvolume/network一覧は不変。アプリテスト/buildは未実施。
- Reviewerはhash一致、候補資源の衝突なし、mount案のruntime内限定、証跡Git除外/700・600、Compose/runtime未作成と承認境界を独立確認し、問題なし・必須指摘なし。P6-1の事前確認は完了。実行環境の安全性検査はP6-2で行う。


## P6-2〜P6-6: 実行承認と分担（2026-11-02 JST）

- ユーザーへ依存関係とDockerメモリ制約を説明し、P6-2 WorkerとP6-5 Explorerを先行並行、P6-3/4を別Tester、P6-6は主エージェントとReviewerで統合する案を提示。追加トークン/コストを明示したうえで「go ahead!」と承認を得た。
- P6-2担当は専用Compose/ハーネス/READMEとGit除外runtimeを準備。起動前に実効設定をReviewer確認する。
- P6-3担当は全件回帰・frontend build/補助ツール、P6-4担当は合成DB/HTTP・ブラウザ/メールqueue等を担当し、P6-2完了後に実行する。重い処理の同時実行を避け、schemaを分離する。
- P6-5はlockを更新しない再監査と公式情報の調査を担当。修正経路が見つかっても依存/image更新は適用せず別提案とする。
- 主エージェントが計画/進捗文書を統合し、Reviewerが設計と最終差分を独立確認する。アプリ/既存テスト仕様変更、実env/実鍵/実SQLの参照コピー、通常DB/既存jobs操作、本番外部接続、commit/pushは含めない。


## P6-2: 独立再構築結果（2026-11-03 JST再開確認）

- 2026-11-02の準備中に利用上限で中断し、2026-11-03のユーザー依頼で再開した。prepare/build/installを重複実行せず、既存証跡と実状態を確認した。
- tracked入力561件とruntimeコピーの全hash、backend/frontendの両lock hashは一致。空vendorへComposer install/package discover、validate/platform要件確認、空node_modulesへnpm ci（614packages）が成功。
- 実版はPHP8.5.12、Laravel13.38.0、Composer2.9.4、Node24.22.1、npm11.19.1、MySQL8.4.13。専用PHP/Node imageを構築し、通常環境へ適用していない。
- 起動前Reviewerの指摘は、Compose引数allowlist/最適化時assert無効化拒否/command境界の明示と、専用runtime内のPHP-FPM所有権整合で解消。prepare/validate後の再レビューでbuild/install/段階起動を許可された。
- P6 php/node/db84は専用internal networkで稼働しOOMなし。実mount/network/loopbackを検査し、FPM www-dataの合成鍵読取り・storage/cache書込み・合成env読取りが全true。db84実hostnameと専用appユーザー接続を確認し、migrated/regression/fresh/business各schemaはtable0だった。
- 既存コンテナのID/起動時刻/image/mountはP6-1記録と不変。実env/実鍵/実SQL/通常DB内容は取得せず、通常DB/既存jobsへのtestやworkerは実行していない。
- PSR-4の既存診断、whatwg-encoding非推奨、npm ciのesbuild/MSW installScripts未承認通知を保持。script承認設定や依存版は変更しておらず、frontend検証で機能影響を確認する。
- 軽微補正はDocker Desktop mount元の`/host_mnt`表記正規化とwrapper診断のstderr化。失敗/初期ログも保持した。結果はGit除外runtime/evidence/p6-2-result.jsonと各build/install/source/実mount・権限確認証跡。
- P6-3回帰ハーネスはReviewerで接続先/空schema gateと結果集計を確認し実行GO。既存skipだけをJUnitで許容し、process-isolation/全issue失敗/skip exit除外の実行契約を揃えた。P6-3/4のアプリ動作の成功はこの環境準備の成功に含めない。


## P6-5: 監査・公式情報再評価結果

- [再監査報告](2026-11-02-final-audit-review.md)へ結果を分離。監査・公式metadataの取得日は2026-11-02で、2026-11-03の再開時は訂正・Reviewer検証を完了した。依存版/lockの更新は行っていない。
- npm全依存はmoderate14パッケージ・根本2advisory、omit-dev0。上位5パッケージの最新manifestとdocgen全packumentを確認しても、minimatch11/glob14修正版への通常解決経路はない。Storybookの`^0.7.0`は安定0.7.0のみで、公開latest0.9.0は範囲外。P4は上流待ち・全体未完了を維持する。
- ComposerはMime7.4.19のmedium1件が残存。Symfony公式の誤記訂正により修正版は7.4.22と確認でき、別のbackend依存修正提案として扱う。Node24.22.2/Alpine tagは公開確認済みだが、候補image digest/pull/起動検証は未実施。いずれも適用していない。
- PHP/Laravel/Node/MySQLの公式supportを照合し、具体EOL等の未確認範囲も報告に記載。support範囲内であることを脆弱性解消や本番公開可と同一視しない。
- Reviewerがsemver/通常範囲と最新版候補の分離、backend別提案、証跡入力/metadata計12hashを独立確認し、必須指摘なし。Git除外監査証跡は親700/ファイル600、更新や外部DB接続なし。


## 公開前の運用・復旧残課題（P6-6整理）

以下は確認・整備すべき項目であり、本番設定参照や操作の実行許可ではない。P6の合成検証成功で自動的に完了にしない。

| 項目 | 今回の境界と公開前に残る作業 |
| --- | --- |
| 残存監査と暫定版 | P4のdev advisory上流待ち、Mime修正、Node候補imageの固定digest/置換検証を個別提案する。監査をignoreして解消扱いしない |
| 本番HTTPS/認証 | 本番domain/証明書/Cookie属性/CSRF/CORS/stateful originとproxyを本番条件で確認する。実鍵の強度・生成方法は未確認で、無断の鍵更新/弱い鍵の検証回避をしない |
| SMTP/SES/S3 | 外部送信、IAM/region/bucket/URL/失敗時挙動は今回接続しない。ローカルsink成功を外部配送・storage権限の確認としない |
| queue/cron/監視 | supervisor等の永続worker、失敗job/再試行/ログ、Tokyo timezoneと日次起動、アラートの担当と手順を別途定める。P5の既存jobsをテストで処理せず、実worker有効化はqueue内容と互換性を確認して別承認 |
| 配布順序 | 公開対象commit/lock/image/DBと設定供給元を確定し、最新backupと復旧判定を準備した後に配布する。cache再生成とworker再起動は新code/設定を揃えてから行い、PHP/HTTP/queue/日次の順に確認する。具体コマンド・停止時間は本番構成判明後の別計画とする |
| backup/restore | P5切替時の実dumpと旧my_dataを保持。旧MySQL imageは後のユーザー承認による整理で削除済み。復旧時には当時の版/digestと設定を記録から確認して再取得する。定期backup機能は未実装で後日対応。最新backup取得・別DB復元・保存期間・別媒体・暗号化/アクセス権・監視等の運用は別途整備。今回追加実装や実DB dumpは行わない |
| 復旧 | 既に通常書込み再開済み。障害時は書込み/worker/cronを止め最新8.4データを保全し、復旧点以降の更新回収と整合性を評価して承認を得る。古いDBへ単純rollback、8.4データを8.0で直接開く操作は禁止 |
| 保持記録 | P5証跡archiveは比較記録であり実DBbackupの代替ではない。P6の合成dump/volumeと実backupは分け、復旧先と実効接続先を明示してから操作する |

公開可否は上記の重大未確認と未解決監査を含めて別途判断する。今回の完了判定は、承認済みの合成隔離検証と残課題引継ぎに限る。


## P6-3: 全件回帰と補助ツールの経過（2026-11-03 JST）

- SQLite/MySQLは各173識別子、172成功/既存skip1/446assertions、exit0。MySQLはprocess isolationを使用し、両suiteの識別子集合とassertion総数が一致。既存skip以外、failure/error/risky/warning等を成功扱いしない集計を使用した。
- 集計器はJUnitのcanonical class属性、runner診断の数値集計、exitcodeと実行flagを確認する方式へ補強。全issue失敗とskip exit除外を併用し、JUnitで既存の単一skipだけ許容する。検証ハーネスの補正であり既存テストや期待値は変更していない。
- frontendは52ファイル204成功、lint成功、coverage付き同52/204成功。本番buildは既定と640MiBヒープでは不足し、process限定`NODE_OPTIONS=--max-old-space-size=768`のフル`npm run build`で型検査/Viteとも成功。Rollup pure-comment/chunk通知を保持。esbuild/MSW installScripts通知に対する承認設定・依存更新は行っていない。
- Storybook初回はVitest UI/watchが残った同時実行でexit137。UI/残留worker停止後の単独heap768実行もexit134となり、Node cgroupはoom2/oom_kill1を記録。通常環境の障害ではないが、子process OOMはcontainerのOOMKilled=falseだけでは否定できない。失敗ログを保全して成功と区別する。
- 対応案は、現1GiBで低heap再試行を続ける案と、P6専用Nodeだけ2GiBへ増量し専用PHP/DBを停止してbuildを単独実行する案を比較し、後者を採用。機能・lockを変えず必要なbuildを検証でき、通常4serviceの約907MiBも含めたDocker全体メモリ制約を守るため。heap1536は実行processだけに指定する。実効メモリ値もrole別allowlistで確認する。
- Vitest UIは代表1ファイル4テストの実行結果があるが、最初のhost15126接続は拒否され実表示未確認。container target51204/host15126とbindを揃えて、Storybook build後に限定UI/軽量静的serverで実表示を確認する。今回の時点ではP6-3全体完了にしない。


## ブラウザ入口の構成補正（2026-11-03 JST）

- Storybook静的serverはcontainer内で200を返したがhostからは接続拒否。NodeのHostConfig.PortBindingsには指定があっても実NetworkSettings.Portsは空で、internal-only networkのgatewayは未設定だった。
- [Docker公式network説明](https://docs.docker.com/compose/how-tos/networking/)と[Moby maintainerの説明](https://github.com/moby/moby/discussions/53256)を確認。internal-onlyのままhost公開する当初案は成立しないため、アプリを非internal networkへ直接接続する案と、小型proxyだけを追加する案を比較した。
- アプリ/DB/Node/web/smtpのoutbound隔離を維持するため、後者を採用。Reviewer設計GOを得てP6専用browser bridgeとbrowser-proxyを追加する。通常host/daemon/network設定は変更しない。
- proxyだけがinternalとbrowser bridgeへ接続し、127.0.0.1の既存5hostportから固定のnode6006/51204、web80/443、smtpUI8025へTCP転送する。TLSはpassthrough。任意宛先、DB3306、SMTP配送1025は転送しない。proxyは資格情報を持たず、単一の非秘密scriptをRO mount、非root/cap_drop ALL/read_only/no-new-privileges/128MiBとする。
- proxyにはoutbound経路が存在するため「全サービスのoutbound遮断」とは表現しない。アプリ側のinternal-onlyと、proxyの固定内部転送実装を分けて確認する。実効portはNetworkSettings.Portsとhost probeで検査する。
- DBphaseとCompose/wrapper編集が競合しないようphase境界で一時停止する。各DB操作は固定phase・専用schema・接続先/空状態gateを通し、ログはattempt別O_EXCL/600、subprocess check=Trueで異常時停止する。


### P6-3確定結果

- 最終集計はGit除外runtime/evidence/p6-3-result.json。SQLite/MySQLは各172成功・既存skip1・446assertions、識別子集合一致。frontend全件52ファイル204成功、lint、coverage同52/204、本番build、Storybook buildが成功した。
- Storybookは専用Node2GiB/heap1536・専用PHP/DB停止の単独実行で成功。再作成後Node cgroupのoom/oom_killは0。初回のheap不足/子process OOMとは区別し、旧cgroup値/失敗ログも保持する。
- 資源変更の事前process名判定がMainThread表記をnode固定名と誤認した際、shellのfail-fast不足で後続の承認済み停止/再作成まで進んだミスを記録。独立したread-only再確認とReviewerで、通常4serviceのmetadata不変・専用PHP/DB停止・Node2GiB/image/mount/source保持を確認した。以後はdependent操作をPython subprocess(check=True)で即時停止する。
- 主エージェントが専用ChromeタブでVitest UI代表1ファイル4成功/0失敗を実表示確認。StorybookはButton、ToastModal、PredictionVoteModalの描画と選択後の投票ボタン有効化を確認した。PredictionVoteModal storyのvote/close callbackは元sourceでno-opなので、実投票・close動作の保証には含めない。
- VoteIcon storyは既知のRecoilRoot不足エラーを再現し別記。全story描画成功とは扱わず、アプリ本体の新しい失敗とも混同しない。実アプリのPC/SP/認証・投稿等はP6-4で別検証する。
- 実ブラウザ観測はregression-browser-observation.jsonと6枚のJPEG（600）に保存。通常localhost:3000のタブは操作していない。全件tests/buildはP6-3担当、実ブラウザは主の観測として集計で区別した。


## P6-4: 合成DB移行比較の経過（2026-11-03 JST）

- 新規専用8.0.21で35migration/20tableと合成fixtureを構築し、snapshot/dumpを保存した。実DB/P5 dumpやvolumeは使っていない。
- 8.0.46へ論理復元後、初回比較でschema2tableと空table採番の表示差を検出して停止。全20tableの件数/データhashは一致していた。DDL/column診断でutf8とutf8mb3の既知alias表示差を特定し、tracked P5の比較方式と同じ限定正規化を採用。Privilegesは生値を別保存して構造hashから分離し、index/FK/CHECK/engine/charset/collationは厳密に保持する。
- baselineのSHOW TABLE STATUSによりorganizationsの実counter1とstats0後I_S1、行0/AI列/offset・increment1を確認。NULL推定変換は採用していない。さらにboxing_matchesは行数/MAX(id)3で、走査前のmetadata3→行走査後4、dumpのDDLはAUTO_INCREMENT=4と確認。relay側でも同じ読取り時点差を確認した。
- 初期metadata vectorを保存したまま、P5 tracked comparator同様のrow-first方式へ変更する。新v2 snapshot同士で、行データ・構造・最終raw採番を比較し、旧方式のhashと混同しない。採番値を丸めて比較を通さず、不一致なら停止する。
- 起動直後の接続準備不足はhealth待機で補正し、Docker socketのsandbox拒否は承認済み専用操作の権限指定で再実行した。各失敗はattempt別600ログへ保存し上書きしない。
- Laravelをbootstrapした独自PHP入口で例外表示後もexit0になる経路を観測。P6 helper共通bootstrap try/catchと、固定helper allowlistをtry/catchで実行するrun-helper.phpへ統一した。実アプリ/既存テストの例外処理は変更していない。
- Reviewerのstatic GO後、bootstrap失敗・接続先identity拒否・populated baselineをemptyとして拒否する3つのnegative probeを実施し、各safe marker/exit1を確認。baselineの20table/35履歴/全rowcountは前後一致し、migration/restore経路は実行していない。PHP-rだけの観測をPHP全体の問題と断定せず、実際のhelper入口での拒否を確認した。
- 元snapshot/dump、canonical v1、比較差分、safe診断、失敗/拒否ログは全て保持する。canonical v2の厳密比較が成功するまで後続の移行/restoreは保留する。


## 別8.4 DBへのdump復元検証（2026-11-03 JST・限定再開）

- ユーザーが一時停止後に「今出した1」を実行するよう承認。対象は合成データだけのdump/復元/比較で、他の業務検証や通常DB操作は再開していない。
- sourceは専用`db84/boxing_p6_migrated84`、targetは専用`restore84/boxing_p6_restore84`。復元先の空状態を確認してから実施。sourceのnamed volume `boxing-runtime-p6_migrated_db84`とtargetの`boxing-runtime-p6_restore_db84`は別物で、通常DBや実backup/P5 dumpを使用していない。
- 新規dump `business-migrated84.sql`は26,257 bytes、600でGit除外runtime/evidenceへ保存。本文は表示しない。checksum・before/after metadataはrestore84-result.json等へ保存した。
- 復元後は20table/35migration履歴、v2の全table entry（行数/データhash/構造hash/engine/collation/raw採番）が元snapshotと完全一致。content SHA256は`7b92a2bb638e9ee7cc65d2215b9e0891ea8e78d74123abda9e189b2791586d9d`。
- 復元先restore84は検証成功後に停止しvolumeを保持。source db84は稼働継続。通常4サービスのID/status/起動時刻/image/mount/network metadataは今回の実行前と完全一致。実DB内容は参照しておらず、metadata確認だけで通常DB全内容の不変を証明したとは主張しない。
- 証跡はbusiness-migration-restore84-20261102T204643458878Z.log、business-restore84-rowfirst-v2.json、restore84-before.json、restore84-result.json。元snapshot/旧失敗証跡を上書きしていない。
- 復元検証後もP6-4全体は未完了。PDO/ロック/cache、HTTP/HTTPS、SMTP/queue、日次、実アプリPC/SPと全体最終レビューは、次の再開依頼まで停止する。commit/pushは未実施。

- 今回のrestore84限定検証はReviewerがdump checksum/600、全20table entryと35履歴、再計算hash、liveのvolume独立/target停止/通常4metadata不変を独立確認し、PASS・必須残件なしと判定。現状の文書表記も部分完了・後続停止へ統一した。


## CRUD・rollback・ロック・session/cache検証（2026-11-03 JST・2の限定再開）

- ユーザーの「2の実行」により、専用合成業務DBでの確認だけを再開。`boxing_p6_business84`の空状態/identity gate後、35migration・20tableと新規合成fixtureを準備した。既存移行/復元schemaや通常DBへfixtureを投入していない。
- 所有P6ハーネス2件を補強し、Reviewerのstatic GOとDocker PHP8.5構文確認後、source/runtime hash一致を確認してfail-closed run-helper経由で実行した。実アプリ・既存テスト・lockは変更していない。
- PDOのautocommitで作成→読取→更新→削除を行い、各commitの結果を第2接続から確認。別のtransactionでは未commit行が第2接続から見えず、rollback後は両接続の行数が元に戻ることを確認した。
- GET_LOCKの取得/他接続の拒否/解放後取得/再解放、行ロックの待機timeout1205/rollback解放/別接続での再取得を確認。試験前後のfixture行は保持されている。
- sessionは既存file driver/php serializationを維持し、合成sessionを保存→別PHP processで同じIDから読取りを確認。IDは概要/チャットに出さず、試験session fileとID証跡は600で保存する。ログインCookieやブラウザのsession継続は今回の保証範囲外で、後続HTTP/画面検証へ残す。
- default array cacheは同processのput/get/forget、専用file storeはscalar/arrayを別processで再読取り後にforgetし、試験keyが残らないことを確認した。default array cacheがprocessを跨いで永続化するとは主張しない。
- fixture準備時snapshotと試験後snapshotの全20tableで、行数/データhash/構造hash/engine/collationが一致、35migration履歴を保持。comments AUTO_INCREMENTだけ1→3へ前進した。commit/rollbackで採番は戻らない通常仕様であり、DB全metadataが不変とは扱わない。採番リセットは行っていない。
- 通常4serviceのID/status/起動時刻/image/mount/networkは今回beforeと完全一致。HTTP/API、メール、queue worker、日次、実アプリbrowserは再開していない。専用合成環境/証跡は保持し、他作業は停止を継続する。
- Git除外証跡: business-step2-before.json、business-step2-checks.json、business-step2-result.json、business-step2-after-data.jsonと各専用log。session/cacheのwrite/readは別々のPHP processで実行した。新fixtureの合成資格情報もGit除外600のまま、内容は表示しない。commit/pushは未実施。

- 今回の2限定検証はReviewer独立PASS・必須指摘なし。2helpersのsource/runtime一致、実成功log、全20tableの差がcomments採番1→3のみであること、35履歴、session/evidence600、live通常4metadata不変、専用DB境界、文書の停止範囲を確認済み。

## HTTP/HTTPS API検証（2026-11-03 JST・3の限定再開）

- ユーザーの「3を実装」によりAPI通信だけを再開。専用business84のidentity、Tokyoの今日/明日の試合日付、comments/votes/pre_users/jobs/failed_jobs全0を初期gateで確認し、snapshot後にP6 Webだけを起動した。SMTP/workerは起動せず、通常DBへ接続していない。
- 所有ハーネスにHTTPSの一般/admin成功login・Cookie session継続・権限・logoutと、DBの事前後条件を追加。Reviewer static GO、PHP/Node構文確認、source/runtime一致後に直列実行した。アプリ本体・既存テスト・依存lockは変更していない。
- 初回HTTPは422入力エラーのJSONをLaravel標準errorsと誤って期待したため停止。現行ApiRequestのsuccess:false/messageの項目別配列へ検証側を修正し、Reviewer再確認を受けた。初回前後の全20table fingerprint/採番一致と初期gateを再確認し、別attemptで再実行した。失敗logを上書きせず保持し、DBの再seed/resetはしていない。
- HTTP成功: 匿名read、匿名comment/vote拒否401、一般/adminのlogin・Cookie session・logout、一般の管理操作/削除拒否401、invalid login/空・1001文字commentのvalidation422、存在しない試合404とJSON形式を確認。Unicodeコメントの保存/再取得/admin削除、未来試合の投票前非公開→赤投票1件後の集計公開、重複投票400、試合当日の匿名集計公開も確認した。
- HTTPS成功: 隔離CAだけをclient単位で指定しSNI localhost・rejectUnauthorized=trueで接続。一般/adminの成功login/session/権限/logout、Sec-Fetch-Siteとtokenの15組合せ、Origin/Referer fallback5例、許可したHTTP frontend originのcredentialed CORSとpreflight204、非許可originを広告しないことを確認。HTTPS frontend origin自体のCORS許可は設定しておらず、ブラウザのCookie属性/実画面操作や本番HTTPS確認とは区別する。
- 事後DBはcomment0、一般ユーザーの未来試合への赤投票1件、当日投票0、pre_users/jobs/failed_jobs全0。20table全構造と35migration履歴、他18tableのデータ/採番は一致。comments採番3→4、win_loss_predictionsは0→1行・採番1→2という予定差分だけを確認し、採番を戻していない。
- 通常4serviceのID/status/起動時刻/image/mount/networkは今回beforeと完全一致。これは実DB全内容の不変を直接証明するものではない。Node検証専用cookie jarを使用し通常ブラウザのCookieを操作していない。専用Web/DB/PHP等とvolume/証跡は保持。メールqueue・日次・PC/SP・全体最終確認は停止継続、commit/pushは未実施。
- Git除外証跡はbusiness-step3-result.json、business-step3-api-checks.json、before/failed-attempt/afterのdata snapshot、before/after metadata、初回失敗を含む個別log。すべて600で保存し、資格情報・Cookie/token値を成功概要へ出していない。
- 番号3の最終Reviewer独立確認はPASS・必須残件なし。成功raw JSONと概要一致、初回前後のDB不変、最終予定差分、全20構造/35履歴/他18entry一致、証跡16件600/親700、source/runtime一致とlive通常4metadata不変・専用network/volume境界・SMTP非稼働、文書の限定完了/後続停止を確認済み。

## database queueの最小確認・P5証跡再利用（2026-11-03 JST）

- ユーザーはMySQL更新の確認をjobs保存・worker取得・処理後削除に限定し、P5で確認済みなら再実行せず引き継ぐ方針を承認した。メール生成/SMTP配送/登録tokenを含む全体フローは、DB移行確認としての追加効果が小さいため今回の必須範囲から外す。メール配送を成功扱いにする変更ではない。
- 保存commitは`710864720e67f1c0042278536ddd9f8531eb9184`。archiveのbusiness84-final-prepare.phpは専用MySQL8.4.13のidentity guard下で、jobs/failed_jobs全0→database接続の専用queueへSampleJob1件→jobs保存1件→実queue:work --once→ユーザー名のjob実行結果・jobs0・failed_jobs0をassertしている。予約中のreserved_at値を直接採取した試験ではなく、実worker完了とjob効果から取得/処理を確認している。
- final-prepare/guard/runner/final-php-checks/final-resultの5証跡は、P5保存時manifestのSHA256・byte数と一致。2つの成功JSONのphp_checksも一致し、database_queue_one_real_job=true。途中失敗や部分成功ではなく、最終専用schemaの成功を根拠にする。
- 現在のSampleJob/User model/queue設定/DB設定/composer.lock/通常Composeの6fileはP5保存commitとbyte一致。うちbackend5fileはP6 runtimeとも一致する。MySQLは同じ8.4.13を対象とし、queue接続はdatabaseを明示した試験なのでP6のdefault設定を同じと仮定しない。
- 今回はP5証跡を読み取り確認し、Git除外600のbusiness-queue-reuse-result.jsonへ照合結果を保存した。P6でのqueue再実行、新規job投入、DB接続、コンテナ操作、メール送信は行っていない。通常DBの既存jobsを処理していない。
- 再試行/失敗jobの運用、常駐worker、外部メール、本番設定の保証は含まない。日次/PC-SP/全体最終確認は停止継続、commit/pushは未実施。
- Reviewer独立確認はPASS・必須指摘なし。P5での保存/worker処理と副作用/削除、5証跡のmanifest一致、関連code/lock不変、再利用結果600と文書の範囲変更・未再実行表記を確認済み。追加のqueue再実行は不要と判定した。

## 残工程の再精査案（2026-11-03 JST・1は承認後実行済み、2/3は未実行）

ユーザー依頼により、frontend/backendの実行済みテストで判断できる機能の再検証を追加工程から外す。本節は縮小案であり、上記チェックリストの残件を実行済みへ変更するものではない。

### 比較と採用理由

当初のPC/SP全主要画面・全権限・登録・日次を手動で再確認する案は、成功済みテスト/API確認と重複する。すべてのブラウザ確認を省略する案では、今回のproduction build＋専用Web配信＋実APIの組合せが未確認のまま残る。推奨はこの組合せだけを短い読取確認で検証し、証跡整理と専用環境停止で終了する案。全機能E2Eや全画面の見た目を保証する試験へ拡張しない。

### 追加実行から外す項目と根拠

| 項目 | 判断に使う既存結果・限界 |
| --- | --- |
| 日次削除の対象選別とTokyo日付境界 | DeleteGuestUserTestの2件/14assertionsが今回のMySQL/SQLite JUnitでerrors/failures/skippedすべて0。コマンド実行と削除/保持結果をassertしており、手動再実行は不要。cron自動起動は別の運用確認 |
| 認証/権限/validation/コメント/投票/フォーム等の機能再走査 | backend172成功＋既存skip1、frontend204成功、実HTTP/HTTPSの既確認範囲を根拠にする。frontendはmock APIを含むため実サーバーとの統合まで全件保証とはしない。既存skipは成功扱いにしない |
| PC/SPの分岐・メニュー・フォーム操作の総当たり | useInitializeDevice/HeaderDeviceSwitch等の成功済みテストと関連componentテストを再利用。全ページの視覚品質・実ブラウザ全挙動の保証とは区別する |
| database queueの再実行 | P5の保存/worker処理/削除成功証跡を再利用済み。メール・登録フロー全体はユーザー承認済み対象外 |
| 全件テスト/build/Storybook/監査の繰返し、DB移行/復元/CRUD等の再実行 | 完了済み証跡を利用。新たな変更・失敗・構成差がなければ繰返さない。既知Storybook制限・監査残件は解消扱いにしない |

### 残す工程（推奨）

1. **production buildと実APIの最小接続確認**: P6専用のproduction buildを実ブラウザから開き、合成試合の一覧→詳細を読取で確認する。JS/CSS配信、起動時例外、専用APIへの通信とデータ表示、詳細URL直接reload時のSPA配信を確認。PC/SPは各1回の初期表示だけとし、全画面/全フォーム/ログイン/コメント/投票操作は再走査しない。通常環境のCookieと分離したブラウザを使用し、実env/鍵・通常DBに触れない。今回のbuild配信統合を確認する工程であり、MySQL固有の検査ではない。
2. **証跡と完了範囲の最終整理・Reviewer確認**: 日次は今回の成功テスト、queueはP5証跡再利用と明記し、未実施の全画面E2E/外部接続/本番運用と分離する。成果物・リンク・diff、既存skip/Storybook制限/監査残件、復旧資材の所在を確認する。監査や全件テストの追加再実行は含めない。
3. **P6専用環境の停止と保全**: 専用UI等のprocess/コンテナだけを停止し、volume/image/合成dump/証跡を保持する。通常4serviceの限定metadataを前後照合し、通常DBへ内容確認のために接続しない。削除・commit・pushは別依頼。

### 今回の残工程に含めない運用課題

本番domain/TLS/Cookie・外部SMTP/SES/S3・常駐worker/cron/監視・定期backup・本番配布/復旧は、現構成の自動テストでは保証できないが、今回のローカル更新検証完了のために新規実行する項目ではない。上記「公開前」一覧へ別途保持する。Mime/Node候補等の版更新も別提案とし、この縮小案へ混ぜない。

本縮小案はReviewer設計評価GO・必須指摘なし。日次2件の両JUnit成功と公開動作assertを独立確認し、重複再実行の除外と最小build/Web/API確認・整理/停止への限定は妥当と判定した。ブラウザ確認前には通常Cookie storeとの分離を確認し、確認できなければアプリを開かず停止する。その後ユーザーが1のみを実行承認した。2/3は未実行とし、3の工程後に不要ファイル等の削除対象を提案する。

## production buildと実APIの最小接続確認（2026-11-03 JST・縮小案1）

- ユーザーの「まずは1を実行しよう」により実施。通常Chromeの既存localhost:3000タブには触れず、別providerのIAB id3（開始時タブ0件）を使用した。専用Web/PHP/Node/DB/proxyは起動済みで、通常4を含む9serviceの起動状態/内部network境界を確認してから開いた。
- PC1280×900で合成試合一覧を取得。未認証時はログインmodalが表示され、詳細への直接アクセスも一覧へ戻る既存仕様だった。そのため一覧からの詳細閲覧準備として専用の既存一般合成ユーザーで1回だけログインした。認証matrixの再走査、guest作成、登録、投稿、投票、管理操作は行っていない。未認証状態の画面と記録も保持した。
- ログイン後に一覧の未来試合card→`/match?match_id=1`へ遷移し、合成選手名/会場/日時、既存投票1票の集計、コメント空状態を表示。詳細URLをreloadしても同じ情報が再取得された。SP390×844では詳細初期表示と一覧表示を確認した。PC/SP全ページの外観や全操作の保証ではない。
- 表示される文言を「総投票数」と仮定した検証locator1件は一致せず、実画面の「合計1票」を再観測して表示を確認した。アプリ側の障害とは扱わず、検証側の観測誤りを証跡へ明記した。
- 専用Webの実行期間内33requestはすべて400未満で、match/boxer/comment/prediction/auth各APIとJS/CSSが応答。DOMで観測したJS/CSSの配信byte列は専用distと完全一致し、rootと詳細URLのHTMLも200/同一hashでSPA fallbackを確認。ブラウザconsole error/warnは0。HTTPSブラウザ接続は今回対象外で、証明書は既存HTTPS API検証の範囲と区別する。
- 通常4を含む9serviceのID/status/起動時刻/image/mount/networkは開始前と完全一致。通常DB内容へ接続せず、新規buildや依存変更も行っていない。専用ブラウザtabは閉じ、viewportをresetした。アプリの閲覧に伴う専用sessionの書込みはあるが、通常ブラウザCookieを操作していない。
- Git除外600のbusiness-browser-smoke-before.json、business-browser-ui-observation.json、business-browser-smoke-result.json、PC/SP screenshot6件を保存。資格情報/Cookie/token値は記録概要に含めていない。専用環境停止・ファイル削除・commit/pushは未実施。次は2の全体結果整理、3の専用停止/保全と削除候補提示であり、自動的には開始しない。
- 縮小案1の限定Reviewer確認はPASS・必須指摘なし。PC詳細reload/SP画像、配信assetのbyte/hash一致とSPA fallback、33通信の成功/唯一のPOSTがlogin、証跡9件600、既存認証誘導仕様と閲覧準備loginの妥当性、live9service metadata/専用network不変、文書整合を独立確認した。これは工程2の全体最終レビュー完了を意味しない。

## 工程2: 結果・残課題の最終整理（2026-11-03 JST）

### 集計対象と結論

ユーザーの「結果・残課題の整理と最終レビュー」により実施。対象は元branch `codex/laravel-php-upgrade`、検証入力の保存基点`0beb3ef8`と現行lock。アプリ本体/既存テスト/依存lockは今回のP6で変更していない。入力561件を保存時manifestから再照合し、元ソースとruntimeの全byte数/SHA256が一致した。追加のアプリテスト・build・監査取得・DB接続・コンテナ操作は行わず、既存証跡を再集計した。

| 項目 | 最終結果・根拠 |
| --- | --- |
| 独立再構築 | Composer install/discover/validate/platformとnpm ci成功。PHP8.5.12/Laravel13.38.0/Node24.22.1/MySQL8.4.13。両lockは開始時hashと一致 |
| backend全件 | SQLite/MySQLそれぞれ173件＝172成功・既存skip1、446assertions、failure/error等0。両DBのテスト識別子一致 |
| frontend | 52file/204件成功、lint・型検査を含むproduction build・coverage・Storybook build成功。Vitest UIは代表1file/4件を表示確認 |
| DB移行/新規/復元 | 合成8.0.21→8.0.46→8.4.13→別8.4volume復元の20table/35履歴・全table entry一致を再照合。fresh8.4の全20table構造hashも一致。実DBバックアップを読み直した結果ではない |
| CRUD/transaction/lock/session/cache | 専用合成DBの成功証跡。期待した採番前進は保持し、データ/schema一致の範囲を明記 |
| HTTP/HTTPS API | 認証/権限/入力/Unicodeコメント/投票/重複拒否、CSRF15組合せ/Origin-Referer5例/CORS、専用CAでのTLS検証成功 |
| database queue | P5 commit `71086472`の専用1job保存→実worker処理/副作用→jobs0/failed0を引継ぎ。5証跡manifestと関連code/lock一致。P6で未再実行 |
| 日次処理 | 今回のMySQL/SQLite JUnitで各2件/14assertions成功。Tokyo日付変更直後/終端、削除対象と保持対象を検証済み。手動の再実行とcron起動確認はしない |
| build/Web/API統合 | PC/SP最小表示と一覧→詳細/直接reload成功。配信JS/CSSとdistのbyte/hash一致、33requestはすべて400未満、console error/warn0 |
| 通常環境の境界 | 各phaseの限定metadata比較で通常4service不変、P6専用mount/network/volumeを確認。通常DB内容の全時点不変を直接証明したとは主張しない |

### 未解決事項・検証限界

| 項目 | 現在の扱い・次の判断 |
| --- | --- |
| npm moderate14パッケージ/根本2advisory | 2026-11-02取得の監査でdev経路に残存、omit-dev0。P4全体未完了・上流待ちを維持。実行時依存0だけでbuild/CIへの影響なしとはしない |
| Symfony Mime medium1 | 同日の監査で7.4.19に残存、当時の公式修正候補7.4.22は未適用。backend依存の別修正提案で扱う |
| Node暫定24.22.1 | 当時確認した24.22.2候補のdigest/pull/動作検証・適用は未実施。新しい版情報を今回再取得したわけではない |
| 既存skip/Storybook | BoxerTitleSnapshotUpdateTest::testSetUpのskip1、VoteIcon storyのRecoilRoot不足を保持。全173件成功/全story成功とは報告しない。story no-op callbackは実投票成功の根拠にしない |
| build時の警告/失敗履歴 | PSR-4既存診断、非推奨/installScripts通知、Rollup注釈/大chunk警告を保持。heap不足/子process OOMは専用資源・実行順序補正後に成功し、旧失敗証跡も保持。初回HTTP validation期待、snapshot alias/採番読取時点、locator誤り等も最終成功と区別 |
| 全画面E2E/メール全体 | 承認済み縮小範囲の対象外。テストと最小接続確認を根拠にし、全画面の視覚品質・外部配送まで検証済みとはしない |
| 本番運用 | 本番TLS/Cookie/鍵、外部SMTP/SES/S3、常駐worker/cron/監視、配布/復旧は別計画。P6の成功を本番公開承認としない |
| backup/復旧記録 | 定期backup未実装。P5 backupディレクトリ/旧my_data/P5 archive manifestの所在だけを確認し、実SQL/鍵は参照していない。P5 archiveはDB backupの代替ではない。通常書込み再開後の旧DB単純rollbackは禁止、最新8.4データの保全と差分整合を別途判断する |
| 過去の比較限界 | P4統合前のDB内容hash上書きによる証明限界と、P1 SDK/SES補足未実施は過去記録どおり保持。今回の成功で遡って解消しない |

### 成果物と残る工程

- 集計はGit除外600の`p6-final-review-evidence.json`へ保存。主要14証跡のhash/byte数/permission、入力561件一致、移行/復元/fresh構造、日次成功の再照合結果を含む。監査の一次取得日は11月2日のままとし、再監査扱いにしていない。
- 保存候補は本計画・全体計画・計画一覧・監査報告。専用Compose/ハーネスは検証後の削除候補であり、commit必須とはしない。Git除外runtime/SQL/資格情報はcommit対象外、無関係な`.vscode/`も対象外。削除前に必要証跡を保全する対象・方法は工程3後の提案で確定する。
- 工程2の独立Reviewer最終評価はPASS・必須指摘なし。工程3の専用環境停止・保全と削除候補提示は未実行。削除実行、commit/push、依存更新や本番操作は今回含めない。停止完了まではP6作業全体を完了にしない。

- 最終Reviewerは入力561件/両lock/主要14証跡のhash・600、移行/復元20table entryとfresh構造、両JUnit識別子/成功/skip/診断数、承認済み範囲/文書の一致を独立確認。P6-6の工程2を完了と判定した。Git除外600の`p6-final-review-result.json`へ最終判定を保存し、集計時のpending記録は上書きせず保持する。
- 非blockingの保全上の注意として、runtime/tools内のホスト用migrate-restore-p6.sh/run-registration-flow.shとregression READMEには古い控えが残る。実runnerはrepository側のホストshellを使用し、実行したPHP/Node helperの一致と成功結果には影響しないため、今回の修正/同期は不要。工程3後の削除候補/証跡保全では古い控えを正本として再利用しない。

## 工程3: 専用環境停止・保全と削除候補（2026-11-03 JST）

### 実行したこと

- ユーザーの「進めよう」により停止/保全/整理提案を実施。削除の承認ではない。固定wrapperからP6専用8serviceだけをstopし、全8containerのexitedを確認した。通常4serviceのID/status/起動時刻/image/mount/networkは前後一致。P6の4volume metadataも一致し、参照6image IDの存在を確認。3networkのendpointは0、5つのloopback portは非待受。
- `docker/db/p6-archive/20261103/`へ、検証evidence・監査・preflight・repository側正本のハーネスと専用Composeをコピーした。元ファイルとのbyte数/SHA256を全件照合し、親/各dir700・file600、Git除外を確認。証跡には合成SQL3件と失敗ログを含み、実DB backup/実SQLは参照・コピーしていない。
- 合成パスワードのbusiness-browser-credentials.json、session-ID probe、古いhost PID記録の計7件はarchive対象外。runtimeの実行用env/TLS秘密鍵/storage、vendor/node_modules、古いruntime/toolsのホスト用控えも保全対象外。正本のhost scriptsはrepository側から保存した。除外した元ファイルもまだ削除していない。
- archiveのmanifest.jsonにコピー元・保存先・byte数/hash・除外理由を記録。runtime内p6-shutdown-before/result.jsonとlog、p6-cleanup-inventory.jsonが停止/資源確認の証跡。正常系/失敗系の既存証跡は保持し、通常環境やP5保存物を整理対象にしていない。

### 承認された削除対象（実行結果は後述）

| 対象 | 規模/理由 | 前提 |
| --- | --- | --- |
| `docker/final-check/` | 32file・約208KiB。今回専用の検証ハーネスで通常起動に不要 | 正本をarchiveへ保全済み。削除時はapply_patchを使用し、空dir削除も対象確認後に行う |
| `docker-compose.final-check.yml` | 7,039bytes。検証専用定義 | archiveへ保全済み。停止済みP6 container整理後に削除 |
| `docker/db/p6-runtime/` | 約536MiB。うちvendor約138MiB、node_modules約373MiBは再生成可能 | 証跡/合成dumpをarchiveへ保全済み。P6 containerのbind参照を除去した後に削除。合成env/鍵等もここに含むので実行時に内容を表示しない |
| `docker/db/p6-audit-20261102/`、`docker/db/p6-preflight-20261102/` | 合計約868KiB。保全後の重複した元証跡 | archive内audit/preflightのhash一致を再確認して削除 |
| 停止済み`boxing-runtime-p6-*` container8件 | 検証用の参照/定義は不要 | exact ID/project label/停止状態/通常4との非重複を再確認。volumeは削除しない |
| P6専用network3件（isolated/downloads/browser） | 現時点でendpoint0。検証終了後の専用接続定義 | exact ID/project label/無参照を再確認。通常networkを対象にしない |

### 保持するもの・削除時の注意

- 今回のP6 archive、P5 archive/実backup/旧my_data、P6専用DB volume4件と参照imageは保持する。通常ソース/通常Compose/通常コンテナとvolume/image、計画文書、無関係な`.vscode/`も削除対象外。
- archiveの合成dumpは実データbackupの代替ではない。runtime設定/鍵を削除した後、保持volumeを新しい合成パスワードでそのまま起動できるとは保証しない。将来の再検証はarchiveの正本と新設定・新しい専用保存先を使い、保持volumeへ無断再投入しない。
- 通常運用文書は現在のarchive参照を入口にし、過去節のruntime/evidenceパスは当時の所在として残す。承認後に元証跡を削除する場合はarchive相対対応をmanifestで辿れるようにする。
- 提案時点では削除・依存更新・アプリテスト・通常DB接続・commit/pushを行っていなかった。その後の削除承認と実行結果は次節へ分けて記録する。
- 工程3のReviewer最終確認PASS・必須指摘なし。live8件停止/通常4metadata不変/4volumeと参照6image保持、archive764payload・8,838,057bytesの元/先/hash一致・dir700/file600・Git除外・除外7件、追加inventoryと削除提案の境界を独立確認した。archiveはmanifestを含めdisk約10MiB。ローカル検証/停止/保全は完了、削除は別承認後とする。

## 承認済み削除の実行記録（2026-11-03 JST）

- ユーザーの「ではまずそれらを削除してください」により上記候補を実行。Reviewerの方法/境界GO後、archive764件とコピー元の全hash/byte数一致、停止済exact8container/project label、無参照network3件、無関係containerからruntimeへのbind参照なし、保持4volume/6imageを確認して開始した。
- P6専用8containerはforce/volume削除flagなしで除去し、exact ID/project/endpoint0を再確認した専用network3件を除去した。通常コンテナ・network・volume/imageには削除コマンドを向けていない。
- `docker/final-check/`の32テキストファイルと専用Composeはapply_patchで削除し、空になった2ディレクトリだけrmdirした。
- runtime約536MiB、元audit、元preflightの3ディレクトリは、実体/非symlink/保持領域との非重複を確認し、`/usr/bin/trash --stopOnError`でmacOSゴミ箱へ移動。強制再帰削除を使わず、node_modules内を手編集せず、ゴミ箱は空にしていない。作業フォルダからは除去済みだが、これだけでディスク空き容量が増えたとは扱わない。
- 削除後は対象5パスの不在、P6 projectのcontainer/network0、通常4metadataの前後完全一致、保持4volume metadata完全一致/参照6image存在、P5 archive/実backup/旧my_dataの所在を確認。archive764payloadの全hash/byte数/600も再照合した。元SQL/実env/実鍵は参照していない。
- 実行前/後metadataとログはarchive内`evidence/p6-cleanup-execution-before.json`、`p6-cleanup-docker.log`、`p6-cleanup-trash.log`、`p6-cleanup-execution-result.json`（すべて600）へ新規保存。初期manifest764件とそのoriginals_not_deleted表記は保全時点の履歴として上書きせず、現在の除去状態はexecution-resultで示す。
- archiveの正本ハーネス/Composeは記録用であり、その場で実行できる配置ではない。将来は新しい作業場所・合成設定・専用保存先で再構築する。今回の除去により、本文の旧`docker/final-check/compose.py`等のコマンドを現在の元worktreeでそのまま再実行しない。
- アプリ本体/既存テスト/依存lock/通常Composeは無変更のためアプリテストは再実行せず、保持境界と証跡完全性を検証した。文書の参照先をarchiveへ更新。削除後のReviewer独立確認PASS・必須指摘なし。commit/pushは未実施。
- 最終Reviewerはworkspace5対象不在、live通常4metadata完全一致、P6project container/network0、4volume/6image/P5資材の保持、archive764payloadのhash/byte数/600と元manifest hash、新規実行証跡/文書の整合を独立確認した。判定はarchive内`evidence/p6-cleanup-review.json`（600）へ保存。アプリテスト再実行は不要、ゴミ箱の消去は今回含めない。

### P5検証用ソースの追加整理

ユーザーの追加承認により`docker/mysql-upgrade/`の6スクリプトと`docker-compose.mysql-upgrade.yml`をapply_patchで削除し、空ディレクトリを除去した。事前に全7ファイルが保存commit `710864720e67f1c0042278536ddd9f8531eb9184`とbyte一致し、既存コンテナから当該ディレクトリへのmountがないことを確認。backend READMEの終了済み検証起動手順は移行完了記録/Git保存先への案内に置き換え、当時の結果・復旧上の注意は保持した。追加archiveコピーは不要。通常ソース/Compose/DB/バックアップ/volume/image/P5・P6 archiveは変更せず、アプリテストは再実行しない。commit/pushは未実施。

追加整理のReviewer確認はPASS・必須指摘なし。Git保存元との7file一致、通常起動/CI等に依存参照なし、READMEの5参照先/履歴/復旧注意、アプリ/lock/通常Compose無変更を独立確認した。追加テストは不要と判定。

## Docker imageの追加精査（2026-11-03 JST・当初提案と後続の承認実行記録）

ユーザーは過去の作業用imageを調査し、不要なら削除したいと依頼。image/tag/digest/size/architectureと全containerの参照、候補を参照する停止済みcontainerのmountを限定metadataで調べた。imageを起動していない。21 image ID・22container（通常稼働4/停止18）が存在する。タグなし＝不要とは判定せず、現在のMySQLとNode build用baseも保持する。

### 保持推奨：6 image ID

| image ID先頭 | 用途・根拠 |
| --- | --- |
| 4af177a024eb | 通常webのnginx |
| 7edf36b7ea70 | 通常PHP `boxing_talking-php` |
| b8e89dd167d7 | 通常Node `boxing_talking-node` |
| d2a0d367629f | 通常MySQL8.4.13。タグなしだが稼働中DBが参照 |
| 8e85dd5c3255 | 旧MySQL8.0.21。旧my_dataと組にした復旧資材として保持 |
| 976554ea4b26 | 現DockerfileのNode24.22.1 base。コンテナ未参照だが通常再buildに使用 |

### コンテナ未参照の削除候補：10 image ID

| image ID先頭 | 内容 |
| --- | --- |
| 065bf37735dc | 旧PHP8.2 base `php:8.2-fpm` |
| 1e25f0f4b33c | P6検証Node `boxing-runtime-p6-node:current` |
| 50c620788c2d | S7検証PHP8.4 `boxing-talking-php:s7-8.4.27` |
| 67fb14b8037c | タグなし旧PHP8.3.35 base。S3記録の取得digestと一致 |
| 73cc5ddeb846 | S8検証PHP8.5 `boxing-talking-php:s8-8.5.12` |
| 967f0c79493d | S2/統合前PHP `s2-8.2.30`と`pre-integration-20261022`の2タグ、実体1件 |
| ab6b30c221ff | P6検証PHP `boxing-runtime-p6-php:current` |
| bd99e7baa019 | タグなしMySQL Shell Checker26.10.0。P5計画のツール用digestと一致、通常DB用ではない |
| eea1a60ec115 | S3検証PHP8.3 `boxing-talking-php:s3-8.3.35` |
| ef70d832b0f7 | 統合前の旧Node `boxing-p1-p3-old-node:20261029` |

### 停止済み検証containerの参照整理後に削除候補：5 image ID

| image ID先頭 | 内容 | 先に整理する停止済container数 |
| --- | --- | --- |
| 69adbd472059 | P3検証PHP `boxing-p3-php:20261029` | 1 |
| 6c2ff4e61be5 | P3検証Node `boxing-p3-node:20261029` | 4 |
| 6cd09145362d | MySQL8.0.46移行中継用 | 2 |
| 74cc42bbf098 | S9検証PHP `boxing-talking-php:s9-8.5.12` | 3 |
| 7febb7d0d059 | 統合前PHP `boxing-p1-p3-old-php:20261029` | 1 |

候補を参照する11containerは全て停止済みで、このプロジェクトの過去検証用。DB containerのmountは通常DB volume/旧my_dataではないことを確認した。除去する場合はexact ID/名前/停止状態を再確認し、volume削除flagを使わない。残り7つの停止containerや保持6imageは今回の候補に含めない。

### 方針・制約

- 計15imageを整理する案。過去に保持したPHP/Nodeの一時復旧用imageも含むため、当時の実行imageへ即時に戻す用途は手放す。現在の稼働imageと旧MySQL復旧資材、DB volume/backup、Git上の当時のsource/定義、archiveは保持する。Gitからの再buildが同一imageのbyte再現を保証するとはしない。
- 前回のP6停止時に保持した6imageのうち、P6 PHP/NodeとMySQL中継は今回あらためて削除候補にする提案であり、過去の保持記録を遡って変更しない。image削除はまだ承認・実行していない。
- 共有layerが存在するため、各imageの表示サイズの単純合計を解放可能容量として報告しない。詳細`docker system df -v`は60秒でtimeoutしたため、正確な解放見込みは未確認。広範なprune・force削除・build cache/volumeの削除は行わない。
- 証跡はP6 archive内`evidence/docker-image-inventory.json`と`docker-image-cleanup-proposal.json`（600）。full image/container ID、tag/digest、参照関係・mount・共有layerの対応を記録。削除前にはliveの参照を再照合する。今回の処理は読み取りと提案書のみで、アプリ/DB/container/imageを変更していない。
- Reviewer設計確認GO・必須指摘なし。21ID＝保持6/未参照10/停止参照5と候補11containerの境界を独立確認した。11containerの整理では書込layer/コンテナログも失われるため、imageだけでなくcontainer除去も承認対象に含める。967f…は2tag付きなので、ID指定の非force削除が拒否されたらforceへ進めず、承認済みexact2tagを個別に外してID不在を確認する。削除実行は未承認・未実施。

### ユーザーの保持方針変更と削除承認

上記は当初の保持6/削除15案。ユーザーはCompose/Dockerfileから再取得・再buildできるimageを不要に保持しない方針を示した。DBの実backupは移行時点のものを保持していることと、利用再開後の更新は含まないことを説明後、「先ほど洗い出したdocker imageと不要になったコンテナは削除してくれ」と承認された。

- 最終対象は、通常稼働4containerとその4imageを保持し、それ以外の既知image17件・過去検証の停止済container18件を除去する。旧MySQL8.0.21とNode build用baseも今回の削除対象へ変更。旧my_data/実backup/DB volume自体は引き続き保持し、過去imageから即座に復旧するためのローカルcacheを残す方針ではない。
- 実行前の限定metadataで、22container中18件の停止/exactID/過去検証用名称と元inventory一致、21image全ID一致/通常稼働用4件、全30volume、P5実backup/旧DB/両archiveの所在、P6保全764payloadのhash一致を確認。archive内`evidence/docker-image-cleanup-before.json`（600）へ保存した。
- exact18containerをforce/volume削除flagなしで除去し、imageは承認されたexact17IDとそのtagを照合して個別に除去する。2tag imageは各tagを外してから不在を確認。失敗時は停止し、force/pruneへ切り替えない。network/build cache/volume/backup/archiveは削除対象外。
- 通常4metadata、全30volume metadataと保持4image、バックアップ/旧DB/archiveの保持を前後確認する。実行後に解放容量を推測で加算せず、共有layer/build cacheを考慮する。以下が承認後の実行結果で、アプリテスト/版更新/commit/pushは含めない。

### image17件・停止済みcontainer18件の除去結果

- Reviewer実行前GO後、停止/exact ID/名前を再確認して18containerを`docker rm`で除去した。force/volume削除flagなし。通常4containerだけが残ることを確認してから、17imageを個別に除去した。imageタグは直前に対象IDとの一致を照合し、複数tagの967f…も個別処理。prune/forceは使わず、network/build cache/volumeに削除操作を向けていない。
- 除去後はcontainer4件/image4件で、残ったimageは通常web/PHP/Node/MySQL8.4.13が使うものだけ。全17候補IDは不在、通常4のID/status/起動時刻/image/mount/network/projectは実行前と完全一致。全30volumeの限定metadataも完全一致。実backup/旧my_data/P5・P6 archiveの所在、P6 manifest hashと764payload全hash/byte数一致を確認した。
- 旧MySQL8.0.21・8.0.46/旧PHP/旧Nodeのimageも今回の承認で除去済み。過去節のimage保持は当時の状態を記録したもの。再取得/再build前提となり、旧my_dataを現在のMySQL8.4で開くことや、通常書込み再開後の旧DBへの単純巻戻しは引き続き禁止する。backupは移行時点のもの、定期backupは未実装。
- 証跡はP6 archive内`evidence/docker-image-cleanup-before.json`、`docker-image-cleanup-execution.log`、`docker-image-cleanup-removed.json`、`docker-image-cleanup-result.json`（600）。当初21ID/保持6案のinventoryと提案は履歴として上書きしない。共有layer/cacheがあるため解放容量は未計測・未報告。追加アプリテストは不要で、通常DB接続/アプリ変更/commit/pushは行っていない。削除後の独立Reviewer確認PASS・必須指摘なし。
- 最終Reviewerはlive4container/4imageと除去18/17の集合、通常4metadata/全30volume metadata不変、backup/旧DB/archive所在、元manifestと764payload全hash/byte数/600、新規実行証跡/文書の整合を独立確認。判定はarchive内`evidence/docker-image-cleanup-review.json`（600）へ保存した。
