# S9後の依存ライブラリ・実行環境更新計画

## Goal

Laravel/PHPのS0〜S9で確保した公開動作とデータ互換性を維持しながら、残る依存脆弱性とNode/MySQLのサポート終了へ段階的に対応する。本書は実装判断のための提案書であり、今回の依頼はPlan Document作成まで。依存・コード・設定・DBは変更しない。

## Background / Context

2026-10-22 JST調査。

- 現worktree: /Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking。2026-10-22の追加承認により、S9を元worktreeのcodex/laravel-php-upgradeへ統合し、元環境のブラウザ確認後に旧作業worktreeをアーカイブする。その完了地点から次期更新用の新しいworktreeを作成し、以後はそのworktreeを継続利用する。
- branch: codex/laravel-php-s9、HEAD: 959490c5aa40b96368cb9fae55383a8a13dba0b5（S8コミット）。
- S9の変更はbackend/README.md、全体計画、S9計画・結果の文書のみで未コミット。この既存差分を保持する。本書も現branchに作成する。
- S9基準: PHP8.5.12/Laravel13.38.0/Composer2.9.4、backend171識別子=170成功/既存1skip/440assertions。frontend52ファイル204成功、build/lint成功。
- MySQL新規35履歴・旧Laravel8相当34→35履歴、19データテーブル保持、fresh/legacyスキーマ一致、実HTTP/HTTPS・保存session/cache・ブラウザ登録・実worker/SMTPまで成功。
- S9で機能・再構築検証は完了したが、本番公開承認は行っていない。詳細は[S9結果](2026-10-22-laravel-php-s9-result.md)。
- Composer監査は4advisories/3packages、Laravel0。npm監査は脆弱と判定された111パッケージ（critical7/high72/moderate29/low3）、omit-devは24（critical0/high15/moderate8/low1）。npmの数字は重複を除いたCVE数ではなく、omit-devにもbuild用依存が含まれる。
- S9一時DBのOOM終了があったため、旧検証DBを保存して停止し、保存済みdumpの別DB復元を確認した。一時領域/tmpfsを永続バックアップとして扱わない。

### 現在値と候補

| 対象 | 現在 | 更新方針・候補 |
| --- | --- | --- |
| aws/aws-sdk-php | 3.336.2 | 3系のサポート/監査を満たす修正版。現監査では少なくとも3.371.3を超える版が必要 |
| mtdowling/jmespath.php | 2.8.0（間接依存） | 2.9.1以上の修正版。SDK制約と併せて部分更新 |
| firebase/php-jwt | 6.10.2 | 鍵長検証のある7系安定版。例外・旧token・fixture互換を先に設計 |
| frontend Node | Docker21.6.1 | Node24 LTSを第一候補に、実行時の最新修正・サポート・配布を再照会しパッチ/digest固定 |
| PHP image内Node | 16.13.2 | 利用調査で不要なら導入を削除。必要なら対応中Nodeへ統一。削除も採用案の承認後 |
| frontend主要依存 | Axios1.13.4、Lodash4.17.23、PostCSS8.5.6、Vite4.5.14、Vitest1.6.1、Tailwind3.4.19、React Router DOM6.30.3、uuid9.0.1 | サポート中・修正済みの互換候補を段階ごとに決定。単純な全最新版化はしない |
| MySQL | 8.0.21 | 次のLTS系列である8.4を第一候補。実行時の修正済みパッチ/digestと更新経路を決定 |

候補は実装時の確定版ではない。実行前に公式情報・監査・依存解決dry-runから具体的な版と変更対象を提示し、承認を得る。PHP8.5.12とLaravel13.38.0は原則維持し、更新が必要なら理由と最小案を別途提示する。

## Scope

### In Scope

- Laravel/PHPの統合・元環境確認後に作成する新worktreeで、段階ごとのbranch/commit・復旧点を残す。
- S9文書の保存、現計画の承認、各段階の具体案・レビュー・承認・実装・テスト・結果記録。
- 監査対象の利用経路と公開影響、必要最小限の直接/間接依存更新・lock整合・対応する設定/テスト/README。
- Nodeの対応中LTSへの移行と、PHP内Nodeの必要性整理。実Dockerでのfrontend再構築と起動。
- MySQLの複製DBでの互換性確認、別8.4環境への移行、データ/スキーマ/接続/復元確認。
- 最終構成の再構築・全自動テスト・実HTTP/ブラウザ/メール/queue/日次処理と、公開可否判断用の残課題整理。

### Out of Scope

- 新機能、画面刷新、API/guard/権限/ID/エラーコードの仕様変更、無関係なリファクタリング。
- 本番の秘密情報参照、.env.production参照、本番DB操作、実ユーザーへのメール、外部SMTP/S3、OS信頼ストア変更、デプロイ・push。
- 監査の無効化/ignore追加、弱いJWT鍵の検証回避、vendor/node_modules手編集、無差別な依存更新、npm audit fix --force。
- Laravel/PHPの追加主更新、MySQL9系への飛び越し、承認前の実装変更。
- 本番公開・鍵更新等の重要運用操作は別途具体案と承認を必要とし、本書だけで実行を許可しない。

## Impact Area

| 領域 | 想定対象・影響 |
| --- | --- |
| backend依存 | backend/composer.json/lock。AWS SDK、JMESPath、JWT、必須の関連依存 |
| JWT/メール | backend/app/Jobs/MailSendJob.php、Services/UserService.php、対応Feature/Unit。署名・期限・登録/失敗時の仮登録状態 |
| Node | docker/node/Dockerfile、docker/php/dockerfile、docker-compose.ymlの導入/起動・再現性、必要ならNode版指定/README |
| frontend依存 | frontend/package.json/lock、Vite/Vitest/Storybook/TypeScript等の設定と必要な利用箇所・テスト |
| CSS/画面 | Tailwind等の更新が必要な段階だけ。既存表示・レスポンシブ・フォーム/権限表示を維持 |
| MySQL | Compose image、docker/dbの設定・SQL・認証互換、Laravel PDO接続、専用検証DB |
| 文書 | backend/frontend/ルートREADMEの該当部分、計画・各結果・復旧/残課題記録 |

影響先は候補であり、全ファイルを必ず変更する意味ではない。各段階で実差分を最小化する。エラーコード変更が必要なら領域規約に従い、必要性を先に提案する。

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| 一括更新 | 一度に監査対象を減らせる可能性 | JWT/Node/build/CSS/DBの失敗原因を切り分けにくく、復旧単位が大きい |
| 対象・互換性ごとの段階更新 | 原因・検証・commit・復旧点が明確 | 繰り返しのテスト時間が必要 |
| 警告記録だけで更新を延期 | 変更が少ない | critical依存とEOLを残し、公開前課題を解消できない |

## Decision

段階更新を採用する。P0→P1→P2→P3→P4→P5→P6の順に進め、P4は必要なメジャー更新ごとに小段階へ分割する。段階ごとの実行依頼と具体案承認を受けてから着手し、依存解決が予定外に広がる場合は停止する。1段階完了後は報告して次の実行依頼を待つ。

メインが調査・計画・実装・テストを担当し、Reviewerのみsubagentを利用する。Explorer/Planner/Worker/Tester subagentは、担当内容・並列化の理由・追加コストを示して事前承認を得た場合だけ利用する。

### P0: S9結果と作業基点を保存

S9の既存文書差分・本計画・[統合実行計画](2026-10-22-laravel-php-integration.md)を確認し、git-commit手順で対象・メッセージを提示して承認後に保存する。元worktreeのcodex/laravel-php-upgradeへ統合し、元環境の再構築・DB/依存整合・ブラウザ動作を確認して完了地点を保存する。旧作業worktreeは必要なignoredデータも保護したうえでアーカイブし、その地点から次期更新用worktree/branchを作成する。所有元チャットの制約でアーカイブできない場合、削除で迂回せず保留して報告する。現在の未コミット差分を次期branchへ混ぜない。以後の段階は直前の完了コミットからbranchを作る。branch名は提案名であり作成時に未使用を確認する。

| 段階 | branch提案 | 基点 |
| --- | --- | --- |
| P1 | codex/backend-sdk-security | P0完了commit |
| P2 | codex/backend-jwt-security | P1完了commit |
| P3 | codex/node-lts-update | P2完了commit |
| P4 | codex/frontend-dependency-security / codex/frontend-build-update等 | 直前小段階の完了commit |
| P5 | codex/mysql-lts-update | P4完了commit |
| P6 | codex/security-runtime-final-check | P5完了commit |

P0の統合完了後は新worktree内でローカルbranchを順に切り替える。切替前にcleanと基点を確認し、差分があれば勝手に戻さない。各段階でgit-commitのメッセージ承認手順を使う。追加のworktreeやpushは自動で行わない。

### P1: AWS SDK / JMESPathの脆弱性対応

- criticalのJMESPathを優先し、SDKの2件も修正版へ更新。依存関係が許せば同一段階内でJMESPath→SDKの順に検証し、SDK更新が先に必要な場合はdry-run根拠を示す。
- Composer部分更新で、JWT/Laravel/Nette等の無関係な版/referenceを維持。間接依存を不用意に直接依存へ昇格しない。
- 手書きのSDK利用・Filesystem adapter・CloudFront署名・S3暗号化・JMESPath式/コンパイル設定の利用を確認し、実際の到達条件と監査severityを区別する。文字列検索だけで未使用/悪用可能を断定しない。
- 外部AWSへ接続せず、利用がある経路の振る舞いを適切なfake/mock・合成入力で確認する。利用していない機能を新設しない。

完了条件: 当該SDK/JMESPathの既知3advisoriesが解消し、新規監査悪化なし。全backend・実要件・lock整合成功。SDK利用箇所に必要な回帰確認がある。

### P2: JWT 7系への更新

- JWT::encodeはMailSendJob、decodeはUserServiceでHS256を使用。既存UserCreateTestは正常/期限切れ/不正署名、MailSendJobTestは実Markdown・送信失敗時状態を保証している。
- 7系は短い鍵を拒否するため、鍵の供給元・要件適合性を秘密値を出力せず確認する。本番設定ファイルは読まず、運用環境については必要な適合確認/切替手順を別途依頼する。
- 短いテスト専用鍵と「誤った鍵」は、規格を満たす十分長い合成鍵に更新する。不正署名テストでは、有効長の異なる鍵で署名し、検証の拒否と既存HTTP/DB状態を確認する。SMTP失敗テストが署名前の鍵長エラーにすり替わらないようにする。
- 正常署名、期限30分、期限切れ、異なる鍵、改ざん/不正形式、送信失敗時のpre_user/job状態を既存と比較し、不足分だけテスト追加。
- 十分な強度の既存鍵は維持し、6系で発行した有効tokenを7系で受理できることを確認。弱い鍵なら互換性を偽装せず、旧メールリンク失効・再送・未処理queue・切替時点を含む移行案を提示し、承認まで実行を保留する。
- APP_KEYやJWT鍵を無断更新せず、鍵の水増し/検証無効化で通過させない。

完了条件: JWT監査解消、既存HTTP/エラー仕様・30分期限維持、旧tokenの扱いが決まり、実ブラウザ仮登録→worker→ローカルSMTP受信リンク→本登録→login成功。

### P3: Node24 LTSと導入経路の整理

- Node24 LTSの最新修正版を実行時に再確認し、Docker tag/digestとNode/npm実版を記録する。S9で使ったホスト22.10.0の成功だけを根拠にしない。
- frontend用DockerのNode21を対応版へ更新する。PHP image内Node16は、Compose/README/CI/スクリプトの実利用を調査して「削除」または「同じ対応版へ統一」を具体案に含める。
- docker-compose.ymlのnode起動は現在npm install && npm run dev。lock再現性のためnpm ci採用を検討し、初回導入・起動・再起動と既存volumeの扱いを確認して提案する。
- Node段階ではfrontend依存の無関係な版更新を混ぜない。Node24で既存依存が動かない場合は、最小の必須依存更新を別の小段階として再提案する。
- npm ciは管理外の作業用依存ディレクトリで実行し、共有/既存node_modulesを予告なく削除・再構築しない。Git管理ソースの一時コピーか専用Docker volumeを使い、手編集は行わない。
- 新規Node版指定等の設定を導入した場合は対応READMEも更新する。

- 現在のpackage.jsonにはStorybook・Vitest UI・coverageの導入と実行scriptがある。Node更新前後にStorybook buildとloopback起動、非対話のcoverageレポート生成、Vitest UIのloopback起動とテスト結果表示を確認する。通常のVitest成功だけで代用しない。具体的な引数・必要ファイルは実装前の利用調査で確定する。

完了条件: 実Dockerの対応Nodeでnpm ci/全Vitest/build/lint・開発サーバー起動/再起動に加え、利用中のStorybook・coverage・Vitest UIの確認が成功する。PHP image内に不要な旧Nodeが残らず、必要なComposer/PHP機能も保持する。

### P4: frontend依存の脆弱性対応

- P4a: Axios/Lodash/PostCSS等の互換修正版と必要な間接依存から対応する。React Router/uuid等も利用経路・公開影響を確認して候補を決定。
- P4b以降: Vite/Vitest/@vitest/ui/coverage、対応plugin/Storybook/TypeScriptの制約を照合し、互換性が必要な組だけを更新。CSS基盤の更新はさらに別の小段階にする。
- Tailwindはまず現系列で間接依存更新によって解消できるか確認。4系移行が必要ならCSS/config/pluginの互換修正・対象画面・見た目の完了条件を別途提示。監査のfixAvailableだけでメジャー更新を決めない。
- 開発依存もdev/preview/CIの実行権限や公開状態に影響する。omit-devの24件だけを見て完了としない。逆にnpm111を一律に本番browserから悪用可能とは扱わない。
- Vite dev/preview、Storybook、Vitest UIはloopback限定、権限や公開先を広げず、保護設定を緩めて起動を通さない。
- StorybookやそのVite/plugin依存を変更する小段階では、build-storybookとloopbackでの起動・既存story表示を確認する。Vitest/UI/coverageや対応pluginを変更する小段階では、非対話coverage生成とレポート出力、Vitest UIのloopback起動・テスト結果表示を確認する。不要な機能と判断する場合も黙って省略せず、利用調査と維持/削除の案を提示して承認を得る。

完了条件: Node24の実Dockerで全Vitest/build/lint、production buildの主要ブラウザフロー、CSRF/Cookie付きAPI通信が成功。対象advisory解消、新規悪化なし。残る指摘はpackage/advisory ID・経路・影響・対応版の有無・代替・期限を記録し、公開判断前に承認を得る。修正版があるcritical/highを理由なく延期しない。

### P5: MySQL8.4 LTSへ移行

- 8.0.21→8.4の公式対応経路とUpgrade Checkerを実行時に確認。必要なら一時的に8.0系列の最終修正版を経由する案を提示する。中間環境は公開しない。
- 旧DBの停止/上書きを始める前に、永続保存可能なdumpと復元手順・対象DB名・接続先を確認する。本計画の実装検証は合成DBのみ。本番データは扱わない。
- 原則、旧8.0データディレクトリを保持し、別8.4データディレクトリ/専用volumeへlogical dump/loadする。古いvolumeを新imageで直接開かない。
- mysql_native_password等の認証方式、PHP8.5のPDO/mysqlnd接続、初期化SQL、SQL mode/照合順序・予約語・型・default・索引/FK規則の差を確認。既存認証を弱める設定で回避しない。
- 空DB全履歴と既存相当dumpの移行を比較し、19データテーブルの内容、35履歴（後続の承認済み変更があればその差）、カラム/索引/FK・日次処理・tokenのnullable expirationを検証。
- 旧DBと別restore先を保持し、8.4から8.0へデータファイルを戻すdowngradeを復旧手順にしない。切替後の新規書込みを旧DBへ戻せるとは仮定せず、必要なら停止時間と復旧点以降の書込み扱いを先に決める。

完了条件: 新規/既存データ移行・PHP接続/主要read-write・全backend/MySQL回帰・データ保持/restore成功。旧環境へ復旧できる対応するcode/lock/image/DBの組が記録されている。

### P6: 最終統合・公開準備の引き継ぎ

- 全lockから再構築し、PHP/Laravel・Node/MySQL・全依存の実版・サポート期限・監査を再確認。
- backend/frontend全自動テスト、build/lint、空DB/既存DB/復元、実HTTP/HTTPS・ブラウザ・メール/実queue/日次/ログを総合実行。
- 最終構成・永続backup/restore手順・既存警告・未解決監査・本番運用未確認を記録。
- 公開前に必要な本番HTTPS/Cookie/CSRF/CORS、SMTP/S3、queue worker/cron・監視、配布とcache/worker再起動順序の確認項目を引き継ぐ。本番設定参照・外部接続・実デプロイは別途承認を受ける。
- 機能検証完了と本番公開承認を分け、必須未実施・未承認の重大リスクがあれば公開可能と判定しない。

## Rationale

まずbackendのcriticalを減らし、JWTの署名鍵・旧リンクの互換性を独立して扱う。その後、対応Nodeを基盤にfrontend依存を更新し、DB更新を分離することで、障害原因と復旧点を明確にする。S9の実証済み仕様を基準に、不足する振る舞いだけをテストで補う。

## Tasks

### 計画作成（今回）

- [x] 現branch/HEAD/既存差分、lock実版、S9結果・監査・公式の更新経路を確認。
- [x] 同じworktreeで段階ごとのbranchを切る方針、実行範囲・完了条件・復旧/停止条件を文書化。
- [x] Reviewerが設計を確認。P3/P4のStorybook・coverage・Vitest UI検証を補完し、再レビューで必須指摘解消・新規必須指摘なし（2026-10-22）。
- [x] 提案書を提示。今回の変更は本書の作成のみで、実装・branch作成・commitは未実施。

### 実装（別途承認後）

- [ ] P0: S9文書と計画の対象確認・commit message承認・基点保存。
- [ ] P1: SDK/JMESPathの具体版/dry-run/設計レビュー/実装承認→更新・検証・最終レビュー・保存。
- [ ] P2: JWT鍵/旧token移行の具体案と承認→更新・テスト・実登録・レビュー・保存。
- [ ] P3: Node導入/削除案と具体版の承認→実Docker再構築/起動・全frontend・必要backend検証・保存。
- [ ] P4: 互換更新と必要メジャー更新ごとに具体案/承認→監査/全テスト/画面確認・保存。
- [ ] P5: MySQLの更新経路/復旧具体案と承認→複製DB移行/restore/主要動作・レビュー・保存。
- [ ] P6: 最終全件・監査・サポート・残課題と公開準備引き継ぎ。実deployは行わない。

## Test Plan

各段階で仕様として保証する振る舞いを先に明記する。件数目標だけのテストや実装を写すテストは追加しない。tester/backend-test/frontend-testの各スキルと領域規約を参照する。

| 段階 | 最低限の検証 |
| --- | --- |
| P0 | git diff/check・秘密/生成物混入なし・既存S9結果との整合。文書だけなら全件テスト再実行不要 |
| P1 | Docker内Composer validate/platform/install dry-run・変更package/ref比較・audit、全backend、利用するSDK/JMESPathの公開動作 |
| P2 | 上記backend基準+JWT正常/期限/不正署名/形式・旧token互換・鍵長・SMTP失敗時状態・実worker/ローカルSMTP/ブラウザ登録 |
| P3 | 実Node24 Dockerのnpm ci/全Vitest/build/lint・server起動/再起動、Storybook build/loopback起動・既存story表示、非対話coverage生成、Vitest UIのloopback起動/結果表示。PHP image再build時の拡張/ini/Composer/全backend |
| P4各小段階 | npm監査全依存/omit-dev、全Vitest/build/lint、production buildのブラウザ/API。変更するStorybook/plugin、Vitest/UI/coverageに応じてStorybook build/loopback起動・既存story表示、coverage生成、Vitest UIのloopback起動/結果表示も確認。通信・状態分岐/CSS変更に応じて不足のテストと画面確認 |
| P5 | 空DB/既存相当DB/restore、内容hash/スキーマ比較・PDO接続・全backend/MySQL回帰・実HTTP主要read/write・日次境界 |
| P6 | 全再構築/テスト/ブラウザ/DB/メールqueue日次・監査/サポート/復旧情報の総合確認 |

- PHP/artisan/PHPUnit/ComposerはDockerのみ。backendはdocker compose exec php php artisan test。
- frontendは対応NodeのDocker内でnpm test -- --run / npm run build / npm run lint。Cypressは使用しない。
- S9のbackend171/170成功1skip/440assertions、frontend52ファイル204件と検出一覧を比較し、増減は理由を説明する。既存skip/PSR-4/MySQL CLI/Browserslist/chunk通知と新規診断を分ける。
- APIのstatus/JSON・認証/認可・session/cache形式・UUID/ULID・既存エラーコード・CSRF期待値を維持する。
- 実HTTPではLaravel13のsame-origin token省略とfallbackを踏まえ、HTTP/HTTPS/送信元/tokenの組合せを確認。必要な段階で既存135ケースを再利用する。
- ブラウザは通常/guest/admin login/logout、一般管理URL拒否、一覧/詳細、コメント投稿/reload、一般DELETE拒否/admin成功と再表示、投票、管理フォーム、過去空一覧、仮登録→受信HTMLリンク→本登録→新規login。
- HTTPSはCA検証付きclients、ブラウザはHTTPを基本とし実施範囲を区別する。OS信頼変更や証明書警告迂回を無断で行わない。
- CSS/build基盤の変更時はPC/SP両方で主要画面を比較。新しいレスポンシブ方式やUI仕様を導入しない。
- SMTPは合成宛先限定・送信前health、実database worker、最終user/pre/jobs/failed状態まで確認。queue投入のmockだけで完了としない。
- DBは実行前に専用名/接続先を確認。既存開発DBへfresh/RefreshDatabaseを実行しない。

## Risks

- 対応版が別のPHP/Laravel/Node制約を要求する場合、予定外の主更新へ自動で進めず、選択肢と影響を再提案する。
- JWT7の鍵長検証は実際に短いfixtureへ影響する。強い鍵の旧token互換と弱い鍵の拒否を混同せず、production鍵やリンクを無断で変えない。
- 間接依存の更新やVite/Vitest/Storybook/Tailwind間の制約が変更を広げ得る。実dry-runと利用経路を根拠に小段階へ分割する。
- Node24での全成功は未検証。ホストNode22成功やNode tag変更だけで完了扱いしない。
- MySQL8.4では認証・設定・SQL差があり、イメージtagだけの切替では安全性を保証できない。旧volume上書きや安全未確認のdowngradeをしない。
- 最新監査の増減はlock更新だけでなくadvisory配信にも依存する。実行日/ID/対象版/到達経路/対応状態を残す。
- 検証コンテナを増やすとメモリ不足が再発し得る。必要なものだけ起動し、停止前にdump/restoreと保存先を確認する。
- 各段階で直前commit、lock、対応image、DBdump/storage/設定の対応関係を残す。tmpを唯一の永続保存先にせず、DB切替前に復元の成功を確認する。
- 必須テスト失敗、検出脱落、未説明の新規警告、監査悪化、Reviewer重大指摘、復旧未確認、未承認の仕様/鍵変更があれば保留し、次段階へ進まない。

## References

2026-10-22確認。具体版は各段階開始時に再照会する。

- [S9最終結果・監査・復旧情報](2026-10-22-laravel-php-s9-result.md)
- [Laravel/PHP段階更新計画](2026-10-19-laravel-php-upgrade.md)
- [backend規約](../development/backend.md)、[frontend規約](../development/frontend.md)
- [JMESPath修正情報](https://github.com/jmespath/jmespath.php/security/advisories/GHSA-pcw8-m77r-2528)
- [AWS SDK CloudFront修正情報](https://github.com/aws/aws-sdk-php/security/advisories/GHSA-27qh-8cxx-2cr5)
- [AWS S3暗号化情報](https://aws.amazon.com/security/security-bulletins/AWS-2025-032/)
- [JWT 7移行情報・鍵長検証](https://github.com/googleapis/php-jwt/releases/tag/v7.0.0)
- [Node対応状況](https://nodejs.org/en/about/previous-releases)
- [MySQL8.4更新経路](https://dev.mysql.com/doc/refman/8.4/en/upgrade-paths.html)
- [MySQL更新前準備](https://dev.mysql.com/doc/refman/8.4/en/upgrade-prerequisites.html)
