# P5: MySQL 8.4 LTS更新の準備・隔離検証計画

## Goal

MySQL8.0.21から8.4 LTSへの更新を段階的に検証・適用する。第1段階Aの隔離検証と、別承認された第2段階Bの元環境適用・切替確認まで実行完了。main-worktreeのDBは8.4.13で、元データ20table/53履歴/未処理jobs3件を保持し、Web/PHP/Node/DBの通常利用を再開した。旧データ/旧image/各dumpを保持し、実.env/実鍵の本文は表示・コピーしていない。P5の技術作業は完了、変更は未コミット。P4監査保留/P6/本番公開承認は別とする。途中の停止・修正結果は履歴として以下に保持する。

## Background / Context

- 2026-11-02 JST。worktreeはmysql-lts-update、branchはcodex/mysql-lts-update、基点97d6bdea。調査開始時clean。[全体計画](2026-10-22-dependency-runtime-update.md)のP5に対応する。P4 moderate14/2advisoryは上流待ちのまま別管理し、P4完了とは扱わない。
- docker-compose.ymlのdbはmysql:8.0.21/linux/amd64、固定container_name=db、DBポートと資格情報は環境変数から取得。元DBのbindは./docker/db/my_data、backupは./docker/db/backup。web/php/nodeにも固定名・ポートがあり、そのまま別worktreeから起動しない。
- 元Composeのweb/php/node/dbは稼働中、実db imageもmysql:8.0.21。今回はコンテナ名/image名と稼働状態のみ確認し、元DBへの接続・設定内容の取得は行っていない。
- PHP8.5.12/Laravel13.38.0、pdo_mysqlを使用。DB設定はutf8mb4/utf8mb4_unicode_ci/strict。アプリtimezoneはAsia/Tokyo。ソースmigrationは35ファイル。元DBの実行履歴53件という過去記録とは区別する。
- 通常phpunit.xmlはSQLite。config/database.phpのsqlite接続はdatabase.sqlite固定で、DB_DATABASE=:memory:だけでは隔離できない。testing接続とDB_TEST_DATABASE=:memory:をforceする一時設定を使う。
- 直近backend基準は173識別子・172成功/既存skip1・446assertions。既存skipはBoxerTitleSnapshotUpdateTest::testSetUp。フロント定数のRO参照も用意して余分なskipを防ぐ。
- MySQL固有の複合主キー切替、外部キー/cascade、NULL、UUID/token、集計、日次削除、名前付きロックが確認対象。SQLite成功だけでMySQL互換とは判定しない。

## Scope

### In Scope

準備後に承認を求める実行範囲は、**第1段階A: 独立環境＋合成データでの移行/復旧・互換検証**に限定する。

- 専用Composeファイル・手順書を用意する。元Composeを継承せず単独で定義し、固定名・相対bind・ポート・envの暗黙継承を避ける。
- 空の旧8.0.21へ全35履歴と合成データを構築し、8.0.46中継と8.4.13の新しい保存先へ論理dump/loadする。各段階のデータ・スキーマ・動作を比較する。
- Upgrade Checker、PHP接続、既存のMySQL向けテスト、合成API操作、dumpの別DB復元を確認する。
- .envを一切コピー/参照せず、明示的な合成環境値・合成鍵・検証専用資格情報を使う。データ・証跡・復旧情報はGit対象外へ保存する。

### Out of Scope

- 元worktreeへの統合・元MySQLの停止/更新/DB接続・元データのdump/コピー/復元・実ユーザー/既存jobsの処理。本番データも扱わない。
- 元/作業worktreeの.env/.env.production、実鍵や本番設定の参照・コピー。元DBユーザーの認証方式・パスワード変更。
- 通常docker-compose.ymlのimageやDB保存先の変更、元環境の切替。これらは第2段階Bとして結果確認後に別提案・承認とする。
- アプリの仕様変更、依存の追加更新、監査ignore、mysql_native_passwordの再有効化や保護設定の緩和、P4/P6、本番反映、push、無断commit。
- Worker/Tester/Explorer/Plannerのsubagent委任。調査・設計・実装・検証はメイン、Reviewerのみsubagentとする。

## Impact Area

| 対象 | Aで提案する変更 |
| --- | --- |
| docker-compose.mysql-upgrade.yml（新規候補） | 独立した検証環境。DB・PHP・検査ツールを定義 |
| backend/README.md | 検証起動・専用設定・DB名・バックアップ/復元・停止方法を追記 |
| docs/plans本書/README/全体計画 | Aの承認・実績・残条件を更新。準備中の現在は本書だけ追加 |
| Git除外docker/db/backup/mysql-lts-update-p5-20261102/ | dump・比較・検査JSON・JUnit・設定の非秘密部分・結果。親700/ファイル600 |
| backend/tests、アプリ、通常Compose | 原則変更なし。不足/不具合があれば具体案を出して追加承認後に対応 |

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| A: 旧DBを新imageで直接開く | 手順が少ない | 元データ更新・旧版で起動不能の危険があり不採用 |
| B: 隔離8.0.21→8.4.13へ直接logical dump/load | 構成が少ない | 古い8.0由来の差と8.4跨ぎの差が同時に出る。直接経路の実適合は未検証 |
| C: 隔離8.0.21→8.0.46→8.4.13、全て別保存先 | 8.0内とLTS跨ぎの問題を分け、途中復元点を残せる | DB/イメージ/実行時間が増える |

## Decision

Cを推奨する。実行範囲の「第1段階A」と比較案の記号は別物であり、採用方式はC。8.0.46は中継専用、更新先は8.4.13。中継は問題の切り分けを目的とする保守的な設計判断で、Linux/Dockerの全logical upgradeに8.0.35以上が一律必須とは断定しない。公式の現行経路表は8.0系列→8.4 LTSを記載している。実行前に検査結果と選んだ方式の前提を再確認し、不適合なら停止して再提案する。

### 配布確認済み候補

公式registryのmanifestを読取確認した。**pull・起動・実バージョン確認はまだ行っていない**。既存のlinux/amd64を維持し、CPU変更を同時に行わない。

| 用途 | imageとindex digest | 配布architecture |
| --- | --- | --- |
| 中継 | mysql:8.0.46@sha256:7dcddc01f13bab2f15cde676d44d01f61fc9f99fe7785e86196dfc07d358ae2b | amd64/arm64 |
| 移行先 | mysql:8.4.13@sha256:a0225d1ea6631c8bc2385dc4c2faba17bbf1834ecf369e1659a9a382bd8d5dd7 | amd64/arm64 |
| Checkerツールのみ | mysql:26.10.0@sha256:7b16ec7caa94ca7e92f4c5ec287de69d2e8738db056ceb629022951a6f6d910b | amd64/arm64 |

元と同版の8.0.21は既存ローカルimageのID/digestを実行時に記録・固定し、タグだけで版を決めない。新たに取得する場合もdigestを確認する。

8.4.13 imageの公式DockerfileはShell8.4.10を含み、ServerとShellの版は一致しない。CheckerのtargetVersion上限を避けるため、公式mysql:26.10.0内のShell26.10.0を**entrypoint=mysqlshでのみ実行**する。26.10サーバーは起動せず、元DB/永続DBのvolumeを割り当てない。このimageのVOLUME /var/lib/mysqlによる匿名volumeの自動作成も避けるため、checkerには同パスの専用tmpfsを明示する。resolved設定と実mountでtmpfsだけであることを確認する。起動後にShell実版とtargetVersion=8.4.13の受付を検証し、対応しなければ8.4.0へ黙って変更せず停止する。

## Rationale

元DBを不変にしたまま、旧バージョン相当のアプリデータを移し、新バージョンの認証・SQL・migration・復元を試せる。中継点を残せば問題の発生段階も特定できる。8.4の既定認証に合わせた新規検証用アカウントを作り、mysqlシステムDBや旧アカウント定義を異版へ上書きしない。

## Tasks

### 準備（今回の範囲）

- [x] worktree/branch/clean・通常Compose・DB設定・テスト・35migrationを確認。
- [x] MySQL公式の経路・認証・Checker、候補版のrelease notesと配布manifestを確認。
- [x] 比較案・独立環境・検証/復旧・承認範囲を本書へ記載。
- [x] Reviewerによる設計確認、指摘の補正（問題なし・必須指摘なし）。

### 第1段階A（承認後）

- [x] 専用ComposeとREADME、秘密を含まない合成設定を実装。mainのservice ID/startedAt/mountを記録し、resolved構成が元network/volume/pathに触れないことを先に検証。
- [x] image pull/digest/実版・ShellのtargetVersion確認、vendorを既存lockから独立導入。network付き依存導入と、外部通信を遮断した実検証を分ける。
- [x] 空8.0.21へ35migrationと合成fixtureを作成し、基準schema/data hashと動作を取得。
- [x] 同版の別DBへdumpを復元して一致を確認し、選定したShell26.10.0を隔離8.0.21へ接続してtargetVersion=8.0.46のCheckerを実施してから、8.0.46の別volumeへapp schemaだけload。元の8.0.21とdumpを保持。
- [x] 中継8.0.46で8.4.13向けCheckerを実行し、全エラーと手動確認を解決。除外指定で隠さず、warningsも判断根拠を残す。
- [x] 中継dumpを8.4.13の別volumeへload。migration再適用なしで内容保持を比較し、空DB構築との構造一致・PHP接続・各動作を検証。
- [x] 8.4 dumpを別8.4 restore DBへloadして再比較。旧dumpを別8.0.21へ戻す復旧も確認。
- [x] Reviewer・必要な再テスト・証跡永続保存。元4サービス不変と変更範囲を確認し、Aの結果とBへの具体案を報告して停止。

## Test Plan

### 分離・接続先の保証

- project名候補はboxing-mysql-p5、networkはinternal。container_name/external network/host network/外部volume名の固定を使わない。DBポートはホストへ公開しない。API公開が必要な時だけ空き確認後に127.0.0.1へ専用ポートを割り当てる。
- DB保存先はproject専用named volumesを旧版・中継・新規・移行・restore用に分ける。元/他projectのmy_dataやDBvolumeをmountしない。データディレクトリを異版で共用しない。
- --env-fileに合成設定の専用ファイルを明示し、元/作業worktreeの.env自動読込を避ける。PHPのDATABASE_URL/DB_SOCKETを空にし、config cacheを持ち込まず、PHPが認識するAPP_ENV・DBdriver/host/database・接続先@@versionを検査する。DB名はboxing_p5_接頭辞、ホストは専用service名のみ許可し、それ以外はfresh/テスト/restore前に停止する。
- Checkerに必要なmy.cnfは検証サーバーの合成設定をROで渡し、command指定のcharset/collation等も別記録する。configPath不足や未実行checkを成功扱いせず、JSONのerrorCount・実行失敗・manual checkをそれぞれ判定する。
- 合成APP_KEY/JWT鍵、空かコメントだけの合成.env、array mail/cache/session・sync queueを基本とする。database queue回帰時だけ専用合成queueへ切替。外部SMTP/AWSは無効、元鍵・元vendor内cache・元storageは持ち込まない。
- vendorはlock固定で独立導入する。元依存volumeは変更しない。フロント定数をRO mountして既存同期テストを実施する。

### データ移行・復元

- 8.0.21の空DBに現行全35migrationを適用し、19データtable＋migration tableを基準に実数を確認する。fixtureはusers/boxers/matches/comments/predictions/titles/snapshots/token/jobs等の公開動作に必要な関連だけ合成生成し、既存開発データは使わない。
- SQLdumpはapp schema限定。mysql/sys/performance_schema/information_schemaを異版へloadしない。root権限のデータや旧アカウント定義を転送せず、検証用ユーザーを各版で作る。accountsの移行は元切替の別課題として残す。
- mysqldumpは対象版のclientを明示し、transaction整合・charset・GTID・tablespaces・routines/events/triggersの扱いを記録する。--forceでSQLエラーを無視しない。fixture生成終了後は書込を止め、InnoDB以外やDDL並行があればtransaction dumpだけで整合したとは扱わない。
- dump checksumと別DBへの復元成功を確認する。table schema・全行数・型を揃えた値のソート済みhash、NULL/小数/JSON/日付/UTC正規化、AUTO_INCREMENT、index/FK/cascade/照合順序・SQL modeを比較する。版によるSHOW CREATEの表示差は意味を照合し、機械hashの差をデータ消失と即断しない。
- 8.4 freshと8.0→中継→8.4の全35履歴の構造を照合する。旧Laravel8相当の34→35履歴の再検証はAに含めず、現行8.0.21相当からの移行を保証する。過去のSQLを無断利用しない。

### アプリ・MySQL固有の回帰

- Docker内の既存全173識別子を独立SQLiteで実行し、172成功/skip1/446assertionsを維持する。一時phpunit.xmlでtesting/:memory:をforceし、実効接続を事前検査する。
- 別の使い捨てMySQL test DBで、BoxerTitleSnapshotMigrationTestの3ケースとSanctumTokenExpirationTestの2ケースを8.0.21/8.4.13で比較。複合PKのdown/up、重複拒否、NULL、4外部キーcascade、tokenの期限あり/なしを保証する。既存SQLite前提との差が出たら期待値を弱めず、原因と追加承認の要否を報告する。
- PHP8.5/mysqlnd→caching_sha2_passwordの接続・CRUD・transaction rollback、予想集計/公開条件/コメント・合成loginとCookie/CSRF・権限拒否を専用APIで確認する。新規アカウントの認証pluginは実値を確認し、旧認証を再有効化して通過させない。TLS本番要件は別課題。
- 名前付きロックは2接続で取得/排他/解放、日次削除はAsia/Tokyoの日付境界、合成database queueは専用queueの1jobのみで確認。移行データ保持用DBをRefreshDatabaseで初期化せず、既存queueへworkerを向けない。
- 一時phpunit.xmlを使う場合は隔離コピーの既定ファイルとして置き、artisanへ重複--configurationを渡さない。PHPはすべてDocker経由。必要な追加テストやアプリ修正は別提案とする。
- frontendコード・依存変更は予定せず、全frontend build/coverage/UIの再検証はAでは省略。元切替・画面検証と最終全件はB/P6で具体化する。

## Risks

- dump/loadやCheckerの成功だけで本番互換・性能・元開発DBの移行成功とはしない。Aは合成データの互換検証であり、P5全体/元切替の完了ではない。
- 8.4でmysql_native_passwordは既定無効。実ユーザーがこの方式かは調査しておらず、元DBでのアカウント変更・秘密設定参照をAの途中で追加しない。
- 大量/実データ・本番負荷・本番TLS・実ユーザー/既存session・mysqlシステムDB・権限の移行は未確認。後続の切替計画で別途扱う。
- 自動DDL変更・新migration・データ補正が必要なら、その時点で範囲と必要性を提示する。互換性修正を無断追加しない。
- 8.4データファイルを8.0で開くdowngradeを復旧に使わない。保持した旧code/lock/imageと旧dump/volumeの組から**別保存先**へ復元する。元環境は無変更なのでA失敗時の切戻し対象ではない。
- 検証用Composeの停止は専用projectのみ。元Composeのdown/up、down -v、全体prune、強制削除はしない。必要なvolumeやdumpを保持し、不要物の削除は対象を確認して別途判断する。
- 過去のMySQL検証にOOM終了があったため、DBは段階的に起動し、dump確認後の旧版は停止してvolumeを保持する。比較/復元に必要な時だけ同時起動し、Dockerの空きメモリ・ディスクと終了状態を確認する。OOMや消失した一時ログを検証成功と扱わない。
- 一時ファイルを唯一の証跡にしない。実行前のbaselineと実行後を別名で保存し、メタデータ取得でDBhashを上書きしない。SQL/合成鍵/資格情報/個人情報をチャット・Git・公開ログへ出さない。

## References

2026-11-02 JST確認。Context7は公式MySQL文書を参照したが、一部がHeatWave/Windows/最新系列だったため、一般Linux/Dockerの条件として転用せず、次の対象版一次資料と配布情報で照合した。

- [MySQL8.4の更新経路](https://dev.mysql.com/doc/refman/8.4/en/upgrade-paths.html)
- [論理更新の説明](https://dev.mysql.com/doc/refman/8.4/en/upgrade-binary-package.html)
- [更新前の準備・復元](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [アップグレード前の検査項目](https://dev.mysql.com/doc/refman/8.4/en/upgrade-prerequisites.html)
- [Upgrade Checker / targetVersion・設定ファイル](https://dev.mysql.com/doc/mysql-shell/26.10/en/mysql-shell-utilities-upgrade.html)
- [8.4の旧認証方式](https://dev.mysql.com/doc/refman/8.4/en/native-pluggable-authentication.html)
- [8.4.13リリース情報](https://dev.mysql.com/doc/relnotes/mysql/8.4/en/news-8-4-13.html)
- [8.0リリース情報](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/)
- [公式Docker8.4.13の定義](https://github.com/docker-library/mysql/blob/c92fbc392511086e6c1500f28a21421413f0bb51/8.4/Dockerfile.oracle)
- [検査ツール用公式imageの定義](https://github.com/docker-library/mysql/blob/9b6c81572125a4ff828e3037c71940f3f8311978/innovation/Dockerfile.oracle)
- [直近のbackend基準](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)
- [S9のMySQL検証範囲](archive/laravel-php/2026-10-22-laravel-php-s9-result.md)

## Preparation Verification

初回準備（A0限定承認より前）に実行したのはソース/文書・Docker稼働状態の読取とregistry manifest照会、本計画の作成だけ。DB接続・pull・新規コンテナ/volume・dump・migration・アプリテストは未実行。計画文書のみのため、今回はリンク・記載版・diffとReviewerによる設計評価を確認する。

2026-11-02、Reviewerが独立環境・公式経路・認証・検査ツール・既存MySQLテスト・復元・承認範囲を確認。Checker imageのVOLUMEを専用tmpfsで覆う補正と、初段にもShell26.10.0/明示targetを使う補正後、**問題なし・必須指摘なし**。内部リンク3件解決と新規plan1件のみの変更を確認した。この時点では第1段階Aの実装承認は未取得だった。後続のA0限定承認と結果は以下を参照。

## A0: テーブル・合成データ作成の限定承認（2026-11-02）

- ユーザー承認: 「じゃあまずDBテーブルを作成してそこにデータを入れるところまで進めてくれ」。MySQL8.0.21の独立baseline作成だけで停止する。
- 専用Composeはdb80/PHP/依存導入用だけ定義。通常Composeは継承せず、元コンテナ名/元network/元volume/元パスを使わず、ホストポートも公開しない。
- 既存ローカルMySQL8.0.21はimageID sha256:8e85dd5c32558ea5c22cc4786cff512c1940270a50e7dbc21ad2df42f0637de4、配布digest mysql@sha256:86b7c83e24c824163927db1016d5ab153a9a04358951be8b236171286e3289a4。実行前に実版も確認する。
- backendはtrackedファイルだけのenvなしコピー、vendorはlockから独立install。合成設定はGit除外runtimeへ置き、Docker Composeへ--env-fileで明示。元.envは読まない。
- 新規候補はdocker-compose.mysql-upgrade.ymlとdocker/mysql-upgrade/baseline.php、README/本計画の実績。専用スクリプトはAPP_ENV=testing・mysql・DB_HOST=db80・DB_DATABASE=boxing_p5_baseline・@@hostname=p5-baseline-db80・@@version=8.0.21を全て確認し、空DBへ既存35migrationを適用する。
- 標準DatabaseSeederやアプリ仕様は変更せず、専用投入処理で架空ユーザー3・選手4・試合3など64行を作る。団体7/階級17/grade6は既存参照Seederの値を利用。guest/仮登録/管理者/タイトル/スナップショット/コメント/予想/結果も含む。tokenable_idは数値・users.idはUUIDという既存定義のため、無理な変換や孤立tokenは作らずpersonal_access_tokensを空にする。expires_atのNULL許容列を確認し、token期限の実テストは後続の専用MySQLテストで扱う。jobs/failed_jobsも空にし、worker/メール/API操作は実行しない。
- seedは19データtableが全て空である場合だけtransactionで実行し、既存データがあれば削除/上書きせず拒否する。migrateも初期空DBだけ許可する。
- 検証は実接続版/接続先、35履歴/20table/合成件数、全FKとアプリ上の参照、境界値（NULL/token期限/UTF8/soft delete）、誤接続拒否、読取前後hashの保持、元サービスID/開始時刻/mount不変。DBを初期化する全件テストはbaseline DBへ実行しない。
- SQLiteはこの限定作業では作成/実行しない。8.0.46/8.4.13/Checker・dump/restore・元DBコピー・通常Compose更新・元統合・commitは追加承認後。
- [x] A0: 独立環境・35migration・合成データ投入・再起動保持・拒否検査を確認。最終Reviewer問題なしで、この段階で停止。

## A0実行結果（2026-11-02）

- 通常Composeを継承せずboxing-mysql-p5を作成。db80は8.0.21実版/専用hostname、専用volume boxing-mysql-p5_baseline_db80。DB/PHPはinternal networkのみ、ホストポートなし、元path/network/volumeなしをresolved設定と実mountで確認。
- envなしtracked backendコピーをGit除外runtimeへ用意し、lockからComposer install --no-scripts成功。全121packagesの版/source/dist referenceがlock一致。既存PSR4通知2件は保持し、新たな依存更新なし。
- 最初のpreflightで合成JWT鍵未生成の警告が出た。元の鍵を読まずRSA2048鍵を隔離storageへ新規生成して解消し、再preflightで空DB0tableを確認してから操作した。
- 全35migration成功、19データtable＋migrationsの20table。架空users3/boxers4/matches3等の64行をtransactionで投入。migration履歴35行は合成64行に含めない。token/jobs/failed_jobsは0行。
- FK16列の孤立0、コメント/予想の試合とユーザー参照、NULL state、token expires_atのNULL許容、soft-deleted guest、Unicode/絵文字、1000文字コメントを確認した。
- 誤host・誤DB名・APP_ENV違い、既存tableへのmigrate、既存行があるDBへのseedの計5ケースを全て拒否。確認後の全20table内容/schema hashは投入直後と完全一致。seed/migrate再実行でbaselineを初期化していない。
- 元web/php/node/dbは全て同containerID/StartedAt/mountを保持し稼働継続。元DBへの接続や元.env/鍵/データの読み取り・コピーなし。
- 専用PHP構文検査・Compose分離検査・実migration/seed/readonly検証・誤接続/再投入拒否を実行。アプリや通常schemaを変更しておらず、baselineを破壊する全件テスト・SQLite作成・MySQL固有回帰/API・更新/dump/restoreは今回未実施。
- 証跡はGit除外docker/db/p5-runtime/evidence/にconfig-preflight.json、isolated-runtime.json、preflight.json、migrate.log、seed.json、verify-after-guards.json、result.json。本文/資格情報を含まない件数・hashと分離/元サービス検査の結果を保存する。エラー詳細は非公開領域のみ。合成設定と鍵はGit対象外。
- 専用DBを再起動しても全20table内容/schema hashが完全一致し、volumeの保持を確認した。その後、専用PHP/db80だけstopしvolumeと合成データは保持。元4サービスは同ID/StartedAtで稼働継続。最終Reviewer確認後もA0で停止し、MySQL更新や次段階へ自動で進まない。

- A0最終Reviewer結果: **問題なし・必須指摘なし**。20table/64行/FK16列・5拒否ケース・再起動後hash一致・停止volume保持を確認。更新/dump/restore/API/全件回帰/SQLiteは未実施の後続範囲として維持。変更は未コミットで保持する。

## 第1段階Aの続行承認（2026-11-02）

ユーザー: 「MySQLの更新を確認しながら進めて行く作業に入って問題なさそうなら進めてくれ。問題があればそこでストップして報告」。A0の合成DBを使う第1段階Aの続行を承認。元DBコピー/元切替/通常Composeの更新は含まない。

- Gate1: 作成済みbaselineがA0最終hashと一致することを確認し、app schemaのみtransaction dumpを作成、別8.0.21/別volumeの空DBへ復元して全行/構造/制約/採番状態を比較する。
- Gate2: 選定Shell26.10.0で旧8.0.21→8.0.46の明示target検査。エラー/未実行/未説明warning・manual確認事項があれば次のDBへ移さず報告する。
- Gate3: 別8.0.46の空DBへloadして保持・PHP動作を確認、8.4.13向け検査を行う。
- Gate4: 別8.4.13へload、保持/空DB構築/別DB復元/認証/既存回帰/合成APIを順に確認する。結果が正常な場合だけ次へ進む。
- プログラム作成時の検証用設定修正と、DB互換性・データ・検査の問題を区別する。後者があれば問題を隠す補正や期待値変更で通過させず、そのgateで停止・報告する。
- DBは必要な段階だけ起動する。元4service ID/StartedAt/mount、元branchの状態、保持済みbaselineとdumpは維持する。commitは未依頼のため行わない。

## Gate1: 同版バックアップ・復元結果（2026-11-02）

- A0のbaselineを再開し、投入直後の全20table内容/schema hashと一致を確認した。
- MySQL8.0.21のapp schemaのみをtransaction dumpし、別volume/別hostnameの空boxing_p5_restore80へ復元。元DB・mysqlシステムDBや旧アカウントは対象外。
- routines/events/triggersは隔離sourceの管理接続で全0を確認した。schema限定appuserにはroutine出力のglobal権限を追加せず、存在しないobjectsは--skip-routines/--skip-events/--skip-triggersを明示して扱った。--force/--all-databases/--databasesは未使用。
- dump/importともexit0。64合成行・35履歴・20tableの内容、列/default/charset、索引/FK、AUTO_INCREMENTとInnoDBが完全一致。比較は数値取得形式とutf8/utf8mb3の同義表記だけを正規化し、データ・構造変更を許容していない。
- baselineとrestoreのvolume、600のSQLdumpとchecksum、snapshotをGit除外領域へ保持。Gate2用にbaselineのみ再開し、restoreは停止した。
- Gate1最終Reviewerは全table一致と復元成功を確認。Gate2実行前の分離・権限・明示targetも必須指摘なし。検査結果の判断は別gateとして残す。
- Checker用には旧版の実配置/etc/mysql/my.cnfとinclude先を展開し、明示mysqldオプションも追加した。元worktreeの設定や.envは参照していない。

## Gate2: 判定結果未取得による停止（2026-11-02）

- ユーザーの「問題があればそこでストップして報告」に従い、Gate2で停止。8.0.46/8.4.13へのデータ移行・サーバー起動は行っていない。
- 公式digest固定imageのpullとShell26.10.0実版確認は成功。mysqlsh entrypoint/internal network/tmpfs/永続volumeなし/公開portなしを実containerでも確認した。
- 旧版の標準cnf/includeを読み取り展開し、隔離sourceに新規の検査用p5_checker（caching_sha2_password、PROCESS/SELECTのみ）を用意。app schemaや元DBの権限は変更していない。
- 明示targetVersion=8.0.46/configPathを指定するバッチ検査は約3分応答待ちとなり、JSON判定を取得できなかった。観測時のp5_checkerセッションは0。stdoutは空、stderrにen_US.UTF-8 locale設定警告があったが、原因とは断定しない。
- 検査clientを手動停止。exit137はこの停止による結果で、OOMKilled=false。互換性検査の成功でもMySQLの互換性エラー確定でもなく、**互換性は判定不能**と記録する。警告や欠けた結果を無視して次へ進まない。
- 停止前のbaseline全20table内容/schema hashはA0投入直後と完全一致。専用PHP/db80/restore80と検査clientは停止し、baseline/restore volumesと600のSQLdump・checksumを保持。元4servicesは同ID/StartedAt/mountで稼働継続。
- 証跡はGit除外evidenceのgate1-result.json/gate2-result.json/stopped-result.json、checker runtime/version/ログ、baseline-at-gate2-stop.json、両snapshotとdump metadata。SQL・合成設定・鍵はGitへ含めない。未コミットの実装/記録を保持する。
- 最終Reviewerは停止判断・全snapshot一致・volume/dump保持・元サービス不変を確認し、**問題なし・追加の必須後処理なし**と判定。localeとexit137の原因を誤って断定しない説明も確認済み。
- 次回は検査ツールのバッチ実行が待機する原因の調査・同じgateの再検証が必要。今回これ以上の原因調査・再試行や後段移行は行わず停止する。SQLite/全件回帰/更新後API/新版本来のdump/restoreは未実施。

## Gate2待機原因の調査結果（2026-11-02）

ユーザーの原因究明・報告依頼により、DBへ接続しない再現試験で切り分けた。原因は検査処理の長時間実行ではなく、用意した起動方法の不備による**script実行前の暗黙接続・標準入力待ち**と判明。

1. imageの既定[client]設定にsocket=/var/run/mysqld/mysqld.sockがあり、mysqlsh --print-defaultsで自動読込を確認した。MySQL Shellは既定でoptions fileを読み、その内容でglobal sessionを作ろうとする。起動時に--no-defaultsを指定していなかった。
2. そのため対象db80へ接続するPython scriptより先に、ツールコンテナ内の存在しないlocal MySQLへroot接続を試みた。Compose run -dはOpenStdin=true/TTY=falseで、応答者のいないパスワード入力待ちになっていた。
3. DBを使わないprintだけのPython/JSでも、stdinを開いた元の条件では約2分待機して出力なし。stdinを閉じるとexit1/local socket2002で終了し、ツール自身のログにもroot local socket接続を記録した。
4. 待機中の非DB Python試験へ架空の1行を入力すると0.46秒で同じsocket2002へ進んだ。実資格情報は用いていない。
5. 起動引数の先頭へ--no-defaultsを追加した同じprint試験は、stdin開閉の両方で2.7秒/2.5秒、exit0・P5_PYTHON_OKになった。成功時にもlocale警告は残るので、当該警告は今回の待機原因ではない。

checkTimeout=60はutil内の各検査に対する制限であり、scriptより前の接続/入力待ちに効かない。今回は検査が開始しておらず、単に待ち続けても入力がなければ先へ進まない。前回の「検査ツールが応答待ち」という説明をこの結果で具体化する。

対応案は、mysqlsh起動引数の先頭に--no-defaults、非対話実行に--interactive=falseを指定し、scriptが明示した接続先・TLS・合成資格情報だけを使うこと。今回は調査・報告までとし、恒久設定はまだ変更していない。実Checkerの再実行・合否判定・MySQL更新も未実施であり、print試験の成功を互換検査の成功とは扱わない。

証跡はevidenceのdiagnostic-probes.json、diagnostic-no-defaults.json、diagnostic-stdin-release.json、diagnostic-conclusion.json、checker-original-mysqlsh.log/print-defaults.log。全診断プロセスを停止、元4サービスと保持済みDB/volumeは変更していない。Reviewerが再現結果と[公式の自動接続仕様](https://dev.mysql.com/doc/mysql-shell/26.10/en/mysql-shell-utilities.html)、[各検査のtimeout仕様](https://dev.mysql.com/doc/mysql-shell/26.10/en/mysql-shell-utilities-upgrade.html)との整合を確認し、問題なし・必須指摘なしと判断した。

## 起動補正後の再開承認（2026-11-02）

ユーザー「MySQLの更新を実行しよう。エラー等問題が発生したらストップし、原因の究明と報告」により、自動option読込の無効化・非対話実行へ補正して第1段階Aを再開する。元DB切替は含まない。

- checker entrypointに--no-defaults、runに--interactive=falseを指定し、不要なglobal session/入力待ちを避ける。明示接続のTLS/資格情報は維持する。
- script開始・identity確認・検査開始/終了をstderrへ記録。接続timeout10秒・各検査timeout60秒で停止位置を区別し、判定JSONとstderrを別保存する。
- Gate2再実行の結果が問題なしと確認できた場合だけ次の版へ進む。新たな問題があれば当該gateで止まり、再現/公式情報で原因を調べて報告する。版更新や警告の無視を先に行わない。

## Gate2補正後の結果と14警告の判断

--no-defaults/非対話実行の補正後、実Checkerは約4.24秒でexit0、9checks全OK、error0/warning14/notice0/manual0のJSONを取得した。起動不備は解消したが、警告を理由なく消さず適用性を調査した。

14件は全てsysVarsの既定値変更。group/replica/GTID/NDBの未使用9件、監視上限2件とthread_stack増加1件、TLS既定値2件に分類した。専用sourceでreplication設定0、分散pluginなし、GTID OFF、20table全InnoDB、admin_address空を確認。ShellからTLS1.2/1.3を個別指定した接続は双方成功。PHP/本番クライアントの確認済みとは扱わない。

監視/stackの増加は無影響とは断言せず、旧DB停止・低接続数・新環境のメモリ/OOM確認を条件とする。Reviewerが現検証構成の阻害問題なしと確認したため、警告14とraw passed=falseを保持した別gate2-manual-review.jsonに全件の根拠と限定的受容を保存し、合成8.0.46へ進む。警告除外・旧TLS再有効化はしない。これは本番公開可の判断ではない。

## Gate3・Gate4の実行結果と停止（2026-11-02）

- 8.0.46の専用relay_db80へ旧dumpをload。20table・64行・35履歴と全内容/構造/索引/FK/採番が一致。OOMなし、約406MiB。中継app schemaのtransaction dumpも600で保存し、checksumを記録した。
- 8.4.13向けCheckerは6.5秒、exit0、12checks全OK、error0/warning24/notice2/manual0。24件はsysVarsの既定値変更、2noticeは転送しないrootのSET_USER_ID廃止。sourceはreplication設定0/GTID OFF、views/routines/events/triggersは全0。raw passed=falseを保持し、全26項目の限定受容をgate3-manual-review.jsonへ別記録、Reviewerが阻害指摘なしと確認した。
- [公式のInnoDB仕様](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html)でredo容量のCPU基準計算はdedicated_server ON時と確認。OFF時の既定100MiBまで変更されたとは解釈しない。新環境起動直後にもOFF/redo100MiB/bufferpool128MiB/logbuffer64MiB/temp RAM上限1GiB/mmap0/O_DIRECTを実測。DB領域空き約14.7GiB、8.4実使用約527MiB/OOMなし。性能無影響や本番容量の適合を意味しない。
- relay停止後、新しいmigrated_db84 volume/8.4.13を起動。明示接続先・hostname/実版・空DB・mount/internal/noports確認後、中継dumpをload。全20table・64行・35履歴の内容/構造/索引/FK/採番が中継と完全一致。保存用DBへmigrationを再適用していない。
- envなしruntimeだけのPHPUnit設定でtesting接続/DB_TEST_DATABASE=:memory:をforce。フロント定数1fileをRO mountした独立実行でSQLite全173識別子、172成功/既存skip1/446assertions。アプリ・既存テスト・lockは変更していない。
- 保存用DBと別のboxing_p5_regression84 schemaを新規作成し、接続先ガード後にMySQL固有5ケースを実行。34assertionsは通過したが**全5件riskyのため成功扱いせず停止**。exit0だけでは正常完了と判定できない点も記録する。

### riskyの原因と対照試験

こちらで用意したmysql-bootstrap.phpがPHPUnit開始前にLaravelを起動し、error/exception handlerを登録していた。LaravelのtearDownでhandlerを消すと、PHPUnitの開始時snapshotとの差になり「Test code or tested code removed error handlers other than its own」「…exception handlers…」を検出する。vendorのHandleExceptions::flushHandlersStateとPHPUnit::restoreGlobalErrorExceptionHandlersで処理を確認した。

同じ8.4/使い捨てschema・同じtoken期限なし1ケースをdebug実行すると独自bootstrapでrisky再現、bootstrapだけ標準vendor/autoload.phpへ戻す対照実行では1成功/4assertions・riskyイベント0。期待値・テスト本体・DB版を変更しておらず、今回の検証用起動方法が原因と切り分けた。対照試験後は一時設定を元に戻し、残りの検証へは進んでいない。

次回提案は、接続先/実効設定の事前確認を**別PHP process**で行って終了し、PHPUnitは標準autoloadで起動する方式。riskyを含むissue件数も合格条件に含める。全5件の旧8.0.21/新8.4.13比較、空8.4への35migrationと構造比較、8.4 dump/別DB復元、MySQL上の主要API/認証/lock/queue/日次確認は未完了。接続先確認を削除して回避しない。

停止時、保存用8.4全snapshotはload直後と完全一致。専用db84/phpを停止し、baseline/restore80/relay80も停止状態、全volumeと8.0.21/8.0.46のdumpを保持。元4servicesはID/StartedAt/mount不変で稼働中。通常Compose・元DB/実.env・アプリ/既存テストを変更せず、commitもしていない。証跡はdb84-result.json、db84-at-risky-stop.json、sqlite-junit.xml、db84-mysql-junit.xml、db84-risky-debug.log、db84-standard-bootstrap-debug.log、db84-bootstrap-comparison.json、gate4-stopped-result.json。5riskyのJUnitにはrisky理由が載らないためdebugログも保持する。

## MySQL固有5件の再検証完了（2026-11-02）

ユーザーが全5件の正常完了確認と、大きな変更を伴わない問題解決の続行を承認。今回の対象は8.4の5件の再検証で、後続の空DB/復元/API検証へは進めない。

- Git除外runtimeのPHPUnit設定だけを標準vendor/autoload.phpへ補正。APP_ENV/testing・mysql・db84・boxing_p5_regression84と空URL/socketがforceされた設定であることを検査する。
- db84/phpだけを再開。別PHP processで既存ガードを実行し、Laravel実効設定・専用schema・実版8.4.13/hostnameを確認して正常終了させた後、既存artisan testを実行。接続先確認は維持し、PHPUnit開始前のhandler登録を避けた。
- BoxerTitleSnapshotMigrationTestの3件とSanctumTokenExpirationTestの2件が**全5成功・34assertions、failure/error/risky/skip各0**。fail-on-risky/warning/incomplete/skippedを指定し、debugにもriskyイベントなし、JUnitの全5識別子/34assertionsとissueなしを確認。
- 保存用boxing_p5_migrated84の全snapshotは再検証前後および移行直後と完全一致。元4サービスもID/StartedAt/mount不変・稼働継続。専用db84/phpは終了後に停止し、dump/volumeを保持。アプリ・既存テスト・通常Compose・実.envは未変更、commitなし。
- 証跡はevidenceのdb84-five-recheck-result.json、同prefixのpreflight.log/tests.log/junit.xml/preserved-snapshot.json/stop.logとp5-recheck-five.py。過去のrisky結果を上書きしていない。

今回の5件確認は完了。P5全体は未完了で、旧8.0.21の5件との比較、空8.4構築/構造比較、8.4 dump/別DB復元、主要API/認証/lock/queue等は後続範囲に残す。

ReviewerがJUnitの5識別子/34assertions、debug全5成功/risky0、別process事前確認・標準autoload・fail-on条件・保存snapshot一致・217source一致と停止記録を確認し、問題なし・必須指摘なしと判定した。

## 空8.4での新規migration検証完了（2026-11-02）

ユーザーが「8.4の空DBで35migrationを実行し、移行済みDBとの構造一致を確認する」作業を承認。既存の専用db84内に新schema boxing_p5_fresh84を作成し、元DBや移行済みDBの初期化は行っていない。検証専用root操作はhostname/実版/初期schemaを照合して新schema未存在を確認後、その作成とappへのschema限定grantだけに使用した。

- PHPの環境値とLaravel実効設定、DBの実版8.4.13/hostname/schema、table0を既存snapshot処理の専用コピーで確認。DB名だけをfreshへ固定し、誤接続拒否の条件は維持。
- 同じ専用環境で既存artisan migrate --force --no-interactionを実行しexit0、35履歴・20tableを作成。アプリ行は0で、seedは実行していない。
- 35件のmigration履歴は全内容hash一致。全tableの列/型/NULL/default/charset/collation/extra、索引、FKと削除更新規則、engine/table collationが移行済み8.4と一致。
- AUTO_INCREMENTの現在の次番号だけは、空DBと合成行入りDBの比較から除外。列の採番属性は比較したまま、除外した具体値の差はfresh84-schema-comparison.jsonへ別記録。その他の構造差は0。
- 保存用boxing_p5_migrated84は実行前後/移行直後の全snapshotが完全一致。元4サービスのID/StartedAt/mountと稼働も不変。専用php/db84を終了後に停止し、各schema/volume/dumpを保持。アプリ・既存migration・実.env・通常Composeは変更せず、commitなし。
- 証跡はevidenceのfresh84-result.json、fresh84-empty.json、fresh84-migrate.log、fresh84-snapshot.json、fresh84-schema-comparison.json、fresh84-preserved-snapshot.json、fresh84-stop.logとp5-fresh84.py等。snapshot/provision補助はGit除外runtime内のみ。

今回の空DB構築・構造比較は完了。P5全体は未完了で、旧版5件比較・8.4 dump/別DB復元・主要API/認証/lock/queue等を残す。過去節の「空DB未実施」は各時点の履歴とする。

Reviewerが35DONE/20table/履歴内容一致を確認し、AUTO_INCREMENT現在値だけを除いた全schema比較を独立再計算して差0と確認。接続先ガード・保存snapshot不変・停止と限定範囲の記録も整合し、問題なし・必須指摘なしと判定した。

## 残項目の実行結果（2026-11-02・A最終確認）

ユーザーがバックアップ復元・主要動作・旧版比較と、他に影響しない軽微な検証補正の続行を承認した。元DB切替は別途具体案の承認後とし、今回は隔離検証で停止する。

| 検証 | 結果・証跡（Git除外evidence内） |
| --- | --- |
| 8.4 dump/別8.4復元 | restore84専用volumeへ復元、全20table/64行/35履歴の内容・構造・索引・FK・採番が完全一致。restore84-result.json/snapshot.json。sourceのviews/routines/events/triggersは0を確認しskip、accounts/system schemaは転送しない |
| 旧8.0.21と8.4の固有5件 | 両方5成功/34assertions/issue0。5識別子と各assertionsも一致。five-version-comparison.json、db80-five-compare-* |
| MySQL8.4の全既存回帰 | process isolationで全173識別子、172成功/既存skip1/446assertions、failure/error/risky0、exit0。db84-isolated-full-regression-*。skipはBoxerTitleSnapshotUpdateTest::testSetUpのみ |
| PHP実接続/CRUD/rollback | 新規caching_sha2_passwordアカウントへmysqlnd/PDOで接続。別boxing_p5_business84_finalで合成行の作成/読取/更新/削除とrollbackを確認。business84-final-auth-plugin.json/php-checks.json |
| 名前付きロック | 異なる2接続で取得/排他/解放後の再取得を確認 |
| 実database queue | 別business schemaでjobs/failed0を確認、専用p5-a-isolated queueへSampleJob1件だけ投入し実worker --onceで処理。ユーザー名変更とjobs消費/failed0を確認。メール配送や元jobs処理なし |
| 日次処理 | MySQL全件回帰内のDeleteGuestUserTestがTokyo日付変更直後/終端の2境界で成功 |
| 実HTTP主要動作 | コンテナ内loopbackのみで25requests。Cookie/CSRFログイン/ログアウト、不正CSRF419/不正ログイン401/一般権限拒否401/入力422、Unicode+emojiコメント投稿/読取、投票前後/匿名の集計公開条件、管理者のboxer CRUDを確認。business84-final-http-result.json/events.json |

### 検証側の問題と軽微な補正

初回のMySQL全件は115成功/57失敗/既存skip1/265assertions、exit2。54件はFK1452、3件は固定ID期待値またはそれに伴うAPI500だった。SeederがIDを省略し、Factory/既存テストが1〜17/1〜5等を前提にする一方、RefreshDatabaseのtransaction rollbackではMySQLの採番が戻らず、後続テストで参照先がずれた。[公式のInnoDB採番仕様](https://dev.mysql.com/doc/refman/8.0/en/innodb-auto-increment-handling.html)とも一致する。

失敗classのprocess isolation対照試験は5成功/既存skip1となった。Reviewerも制約/期待値を弱めないharness補正として妥当と確認。全件にも--process-isolationを適用し、各testの新processでRefreshDatabaseがfresh構築することで全件正常化した。FK無効化・期待値変更・テスト除外・app/Factory/Seeder変更はしていない。raw失敗はdb84-full-regression-*、対照試験はdb84-process-isolation-probe.*へ保持。成功結果で上書きしない。

HTTP側でも検証用serverのcwdがLaravel routerのgetcwd期待と異なり、初回CSRF GETが200となった。publicをcwdにして再開すると標準204。続いて管理者booleanがwire上はscalar1、BoxerCollectionはdata配下という既存形式に、検証側のassertionを合わせた（AuthController/Router::toResponse/IndexBoxerTestの契約を確認）。アプリの応答は変更せず、initial-/phase1-/admin-probe-の記録を保持。その後**新しいbusiness84_final schemaで最初から25requestsと実PHP/queue処理を再実行し全成功**したため、途中の部分成功の寄せ集めで完了判定していない。

### 終了状態と範囲

保存用boxing_p5_migrated84の全snapshotは移行直後と完全一致。app/tests/migrations/config/lockのtracked218fileとruntimeコピーが一致。専用php/db80/restore80/relay80/db84/restore84は停止、5つのnamed DB volumeと旧8.0.21/中継8.0.46/新8.4.13 dumpを保持。元4サービスはID/StartedAt/mount不変で稼働継続。元worktreeも97d6bdea/codex/laravel-php-upgradeでclean、実.env/実鍵/元DB/通常Composeは操作していない。

証跡はstage-a-final-runtime.json/source-check.json、business84-final-result.jsonとpreserved-snapshot.json、各runnerとevidence-sha256.json。合成のHTTP資格情報/Cookieを出力せず、全証跡/SQL/合成設定はGit除外・600（親runtime700）。元切替・本番TLS/性能/実データ53履歴相当の適合・frontend/UI総合検証はAの成功に含めず、P5全体完了や公開可とは判定しない。commitは未実施。

最終Reviewerは全173識別子のSQLiteとの集合一致・172成功/既存skip1/446assertions、旧新5件一致、実HTTP25件/DB/queue/lock、保存snapshot/218source一致、全専用6service停止/noOOM/5volume保持と元4不変を独立確認し、**問題なし・必須指摘なし、第1段階A完了**と判定した。下記B提案の設計にも必須指摘なし。Bの実inventory/認証/権限/停止復旧条件の確認は未実施で、本番適合/P5全体完了と区別する。

## 第2段階Bの提案（承認済み・適用完了）

Aの合成DB検証だけでは元DBの適合は確定しない。元worktreeは2026-11-02の読取確認でcodex/laravel-php-upgrade / 97d6bdea・clean。以下は元環境の具体的な切替案であり、今回のA続行承認に元DB接続・コピー・停止・通常Compose変更を含めない。

| 方式 | 判断 |
| --- | --- |
| 元my_dataを8.4 imageで直接開く | 元データの不可逆更新と旧版復帰の危険があるため不採用 |
| 元8.0を保持して別の保存先へapp schemaだけ論理移行 | 推奨。Aと同じ8.0.46中継・8.4.13新保存先で、元DBとdumpを保持できる |

1. 元DB操作の承認後、書込み停止手順・稼働worker/scheduler・実DBの履歴/構造/容量・格納objects・認証と既存クライアント適合を確認する。過去の元DB履歴53件という記録と、合成35件を同一と仮定しない。未登録表/履歴や相違があれば切替前に評価する。実.env/鍵/設定本文の参照・コピーはしない方針を維持し、必要な秘密値は利用者側の設定/コンテナ内の既存値を出力しない実行方式を別途確認する。
2. 一時的な書込み停止を行い、元app schema限定の整合dumpとchecksumを秘密領域へ保存。元8.0データを保持し、公式Checkerとobjects/権限の手動確認を実データに対して行う。エラーや未説明の差は解消するまで切替を進めない。
3. 既存my_dataをマウントしない新しい保存先へ、中継8.0.46→8.4.13と論理移行し、全内容/構造/索引/FK/採番、PHP接続・認証と主要動作を比較する。mysql system schema/アカウントを丸ごとコピーせず、新規caching_sha2_passwordアカウントで検証する。元DBへのmigration再実行はしない。実データ保持DBへRefreshDatabase/seed/workerを向けず、更新系の動作試験は別の専用schema・合成ユーザー/queue・mail array・外向き通信遮断に限定し、コピーされた既存jobsを実行しない。
4. 結果が正常な場合のみ、通常Composeのdb imageを固定8.4.13 digest、新しいDB保存先へ変更し、元worktreeへ統合して切替確認する。設定値/READMEと復旧手順も更新する。旧image/旧DB保存先/dumpは削除しない。
5. 書込み再開前の不具合なら、新DBを停止し旧image/旧保存先/旧codeの組へ戻す。8.4データを8.0で開かない。書込み再開後は旧DBへの単純復帰で新しい更新が失われるため、書込みを止めて差分回収/復旧案を再判断し、無断で巻き戻さない。

Bの完了条件は実DBのバックアップ/別保存先移行/主要動作/最終Reviewerと切替後の状態確認。commitや元worktreeへの統合はその時点の依頼・承認に従う。Aの正常結果をもってP5全体や本番公開可と判定しない。

### Bの実行承認・事前確認（2026-11-02）

旧DB保持・別保存先への移行理由を説明後、ユーザーが「了解した。実行してくれ」と承認。元DBの読取・一時的書込み停止・バックアップ・別保存先への中継/8.4移行・main-worktreeへの変更統合と通常Compose切替を対象とする。commitは含めない。

- 元worktreeはcodex/laravel-php-upgrade / 97d6bdea・cleanを再確認。元dbの固定container ID/hostname/実版8.0.21を照合し、既存MYSQL_*値をコンテナ内で使用してmetadataだけを読取。実.env/実鍵の本文は取得していない。
- 元DBは20table/53履歴で現35migrationは全適用済み、追加18履歴は過去の追加/削除。tableの過不足0、全列の型/NULL/default/extra/charset/collation（utf8 aliasだけ正規化）は合成8.4と差0、全InnoDB。views/routines/events/triggersは0、GTID OFF、app認証はcaching_sha2_password。jobs3/failed0は処理せずそのまま移行/保持する。
- 以降の実装では、元コンテナの既存MYSQL_*値をホストの一時メモリ内だけで受け、Docker CLIへの環境継承で新コンテナ/Composeへ渡す。引数/ログ/ファイルへ秘密値を出さず、実.envを読んだり複製したりしない。通常Compose操作も--env-file /dev/nullを明示し、必要値はこの経路で渡す。
- 元appを停止してsourceのsuper_read_onlyを一時有効化し、他の書込みも遮断して整合dump/全snapshotを取得。元のread_only/super_read_onlyを記録し、停止/切替前の失敗なら元へ戻す。queue/schedulerを走らせず、jobsを保全する。
- actual DBのdump・checksum・復旧記録は元worktreeのGit除外docker/db/backup/mysql-lts-update-p5-20261102/（700/600）へ保存し、作業worktreeの削除に依存させない。
- 新中継は専用volume、新8.4の最終保存先はboxing_talking_mysql84_data named volumeとし、元my_dataは新imageへ一切mountしない。検証時はホスト公開なし/internal専用network。新保存先の内容一致・Checker・PHP読取と合成の別schema検証後、mainのdb serviceのimage/mountだけを変更して接続先を切替。
- 元データのsnapshotは全20table/53履歴・jobs3を含め全内容/構造/索引/FK/採番を比較する。PHP/主要動作の更新確認は別の合成schemaのみ。元環境切替後はread中心で確認し、検査用の既存jobs worker/RefreshDatabase/seedは実行しない。

### Bの適用・切替結果（2026-11-02）

- Reviewerの設計確認後、元web/phpだけを一時停止し、元DBのread_only/super_read_only初期0/0を記録してsuper_read_onlyを有効化。1/1の実値を確認した後、全snapshotと60,850byteのapp限定dumpを元worktreeの専用backup領域へ600で保存。前後の全snapshotが一致した。外部からの書込みも停止状態で保持した。
- 実.envの本文は読まず、既存dbコンテナのMYSQL_*値を一時メモリと子process環境で利用。元imageのMySQL設定は内容を表示せずhashでAの検証済み環境と照合し一致。root remote接続/TLS/identityの事前probeも成功し、source account/grantは変更していない。
- 元8.0.21→専用8.0.46→専用8.4.13へ、system schema/accountsを含めないapp schemaのdump/loadを実行。全20table/53migration履歴/未処理jobs3/failed0と全内容hash・列/索引/FK/CHECK/採番が各段階で完全一致。元my_dataを新imageで開かず、migrationを再適用していない。
- 実sourceのCheckerはerror0/warning14/notice0、中継はerror0/warning24/notice2。各problem tupleはAの手動評価済み結果と同一で、replication設定0/GTID OFF/objects0・同一設定を確認。raw JSONと限定受容根拠を保持し、除外で警告を隠していない。
- 新8.4内に別の合成schema/専用caching_sha2_password userを作り、PDO CRUD/rollback、2接続ロック、専用queueの実job1件、実HTTP25件の認証/CSRF/権限/入力拒否/コメントUnicode/投票集計/管理者CRUDが全成功。実データ側の全snapshot・jobs3件は不変。終了後、hostnameと当該schemaの35履歴を照合して合成schema/userだけを削除した。
- 通常Composeのresolved設定を秘密非表示で内部比較し、変更はdb image・/var/lib/mysql mount・新volume定義の3点だけ、環境/ports/他servicesは完全一致。main-worktreeの通常Composeへこの変更を反映した。
- 新volumeはboxing_talking_mysql84_data、旧bindは元docker/db/my_dataのまま保持。Reviewerの指摘を受け、SET GLOBALだけでは再起動後に保持されない点を事前に解消し、新volumeだけへSET PERSIST super_read_only=ONを適用。main db再作成直後も1/1＋persistONを確認して書込みの隙間を防いだ。
- 公開webを停止したまま実PHPアプリからversion8.4.13/DB一致/53履歴/jobs3を確認。ホスト非公開のNginx probeでも実boxer/match APIが200/JSON、全snapshot不変。ReviewerはPDO直結snapshot/identity guard・TLS Checker・永続freeze・Compose限定差分と実データ一致を評価し、問題なし・限定的書込み再開可と判定した。
- 永続freezeを解除しglobal0/0で公開webを再開した初回、起動直後のlocalhost HTTP確認でConnectionResetErrorが発生。新8.4を再び永続書込み停止にしてwebを止め、旧DBへは戻していない。書込み停止中に公開リスナーの起動完了を待つよう検証側を補正し、全snapshot不変を確認後に再開。通常接続/direct接続の対照はいずれも200/JSONで、継続するAPI/DB障害はない。一過性の起動直後transport resetを観測したもので、正確なTCP内部要因を断定せず、raw失敗と回復記録を保持する。
- 最終的にRESET PERSIST後の該当永続値0件、read_only/super_read_only=0/0を確認。公開boxer/match APIが200/JSONで、元snapshotとの全内容/構造/索引/FK/CHECK/採番一致、53履歴/jobs3/failed0を確認。Web/PHP/Node/DBの4servicesはrunning・OOMなし。通常利用は再開済み。
- 稼働中volumeを再利用する停止済み候補p5-main-db84と一時PHP/Nginx probeだけをdocker rm（-vなし）で削除。DB volume/旧データ/backupは削除していない。中継は停止・保持。書込み再開後の旧DBへの単純rollbackは引き続き禁止する。

実データ証跡はGit除外docker/db/p5-main-runtime/evidenceのsource-backup-result.json、stage-result.json、source/relay/targetのsnapshot、validation-result.json/cleanup、compose-comparison.json、target-persistent-freeze.json、cutover-readonly-result.json、main-application-db.json、main-private-http-read.json、public-ready-while-frozen.json、public-transport-comparison.json、main-final-snapshot.json/result.json等。実SQLと復旧点は元worktreeのdocker/db/backup/mysql-lts-update-p5-20261102/へ永続保存し、作業worktreeの削除に依存させない。root/password値をsnapshot・ログ・コードへ記録していない。

P5はA/Bの実行・切替確認まで技術完了。main-worktreeへ今回の12ファイルを反映し、両worktreeのbyte一致とgit diff --check成功を確認した。最終Reviewerも全20table/53履歴/jobs3のsourceとの完全一致、公開API200、4services稼働、read-only解除・旧DB/image/backup保持と12ファイル一致を独立確認し、稼働・データ保持・復旧資材に必須指摘なしと判定した。全体計画の「commit保存後にチェック」という規則との軽微な文書不整合を補正し、P5の技術完了・未コミットを明記して保存チェックは未チェックにした。未コミットの状態で引き渡す。P4 moderate14/2advisoryの保留やP6の統合・公開前確認は本作業で解消/完了したと扱わない。

### P5完了コミット（2026-11-02）

ユーザーの「とりあえずcommitしましょう」により、作業branch codex/mysql-lts-updateへ今回の12ファイルを保存する。上記の未コミット表記は各確認時点の履歴。元worktreeには同一実装を反映済みだが、元branchへのコミット統合は別途行う。SQL/DBデータ/実.env/鍵/生成証跡はコミットに含めない。定期DBバックアップの仕組みは未実装で、ユーザー方針により後日検討する。P4監査保留/P6/本番公開承認は引き続き別とする。
