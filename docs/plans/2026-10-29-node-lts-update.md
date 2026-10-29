# P3: Node LTS・依存導入経路の更新

## Goal

Node 21/16の利用を整理し、既存のfrontend依存・アプリ仕様を維持して、対応中のNode 24 LTSで導入・開発・検証できる状態にする。

## Background / Context

状態: **実装・検証・Reviewer確認・コミット保存完了。保存先は本書を含むcodex/node-lts-updateのP3完了コミット。** 初回作成2026-10-29 JST。

- 作業先: `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。
- branch: `codex/node-lts-update`、基点: `7c6ef535b38c89e184bf023ec6bcba1d77c3c0f7`。調査開始時clean。追加worktreeは作らない。
- 調査開始時の`docker/node/Dockerfile`はNode21.6.1 Alpine、Composeは毎起動`npm install && npm run dev`。frontend全体をbind mountし、依存専用volumeはない。
- frontendにはlockfileVersion3の`package-lock.json`がある。P3ではpackage.json・依存versionと既存scriptsを維持する。lockは追加承認により不足optional情報だけを補完する。pnpm-lock.yamlやrootのHuskyも触らない。
- PHPイメージはaptのnodejs/npmとnを経由してNode16.13.2を導入。PHP本体8.5.12/Composer2.9.4の固定base/digestは維持する。
- backend/package.json/webpack.mix.jsに旧Laravel Mix手順が残るが、現ComposeのPHPサービスにNode起動・ビルド命令はない。backend/app・routes・viewsにMixや生成JS/CSS参照は見つからず、web routesはfrontendへredirect。tracked CI定義はなく、root npm scriptsはホストnpmからDocker内PHPを呼ぶだけで、PHP内npmを必要としない。codegen overrideもfrontendをPHPへmountするだけ。現行経路ではPHP内Nodeを使っていないと判断する。旧Mixの任意手動利用が存在しないことまでは断定しない。

### 版の確認（2026-10-29）

採用版は`node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53`。

- Docker Registryでpatch tagと`24-alpine`のindex digest一致を確認。indexにはlinux/amd64とlinux/arm64/v8を含む。
- mountなし・networkなしの単発containerでNode **v24.22.1**、npm **11.19.1**、Alpine **3.24.3**を確認。これは候補版確認であり、アプリの検証完了ではない。
- [Node公式配布index](https://nodejs.org/dist/index.json)を直接取得し、最新24系は24.22.2（2026-10-27、npm11.19.1、LTS Krypton、security=false）、候補24.22.1は2026-10-20、security=trueと確認。24.22.2の個別archiveページは取得できず、`node:24.22.2-alpine3.24`もRegistryでnot found。24.22.1を「最新修正版」とは扱わない。最新patchのimageが未公開なら「公開待ち」または「確認済み24.22.1を暫定採用」の選択を提示する。候補以外のpatch/digestへ無断変更しない。
- [Nodeリリース一覧](https://nodejs.org/en/about/previous-releases)は時点・ページ間でNode26の表示差がある。新系列への変更は混ぜず、全体計画のNode24 LTSを継続候補にする。
- [npm ci仕様](https://docs.npmjs.com/cli/v11/commands/npm-ci): manifest/lock不整合は失敗し、両ファイルを更新せず、既存node_modulesを再導入する。このため専用volume内でのみ実行する。

## Scope

### In Scope

- frontend用Node Docker imageのpatch/digest固定。
- PHP DockerfileのNode導入RUNを削除。旧Mix設定・backend依存の整理は含めない。
- nodeサービスの依存専用named volumeと、導入・起動の分離。
- frontend READMEと全体計画への手順・進捗記録。必要ならbackend READMEにPHP内Node廃止を記載する。
- 追加承認済みのfrontend/package-lock.json不足optional情報補完。既存artifactを維持。
- 実Dockerで既存frontend/backend機能の回帰確認、結果記録。

### Out of Scope

P4のfrontendライブラリ更新、MySQL更新、アプリ仕様・認証・API・テスト仕様変更、新規テスト追加、元checkout/元Composeへの統合、commit/push/本番反映は含めない。Node互換性のため依存変更が必要なら、理由・最小差分を別途提案する。

## Impact Area

| ファイル | 変更・影響 |
| --- | --- |
| docker/node/Dockerfile | FROMを候補固定版へ変更。WORKDIR維持 |
| docker/php/dockerfile | Node導入RUNだけを削除。PHP/Composer/pdo_mysqlを維持 |
| docker-compose.yml | node commandを`npm run dev`へ変更。`/usr/src/app/node_modules`にproject単位のnamed volumeを追加 |
| frontend/README.md | 初回導入、通常起動、lock変更・Node更新時の再導入、package追加、検証コマンド |
| backend/README.md | PHP内Node廃止と現在のfrontendビルド経路を必要な範囲で追記 |
| docs/plans/ | 計画・進捗・結果 |

frontend/package.json、pnpm-lock.yaml、アプリとテストコードは差分なし。frontend/package-lock.jsonは追加承認により不足optional情報と4件の分類metadataのみ補正する。

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| 毎起動npm ci | 毎回lockと一致する | 再起動でも再導入・networkが必要。起動と導入が結合 |
| 明示npm ciと起動分離＋専用volume（採用） | 通常起動が軽く、ホスト依存と分離。既存lockを維持 | 初回とlock/Node更新時の手順が必要。忘れると古い依存が残る |
| image buildでnpm ci | imageに依存を固定可能 | bind mountとvolumeの初期化/更新を設計する必要があり、今回の開発構成では変更が広い |

PHP内Nodeは、削除とNode24再導入を比較し、現行経路に利用が見つからないため削除する。旧Mixを任意利用する開発者は別Node環境が必要となる旨を記録する。

## Decision

初回・依存変更時は専用volumeへ明示的にnpm ci、通常はnpm run devとする。自動導入サービスやhash管理scriptは追加しない。

READMEではリポジトリrootからの以下の順序を示す（実装後に検証する予定手順）。

1. 初回: `docker compose build node` → `docker compose run --rm --no-deps node npm ci` → `docker compose up -d`。
2. 通常: `docker compose up -d`。devコマンドは従来どおりnpm run dev。
3. lock取得・Node image更新時: `docker compose stop node` → 必要なら`docker compose build node` → `docker compose run --rm --no-deps node npm ci` → `docker compose up -d node`。動作中のdevと再導入を並行しない。
4. package追加・更新時は停止後、同じnodeサービスで`npm install package@version`を実行し、manifest/lockの差分を確認・保存。通常のlock再現にはnpm ciを使う。

新named volumeはproject名で分離し、ホスト既存node_modulesを隠す。元環境の依存を移動・削除・コピーせず初回npm ciで構築する。空volumeで起動だけを行うと依存不足で失敗するため、初回必須手順を明記する。lock更新後の再導入忘れは自動検出しない設計上の制約として記載する。

## Rationale

P3をランタイムと導入経路に限定し、P4の依存変更と障害原因を分ける。手動の明示導入は通常起動を単純に保ち、既存package scriptsへの影響も小さい。PHPから不要な旧Nodeを削除して二重管理を解消する。

## Tasks

- [x] branch/規約/利用経路/候補image実版を調査。
- [x] Reviewerの設計評価を反映（2026-10-29、必須不備なし。暫定版採用の停止条件を明確化）。
- [x] 具体案と24.22.1暫定採用の明示承認を得る（ユーザー: ok! go ahead!）。
- [x] 着手前にDocker tagを再照合。24.22.1の固定digest一致、24.22.2-alpine3.24はnot foundを再確認し、承認済み固定候補を使用。
- [x] 承認範囲のDocker/Compose/READMEを実装。
- [x] 専用環境の導入・起動・全検証と最終文書を含むReviewer照合を完了。
- [x] 全体計画と本書に結果・残課題を記録。ユーザーの保存依頼・message承認により本書を含むP3完了コミットへ保存。

## Test Plan

新たな仕様テストは追加せず、既存の公開動作と再構築を確認する。実行結果は末尾に記録する。

- Git管理ソースの一時コピーと独立Compose project/container名・専用依存volumeを使用。元php/web/node/dbとそのport・volume・DBを操作しない。検証用サーバーの公開portは127.0.0.1限定。実.env/本番秘密情報はコピーしない。
- 同じNode image、既存lockからnpm ci成功。前後のpackage.json/lock hash一致。空volume初回、導入済み起動、再起動、再npm ci後の起動を確認する。独立コピーでmanifest/lock不整合時にnpm ciが失敗することも確認し、実ソースを変更しない。
- Node24実Dockerで`VITE_APP_API_URL=http://localhost:3000 npm test -- --run`、`npm run lint`、`npm run build`。直前基準は52ファイル204 tests。元依存を流用せず専用volumeに導入する。
- Viteはcontainer内0.0.0.0:3000、hostはloopbackの未使用portに割当て。HTTPとブラウザで画面表示、停止/再起動後の表示を確認。
- `npm run build-storybook`。`npm run sb -- --host 0.0.0.0 --ci --no-open --disable-telemetry --no-version-updates`をloopbackへ公開し、既存Button storyのiframe表示を確認。Storybook7の実CLI helpで引数を確認済み。
- 非対話coverageは`npm test -- --run --coverage`で全件成功とcoverageレポート出力を確認。既存`test:coverage` scriptはUIを含むので変更しない。
- UIは`npm test -- --ui --api.host 0.0.0.0 --api.port 51204 --api.strictPort`をloopbackへ公開。Vitest1.6.1 helpでapi引数を確認済み。ブラウザでテスト結果表示を確認し終了する。
- telemetry/update check等の不要通信は抑制し、既存テストのMSWを使用する。外部SMTP/AWSや実メール送信なし。
- PHP imageを実際に再buildし、PHP8.5.12、Composer2.9.4、pdo_mysql・使用ini/必要extensions、node/npm不在を確認。専用backendコピーと専用vendor、合成APP/JWT鍵、SQLite in-memory、array mail/cache/session、sync queue、network noneで既存backend全件を実行。P2基準は172成功・既存skip1・446 assertions。接続設定が元DBを向かないことを実行前に確認する。
- Docker資源を見ながら処理を直列化。frontend buildには過去の成功条件としてheap1024MB/container1536MBを参考にし、元コンテナは停止しない。失敗時は既存問題/Node差分を切り分け、依存更新で黙って回避しない。

## Risks

- 最新patchの公式情報とimage公開状況に差がある。24.22.1暫定採用の明示承認を得た場合のみ本書の固定候補で進める。承認がなければimage公開待ちとし、新patch/digestを使用する場合は再提案する。
- 古いVite/Vitest/StorybookのNode24互換は実行確認まで未確定。P3を実施してもP4の監査課題は解消しない。
- npm11のpeer/engine制約やnative optional依存で導入が失敗する可能性。lockを書き換えたりlegacy-peer-depsを無断追加しない。
- 明示導入方式ではlock更新時の再導入を開発者が行う必要がある。READMEに必須手順として残す。
- PHP内Node削除により旧Mix手動実行はPHP container内でできなくなる。現行のReact/Viteはnodeサービスで扱う。
- 専用検証の成功を元環境統合・本番反映済みと扱わない。復旧はP2基点のcode/lockと旧imageを保持し、元DB/volumeに触れない。

## 実装・検証途中の結果（2026-10-29）

- Docker/Compose/READMEを承認案どおり実装。アプリ・テスト・manifest/lockは未変更。
- Node imageのbuild成功。PHP imageもNode導入なしでbuild成功（専用tag `boxing-p3-php:20261029`、image `sha256:69adbd472059dcb33deaba13313e086f3ca4f85ec8a779bbb379c13149adf44b`）。
- PHP8.5.12、Composer2.9.4、Composer install/check-platform-reqs、FPM設定検査成功。専用ini/必要extensionsを確認し、node/npm不在を確認。
- backend既存全件は **172成功・既存skip1・446 assertions**。P2基準と一致。実行前に専用SQLite in-memory、mail=array、queue=syncを確認。新規テストなし。
- Node24/npm11の専用volumeへの`npm ci`は **EUSAGEで失敗**。既存lockにfsevents/esbuild/rollup/unrs等の他platform向けoptional依存情報が不足している。frontend各検証の完了とは扱わない。

### 追加承認: lockの不足情報補完（承認・反映済み）

既存lockのままではnpm ciが成功せず、承認案の再現導入が成立しない。検証用コピーで`npm install --package-lock-only --ignore-scripts --no-audit --no-fund`を実行し、具体差分を確認した。

- package.json不変、lock既存1782エントリのversion/resolved/integrityは全件不変、削除0。
- 不足していた **optionalエントリ105件** を追加。esbuildのplatform別binary、Rollup、unrs resolver、fsevents、およびそれらのWASM関連optional間接依存を含む。
- 既存4エントリはdev関連metadataだけを補正（@types/node/undici-typesはdev→devOptional、esbuildのdarwin-arm64/linux-arm64はdevフラグ除去）。
- 推奨は、既存versionを維持してこのlock補完だけをP3へ追加し、そのlockからnpm ci・全frontend検証を行うこと。代替のnpm downgrade、legacy-peer-deps、毎起動npm installへの復帰は採用しない。
- 追加差分はfrontend/package-lock.jsonのみ。作業branchのlock更新はReviewer確認とユーザーの追加承認後に行う。証跡は`/private/tmp/boxing-p3-20261029/lock-diff.json`、候補lockは同`lock-probe/package-lock.json`。

- 補完候補lockの`npm ci --dry-run --ignore-scripts --no-audit --no-fund`はexit0で成功。ただし実導入・アプリ検証の代わりとは扱わない。
- 途中検証の証跡はGit対象外の`docker/db/backup/node-lts-update-20261029/`へ保存。result.json/manifest.json、PHP検証・JUnit、元lockでのnpm ci失敗と補完差分・dry-run結果を含む。秘密env/鍵/tokenは含めない。

- Reviewerの差分・追加提案確認（2026-10-29）: 必須指摘なし。105件すべてoptional、既存1782件の版・取得先・integrity維持と4件のmetadata変更、PHP結果を確認。native binaryの実導入・frontend動作は未確認で、追加承認後に検証する。

- ユーザーの「それなら実行しましょう」によりlock補完を追加承認。コマンドを再実行し、先の候補とbyte一致・105 optional追加・既存artifact全不変を確認してbranchへ反映した。補完後lock SHA-256: `c65322e3e76b0726e2ba9da02e457c87bd029a13bc7d62e1c700ed8a561c79e3`。

- 補完後の実`npm ci`はexit0、1776 packages導入。package.json不変・導入前後lock byte一致を確認。npm監査は79 packages（critical7/high32/moderate30/low10）を報告。旧監査とはnpm版・条件が異なるため改善数とは解釈せず、P4の残課題として扱う。

## 最終実装・検証結果（2026-10-29 JST）

承認済みのNode24.22.1固定、PHP内Node削除、依存導入とdev起動分離、専用named volume、README、および追加承認されたlock不足補完を実装した。**実装・検証・コミット保存完了。**

| 検証 | 結果 |
| --- | --- |
| 実ランタイム | Node24.22.1 / npm11.19.1 / Alpine3.24.3、linux/arm64。PHP8.5.12 / Composer2.9.4は維持 |
| npm ci | 補完前はEUSAGEでlock不整合を拒否。補完後は実導入1776 packages成功。既存volumeでの再npm ciも成功 |
| 再現性 | package.json不変、補完済みlockは導入・再導入前後byte一致。既存1782エントリのversion/resolved/integrity全不変・削除0。105 optional追加・4 metadata補正のみ |
| 既存frontend | 52ファイル204成功、lint成功、TypeScript/production build成功 |
| Storybook | build成功。loopback経由の実devでButton Docs内の既存story preview iframe描画を確認 |
| coverage | 非対話で52ファイル204成功、HTML/JSON/Cloverレポート生成。生成物なし同一ソースで再確認し、200件すべてsrc配下。最終集計はstatements/lines50.83%、branches80.24%、functions68.94%（閾値の追加なし） |
| Vitest UI | loopback経由のブラウザで204 Pass / 0 Fail / 52 filesを確認 |
| 開発サーバー | 初回起動、依存再導入なしのrestart、停止→再npm ci→起動の各状態でHTTP成功・ブラウザの利用規約画面描画を確認 |
| PHP | Node導入なしimageのbuild/Composer install/platform要件/FPM設定成功、使用ini/必要extensions・node/npm不在確認。既存backend172成功・既存skip1・446 assertions |
| 監査 | 同一npm11のpackage-lock-only監査で前後79 packages（critical7/high32/moderate30/low10）。package/advisory/重大度/範囲/経路は同一。docs-toolsのfixAvailable提案のみ差があり、監査JSON全体が同一という意味ではない |

### 検証条件・失敗の扱い

- 計画の不整合拒否確認には、補完前lockでの実npm ciのEUSAGE失敗を対応させる。失敗ログを保持し、意図的なテストやmanifest変更は追加していない。
- Storybook buildは検証heap1024MBでOOMとなり、元環境の使用量を確認後、heap1536MB/container2048MBで成功。これは一時検証環境の制限変更であり、ソース/依存変更による回避ではない。
- 最初のcoverageには先に生成したstorybook-staticが含まれた。生成物なしの同一ソースコピーで再実行し、最終レポートへ置き換えた。テスト設定は変更していない。
- Dockerのinternal networkでは直接のport公開が有効にならなかったため、専用gatewayだけを127.0.0.1へ公開して内部node/Storybook/UIへ中継した。元Composeや元portは操作していない。
- 再npm ciは`--no-audit --no-fund`付き。同条件の監査は別途完了済みで、依存解決に影響するflagは追加していない。初回npm ciは通常の引数で成功。
- 全自動テストは合成設定とMSW/SQLiteで実行。開発画面のブラウザ確認は静的な利用規約画面の描画・起動互換までで、実APIを伴う業務フローや外部SMTP/AWSを再検証した意味ではない。PHP/アプリ機能の回帰は既存テストで確認した。
- 検証コピーの対象279ファイルはworktreeと一致することをReviewerが照合済み。アプリ/テスト/package.json/Composer lock/旧pnpm lockは差分なし。新規テストなし。

### 残る警告と次段階

- 既存npm脆弱性79 packages（critical7を含む）は残存。Node更新やlock補完による解消とは扱わず、P4で依存の更新案を検討する。Composer Mimeの既知残課題も全体計画どおり別途対応する。
- 非推奨依存、Browserslistデータの古さ、bundleサイズ、React Router future flag、Storybook内telejson eval/child-process deprecation等の警告が残る。今回の版更新範囲へ無断追加せず記録した。
- npm11はCypress/esbuild/MSW/unrs等6 packagesのinstall scriptがallowScripts未指定である旨を警告する。現設定のnpm ciと今回対象ツールの動作は成功した。scriptの包括承認・検証無効化や新しいpolicy設定は行っていない。Cypress E2Eは規約どおり対象外。
- Vitest UIはcontainer内のブラウザ自動起動でxdg-open不在を出力したが、UIサーバーと全テストは継続し、ホスト側ブラウザで全件成功を確認した。
- 24.22.1は承認済み暫定版。最新配布24.22.2の対応Alpine image未取得という差は残し、別patch/digestへの無断変更はしていない。
- PHP内で旧Mix手動実行はできない。現行React/Viteの操作はnodeサービスを使用する。lock/Node更新時はREADMEの停止・再npm ci手順が必要で、自動検出は追加していない。
- **P3のコミット保存は完了。元checkout/元Composeへの統合・本番反映は未実施。** 全体計画のP3チェックを保存完了へ更新した。次のP4へは自動着手しない。

### 証跡・復旧

Git対象外の`docker/db/backup/node-lts-update-20261029/`にresult-final.json/manifest.json、JUnit、各実行ログ、browser画像、最終coverage、前後監査と補完差分を保存。実.env/鍵/tokenは保存していない。元環境のphp/web/node/dbは維持し、P3専用container/networkは終了時に停止・除去する（依存volumeと一時コピーは保持）。

復旧点はP2完了`7c6ef535b38c89e184bf023ec6bcba1d77c3c0f7`と旧image。元DB/依存volumeは変更しておらず、再構築時は対応するcode/lock/imageの組を使用する。

- 最終Reviewer確認（2026-10-29）: **問題なし、必須の未実施・不整合なし**。再導入/再起動と各テスト・ブラウザ結果、lock三者一致、最終文書、保存証跡294件のmanifestを照合済み。P3専用container/networkは全profileを含め終了・除去し、元php/web/node/dbの継続稼働を確認した。

- 保存依頼・message承認: ユーザーのok! go ahead!!により`chore(runtime): Node24への更新と依存導入手順を整備`で保存。続く元worktreeへのP1〜P3統合は別計画で承認済み。
