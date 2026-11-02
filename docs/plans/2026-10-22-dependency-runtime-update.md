# S9後の依存ライブラリ・実行環境更新計画

## Goal

Laravel/PHPのS0〜S9で確保した公開動作とデータ互換性を維持しながら、残る依存脆弱性とNode/MySQLのサポート終了へ段階的に対応する。本書を全体計画と進捗管理の入口とし、段階ごとの詳細な計画・実績へリンクする。実装・検証の完了と、コミットによる保存の完了を分けて記録する。

## Current Progress

保存状況の追記（2026-11-02）: ユーザー依頼によりP5の実装・検証記録を本コミットへ保存する。以下のP5「未コミット」は保存依頼前の確認時点の記録。元worktreeへの実装反映は済んでいるが、元branchへのコミット統合は別途行う。定期DBバックアップは未実装で、後日検討する。

確認日: **2026-11-02 JST**。P0〜P3とP4の各実装・元環境への統合は保存済み。元worktreeの`codex/laravel-php-upgrade`で管理する。P4統合の到達点は`84262908`、P1〜P3の未保存だった統合記録は`6182bff`へ保存済み。P4の残存監査は保留し、**P4全体は未完了。P5は隔離検証Aと元環境適用Bまで技術完了、mainのMySQLは8.4.13・通常利用再開済み、変更は未コミット。P6は未着手**。本番反映は行っていない。

[計画一覧](README.md)から履歴を辿れる。以下の監査・版情報は記載した確認時点の値であり、本整理では監査を再実行していない。過去の判断・監査推移・branch運用は末尾の履歴へ分ける。

| 段階 | 現在の状態 | 保存先・根拠 |
| --- | --- | --- |
| P0: Laravel/PHP統合 | 完了・保存済み | `8aed4bd3`、[統合結果](archive/laravel-php/2026-10-22-laravel-php-integration-result.md) |
| P1: SDK/JMESPath | 完了・保存済み | `8b8dc115`、[計画・結果](archive/dependency-runtime/2026-10-22-backend-sdk-security.md) |
| P2: JWT7 | 完了・保存済み | `7c6ef535`、[計画・結果](archive/dependency-runtime/2026-10-29-backend-jwt-security.md) |
| P3: Node24/導入経路 | 完了・元環境統合済み | `a5648642`、[P3結果](archive/dependency-runtime/2026-10-29-node-lts-update.md)、[P1〜P3統合](archive/dependency-runtime/2026-10-29-p1-p3-integration.md) |
| P4: frontend依存 | 個別実装・検証・元統合済み。残存監査は保留 | 実装`a2e3e709`、統合`84262908`、[統合結果](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)、[P4j保留調査](2026-11-02-frontend-moderate-advisories.md) |
| P5: MySQL | 隔離A・元適用Bの技術作業完了、main8.4.13/20table/53履歴/jobs3保持・通常利用再開。未コミット | [P5計画・検証結果](2026-11-02-mysql-lts-update.md) |
| P6: 最終統合・公開準備 | 未着手 | 全段階の再検証・残課題確認。本番公開承認は別途 |

### 次に行うこと

文書整理と旧作業worktree/統合済みbranch整理は完了。元branchはcodex/laravel-php-upgradeの97d6bdeaを保持し、同地点から作ったcodex/mysql-lts-updateでP5を進める。

1. [P5計画・検証結果](2026-11-02-mysql-lts-update.md)を確認する。Aの移行/空DB/旧新版比較/復元/全回帰/主要動作に続き、別承認のBで実データ20table/53履歴/jobs3を別保存先へ完全保持してmainを8.4.13へ切替。通常PHP/内部・公開API200/JSONと全snapshot一致を確認し、書込み停止の永続値を解除して通常利用を再開した。旧8.0の保存先/imageと元worktree内の専用backupを保持。実.env本文や実鍵は表示・コピーせず、実データへ破壊的テストや既存jobs workerを向けていない。
2. 次はP5の未コミット差分の保存とP6の具体案確認。P5変更はmain-worktreeにも反映するが、commitは依頼後とする。既に書込み再開済みなので、旧DBへの無断単純rollbackは禁止し、再開後の更新を保全して復旧方法を再判断する。
3. P4の上流修正版対応は保留を継続し、再評価条件を満たした時に別途確認する。

### 残課題

- **frontend監査**: 2026-11-02のP4j調査でmoderate14/devのみ・omit-dev0、2advisory。minimatch/globの修正版を上位の依存範囲がまだ許容せず、通常更新だけの解消経路は確認できなかった。候補ESLint10.14.0は未適用、実版は10.13.0。開発/build/CIへの影響は残り、保留を解消扱いしない。部分改善も含めた[再評価条件](2026-11-02-frontend-moderate-advisories.md#risks--再開条件)を参照。
- **Composer監査**: P2確認時点でSymfony Mime medium1件（symfony/mime7.4.19、PKSA-wtxr-p26d-nn42 / CVE-2026-45070）が残存。情報源の範囲差と修正版を照合し、対応段階・版は別途決定する。今回再監査せず、0件とは扱わない。[P2記録](archive/dependency-runtime/2026-10-29-backend-jwt-security.md#残存監査p2対象外)。
- **Node**: 24.22.1は承認済み暫定版。P3時点の候補24.22.2の対応Alpine image取得は未確認。将来更新時に再評価する。
- **本番・外部接続**: 本番HTTPS/Cookie/CSRF/CORS、実鍵の強度・適合性、外部SMTP/S3、queue/cron・監視・本番切替と復旧は未確認・未実施。本番公開承認は含まない。
- **検証範囲**: P1は承認により既存backendテストまでに限定し、新規テスト・SES補足・SDK/JMESPath smokeは未実施。VoteIcon単独storyのRecoilRoot不足も既知の制限として残る。
- **DB記録の限界**: P4統合では統合前の内容hashを保存時に上書きしたため、統合前からの全内容不変は証明できない。統合前後の件数と、home GET後から後続読取終了までの全20table内容/schema hash一致を確認した。P1〜P3統合の前後比較とは区別する。[P4統合結果](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)。

### 統合済み構成（2026-11-02のlock・既存検証記録）

| 対象 | 統合済みの版・状態 |
| --- | --- |
| PHP / Laravel / Composer | 8.5.12 / 13.38.0 / 2.9.4 |
| SDK / JMESPath / filesystem / JWT / Mime | 3.401.3 / 2.9.1 / 8.1.9 / 7.2.1 / 7.4.19 |
| frontend Node / npm | 24.22.1 / 11.19.1。PHP image内Nodeは削除済み |
| Axios / Lodash / PostCSS | 1.20.0 / 4.18.1 / 8.5.32 |
| Vite / Vitest / Storybook | 7.3.7 / 4.1.12 / 10.6.5 |
| React Router DOM / MSW / ESLint / TypeScript / Tailwind | 7.18.5 / 2.15.0 / 10.13.0 / 5.9.3 / 3.4.19 |
| 未使用直接依存 | uuid・Cypress・テスト関連6指定を削除済み |
| MySQL | 8.0.21を維持。8.4 LTSは初期候補で、具体版・更新経路は未決定 |

## Background / Context

### 計画作成時の調査記録（2026-10-22 JST）

以下は初版時点の記録。現在の作業先・進捗・監査は上記Current Progressを参照する。

- 計画作成時のworktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。元checkout統合・元環境確認後、ユーザー承認により旧worktreeを削除済み。次期worktreeは作成済みで現在も継続利用している。
- 当時のbranch: `codex/laravel-php-s9`、当時のHEAD: `959490c5aa40b96368cb9fae55383a8a13dba0b5`（S8コミット）。
- 初版作成時に未コミットだったS9文書・本計画は、その後P0で保存・統合済み。P2と今回の進捗更新もP2完了コミットへ保存済み。
- S9基準: PHP8.5.12/Laravel13.38.0/Composer2.9.4、backend171識別子=170成功/既存1skip/440assertions。frontend52ファイル204成功、build/lint成功。
- MySQL新規35履歴・旧Laravel8相当34→35履歴、19データテーブル保持、fresh/legacyスキーマ一致、実HTTP/HTTPS・保存session/cache・ブラウザ登録・実worker/SMTPまで成功。
- S9で機能・再構築検証は完了したが、本番公開承認は行っていない。詳細は[S9結果](archive/laravel-php/2026-10-22-laravel-php-s9-result.md)。
- Composer監査は4advisories/3packages、Laravel0。npm監査は脆弱と判定された111パッケージ（critical7/high72/moderate29/low3）、omit-devは24（critical0/high15/moderate8/low1）。npmの数字は重複を除いたCVE数ではなく、omit-devにもbuild用依存が含まれる。
- S9一時DBのOOM終了があったため、旧検証DBを保存して停止し、保存済みdumpの別DB復元を確認した。一時領域/tmpfsを永続バックアップとして扱わない。

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

**進捗: 完了・保存済み。** S9文書・本計画を保存し、元checkoutの`codex/laravel-php-upgrade`へ統合した。元環境の再構築・依存/DB整合・ブラウザ・実worker/ローカルSMTP登録を確認し、`8aed4bd34012ba2979be311d60d0943b83f82899`を統合完了基点として保存済み。旧作業worktreeはユーザー承認により削除済みで、その基点から現在の次期worktree/`codex/backend-sdk-security`を準備した。旧worktree処理や次期worktree作成を再実行しない。詳細は[統合結果](archive/laravel-php/2026-10-22-laravel-php-integration-result.md)。所有制限が出た場合に迂回しない制約は引き続き適用する。

以下のbranch表と運用説明は初版時点の履歴。P5/P6の作業環境は現在の方針と別の具体案で判断する。

| 段階 | branch（初版時点） | 基点 |
| --- | --- | --- |
| P1 | codex/backend-sdk-security | P0完了commit |
| P2 | codex/backend-jwt-security | P1完了commit |
| P3 | codex/node-lts-update | P2完了commit |
| P4 | codex/frontend-dependency-security（P4a保存済み）/ codex/frontend-build-update（P4b保存済み）、以降は小段階ごと | P3完了commit / 直前小段階の完了commit |
| P5 | codex/mysql-lts-update | P4完了commit |
| P6 | codex/security-runtime-final-check | P5完了commit |

当時の方針: P0の統合完了後は新worktree内でローカルbranchを順に切り替える。切替前にcleanと基点を確認し、差分があれば勝手に戻さない。各段階でgit-commitのメッセージ承認手順を使う。追加のworktreeやpushは自動で行わない。

### P1: AWS SDK / JMESPathの脆弱性対応

**進捗: 承認範囲の実装・検証・コミットまで完了。** 保存commit: `8b8dc1157e008e103133ef04bffc7db6e5a940ea`。[P1計画・結果](archive/dependency-runtime/2026-10-22-backend-sdk-security.md)。

- JMESPath `2.8.0→2.9.1`を先に、続いてSDK `3.336.2→3.401.3`へ部分更新。必須の`symfony/filesystem 8.1.9`だけを追加した。他118 packagesは全オブジェクト/reference不変。
- 対象3 advisories解消。P1実行時の監査は4件→JWT1件。後から判明したMimeの指摘はCurrent Progressの残課題に記録する。
- Composer validate/platform/install・lock整合成功。既存backend171識別子=170成功・既存skip1・440 assertions。Reviewer問題なし。
- ユーザーの範囲指定により、P1は依存更新後の既存テストまでに限定した。新規テスト・SES補足・SDK/JMESPath smoke・外部AWS接続は行っていない。間接依存を直接依存へ昇格せず、アプリ/設定/API仕様は変更していない。

承認後の完了条件: 対象3 advisories解消、新規監査悪化なし、lock整合と既存全backend成功。上記結果で達成し、コミット済み。

### P2: JWT 7系への更新

**進捗: 実装・検証・Reviewer確認・コミット保存まで完了。** JWT7.2.1へ更新し、既存テストの鍵修正と改ざん/不正形式2ケース追加、旧token互換・実ブラウザ登録/worker/ローカルSMTP/loginまで成功。backend173識別子=172成功・既存skip1・446 assertions。実鍵/APP_KEYは変更していない。[P2計画・結果](archive/dependency-runtime/2026-10-29-backend-jwt-security.md)。下記方針の実装・検証結果と本書を、`codex/backend-jwt-security`のP2完了コミットへ保存した。

- JWT::encodeはMailSendJob、decodeはUserServiceでHS256を使用。既存UserCreateTestは正常/期限切れ/不正署名、MailSendJobTestは実Markdown・送信失敗時状態を保証している。
- 7系は短い鍵を拒否するため、鍵の供給元・要件適合性を秘密値を出力せず確認する。本番設定ファイルは読まず、運用環境については必要な適合確認/切替手順を別途依頼する。
- 短いテスト専用鍵と「誤った鍵」は、規格を満たす十分長い合成鍵に更新する。不正署名テストでは、有効長の異なる鍵で署名し、検証の拒否と既存HTTP/DB状態を確認する。SMTP失敗テストが署名前の鍵長エラーにすり替わらないようにする。
- 正常署名、期限30分、期限切れ、異なる鍵、改ざん/不正形式、送信失敗時のpre_user/job状態を既存と比較し、不足分だけテスト追加。
- 十分な強度の既存鍵は維持し、6系で発行した有効tokenを7系で受理できることを確認。弱い鍵なら互換性を偽装せず、旧メールリンク失効・再送・未処理queue・切替時点を含む移行案を提示し、承認まで実行を保留する。
- APP_KEYやJWT鍵を無断更新せず、鍵の水増し/検証無効化で通過させない。

完了条件: JWT監査解消、既存HTTP/エラー仕様・30分期限維持、旧tokenの扱いが決まり、実ブラウザ仮登録→worker→ローカルSMTP受信リンク→本登録→login成功。

### P3: Node24 LTSと導入経路の整理

**進捗: 実装・検証・保存完了。Reviewer問題なし。** [P3詳細計画・結果](archive/dependency-runtime/2026-10-29-node-lts-update.md)。以下は初版の方針・完了条件。実績・追加承認は詳細計画を参照。

- Node24 LTSの最新修正版を実行時に再確認し、Docker tag/digestとNode/npm実版を記録する。S9で使ったホスト22.10.0の成功だけを根拠にしない。
- frontend用DockerのNode21を対応版へ更新する。PHP image内Node16は、Compose/README/CI/スクリプトの実利用を調査して「削除」または「同じ対応版へ統一」を具体案に含める。
- docker-compose.ymlのnode起動は現在npm install && npm run dev。lock再現性のためnpm ci採用を検討し、初回導入・起動・再起動と既存volumeの扱いを確認して提案する。
- Node段階ではfrontend依存の無関係な版更新を混ぜない。Node24で既存依存が動かない場合は、最小の必須依存更新を別の小段階として再提案する。
- npm ciは管理外の作業用依存ディレクトリで実行し、共有/既存node_modulesを予告なく削除・再構築しない。Git管理ソースの一時コピーか専用Docker volumeを使い、手編集は行わない。
- 新規Node版指定等の設定を導入した場合は対応READMEも更新する。

- 現在のpackage.jsonにはStorybook・Vitest UI・coverageの導入と実行scriptがある。Node更新前後にStorybook buildとloopback起動、非対話のcoverageレポート生成、Vitest UIのloopback起動とテスト結果表示を確認する。通常のVitest成功だけで代用しない。具体的な引数・必要ファイルは実装前の利用調査で確定する。

完了条件: 実Dockerの対応Nodeでnpm ci/全Vitest/build/lint・開発サーバー起動/再起動に加え、利用中のStorybook・coverage・Vitest UIの確認が成功する。PHP image内に不要な旧Nodeが残らず、必要なComposer/PHP機能も保持する。

### P4: frontend依存の脆弱性対応

**進捗: P4a〜P4i-2の実装・検証・保存と元環境統合まで完了。P4jのmoderate14/2advisoryは保留し、P4全体は未完了。** [統合結果](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)と[保留調査](2026-11-02-frontend-moderate-advisories.md)を参照。以下は初版の全体方針であり、個別結果は計画一覧と履歴を参照。

- P4a: Axios/Lodash/PostCSS等の互換修正版と必要な間接依存から対応する。React Router/uuid等も利用経路・公開影響を確認して候補を決定。
- P4b以降: Vite/Vitest/@vitest/ui/coverage、対応plugin/Storybook/TypeScriptの制約を照合し、互換性が必要な組だけを更新。CSS基盤の更新はさらに別の小段階にする。
- Tailwindはまず現系列で間接依存更新によって解消できるか確認。4系移行が必要ならCSS/config/pluginの互換修正・対象画面・見た目の完了条件を別途提示。監査のfixAvailableだけでメジャー更新を決めない。
- 開発依存もdev/preview/CIの実行権限や公開状態に影響する。omit-devの24件だけを見て完了としない。逆にnpm111を一律に本番browserから悪用可能とは扱わない。
- Vite dev/preview、Storybook、Vitest UIはloopback限定、権限や公開先を広げず、保護設定を緩めて起動を通さない。
- StorybookやそのVite/plugin依存を変更する小段階では、build-storybookとloopbackでの起動・既存story表示を確認する。Vitest/UI/coverageや対応pluginを変更する小段階では、非対話coverage生成とレポート出力、Vitest UIのloopback起動・テスト結果表示を確認する。不要な機能と判断する場合も黙って省略せず、利用調査と維持/削除の案を提示して承認を得る。

完了条件: Node24の実Dockerで全Vitest/build/lint、production buildの主要ブラウザフロー、CSRF/Cookie付きAPI通信が成功。対象advisory解消、新規悪化なし。残る指摘はpackage/advisory ID・経路・影響・対応版の有無・代替・期限を記録し、公開判断前に承認を得る。修正版があるcritical/highを理由なく延期しない。

### P5: MySQL8.4 LTSへ移行

**進捗: 隔離検証Aと元環境適用Bまで技術完了。mainは8.4.13で元データ/53履歴/jobs3を保持し通常利用再開済み。未コミット。** [具体案・承認・実績](2026-11-02-mysql-lts-update.md)を参照。以下は初版の全体方針であり、未承認部分を自動実行しない。

- 8.0.21→8.4の公式対応経路とUpgrade Checkerを実行時に確認。必要なら一時的に8.0系列の最終修正版を経由する案を提示する。中間環境は公開しない。
- 旧DBの停止/上書きを始める前に、永続保存可能なdumpと復元手順・対象DB名・接続先を確認する。本計画の実装検証は合成DBのみ。本番データは扱わない。
- 原則、旧8.0データディレクトリを保持し、別8.4データディレクトリ/専用volumeへlogical dump/loadする。古いvolumeを新imageで直接開かない。
- mysql_native_password等の認証方式、PHP8.5のPDO/mysqlnd接続、初期化SQL、SQL mode/照合順序・予約語・型・default・索引/FK規則の差を確認。既存認証を弱める設定で回避しない。
- 空DB全履歴と既存相当dumpの移行を比較し、19データテーブルの内容、35履歴（後続の承認済み変更があればその差）、カラム/索引/FK・日次処理・tokenのnullable expirationを検証。
- 旧DBと別restore先を保持し、8.4から8.0へデータファイルを戻すdowngradeを復旧手順にしない。切替後の新規書込みを旧DBへ戻せるとは仮定せず、必要なら停止時間と復旧点以降の書込み扱いを先に決める。

完了条件: 新規/既存データ移行・PHP接続/主要read-write・全backend/MySQL回帰・データ保持/restore成功。旧環境へ復旧できる対応するcode/lock/image/DBの組が記録されている。

### P6: 最終統合・公開準備の引き継ぎ

**進捗: 未着手。** 以下はこれから具体案・承認を得て実施する計画。

- 全lockから再構築し、PHP/Laravel・Node/MySQL・全依存の実版・サポート期限・監査を再確認。
- backend/frontend全自動テスト、build/lint、空DB/既存DB/復元、実HTTP/HTTPS・ブラウザ・メール/実queue/日次/ログを総合実行。
- 最終構成・永続backup/restore手順・既存警告・未解決監査・本番運用未確認を記録。
- 公開前に必要な本番HTTPS/Cookie/CSRF/CORS、SMTP/S3、queue worker/cron・監視、配布とcache/worker再起動順序の確認項目を引き継ぐ。本番設定参照・外部接続・実デプロイは別途承認を受ける。
- 機能検証完了と本番公開承認を分け、必須未実施・未承認の重大リスクがあれば公開可能と判定しない。

## Rationale

まずbackendのcriticalを減らし、JWTの署名鍵・旧リンクの互換性を独立して扱う。その後、対応Nodeを基盤にfrontend依存を更新し、DB更新を分離することで、障害原因と復旧点を明確にする。S9の実証済み仕様を基準に、不足する振る舞いだけをテストで補う。

## Tasks

### 計画作成（2026-10-22完了）

- [x] 現branch/HEAD/既存差分、lock実版、S9結果・監査・公式の更新経路を確認。
- [x] 同じworktreeで段階ごとのbranchを切る方針、実行範囲・完了条件・復旧/停止条件を文書化。
- [x] Reviewerが設計を確認。P3/P4のStorybook・coverage・Vitest UI検証を補完し、再レビューで必須指摘解消・新規必須指摘なし（2026-10-22）。
- [x] 2026-10-22に初版提案を提示。その後の実装・保存状況はCurrent Progressと以下のチェックリストで管理する。

### 段階別進捗

各段階は実装・検証・コミットによる保存まで完了した時点でチェックする。

- [x] P0: S9文書/本計画の保存、元環境統合・動作確認、旧worktree処理と次期worktree準備。統合完了commit `8aed4bd3`。
- [x] P1: SDK/JMESPathの具体版/dry-run/レビュー/承認、更新・既存backend全件・最終レビュー・保存。commit `8b8dc115`。
- [x] P2: JWT7系への更新・旧token互換・全backend・実登録・レビュー・保存。`7c6ef535`へ保存済み。
- [x] P3: Node24更新・PHP内Node削除・lock補完、全検証・Reviewer確認・保存。`a5648642`。
- [ ] P4: 互換更新と必要メジャー更新ごとに具体案/承認→監査/全テスト/画面確認・保存。
- [x] P5: 更新経路/復旧案の承認、隔離移行/restore/回帰/主要動作、別承認の元環境切替・確認・Reviewer確認を完了。ユーザー依頼によりコード/文書を本コミットへ保存。
- [ ] P6: 最終全件・監査・サポート・残課題と公開準備引き継ぎ。実deployは行わない。

## Test Plan

各段階で仕様として保証する振る舞いを先に明記する。件数目標だけのテストや実装を写すテストは追加しない。tester/backend-test/frontend-testの各スキルと領域規約を参照する。

| 段階 | 最低限の検証 |
| --- | --- |
| P0 | git diff/check・秘密/生成物混入なし・既存S9結果との整合。文書だけなら全件テスト再実行不要 |
| P1（完了・承認範囲限定済み） | Docker内Composer validate/platform/install dry-run・変更package/ref比較・audit、既存全backend。ユーザー指定により新規テスト・SES補足・SDK/JMESPath smokeは対象外 |
| P2 | 上記backend基準+JWT正常/期限/不正署名/形式・旧token互換・鍵長・SMTP失敗時状態・実worker/ローカルSMTP/ブラウザ登録 |
| P3 | 実Node24 Dockerのnpm ci/全Vitest/build/lint・server起動/再起動、Storybook build/loopback起動・既存story表示、非対話coverage生成、Vitest UIのloopback起動/結果表示。PHP image再build時の拡張/ini/Composer/全backend |
| P4各小段階 | npm監査全依存/omit-dev、全Vitest/build/lint、production buildのブラウザ/API。変更するStorybook/plugin、Vitest/UI/coverageに応じてStorybook build/loopback起動・既存story表示、coverage生成、Vitest UIのloopback起動/結果表示も確認。通信・状態分岐/CSS変更に応じて不足のテストと画面確認 |
| P5 | 空DB/既存相当DB/restore、内容hash/スキーマ比較・PDO接続・全backend/MySQL回帰・実HTTP主要read/write・日次境界 |
| P6 | 全再構築/テスト/ブラウザ/DB/メールqueue日次・監査/サポート/復旧情報の総合確認 |

- PHP/artisan/PHPUnit/ComposerはDockerのみ。backendはdocker compose exec php php artisan test。
- frontendは対応NodeのDocker内でnpm test -- --run / npm run build / npm run lint。Cypressは使用しない。
- S9/P1基準はbackend171識別子=170成功・既存skip1・440 assertions。P2で拒否2ケースを追加したため、今後のbackend比較基準は173識別子=172成功・既存skip1・446 assertions。frontendは52ファイル204件のまま。検出一覧を比較し、増減は理由を説明する。既存skip/PSR-4/MySQL CLI/Browserslist/chunk通知と新規診断を分ける。
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
- 初版時点ではNode24での全成功は未検証だった。その後P3/P4で実Node24 Dockerによる全件・lint/build等を検証済み。今後の更新でも、ホストNodeでの成功やimage tag変更だけで完了扱いしない。
- MySQL8.4では認証・設定・SQL差があり、イメージtagだけの切替では安全性を保証できない。旧volume上書きや安全未確認のdowngradeをしない。
- 最新監査の増減はlock更新だけでなくadvisory配信にも依存する。実行日/ID/対象版/到達経路/対応状態を残す。
- 検証コンテナを増やすとメモリ不足が再発し得る。必要なものだけ起動し、停止前にdump/restoreと保存先を確認する。
- 各段階で直前commit、lock、対応image、DBdump/storage/設定の対応関係を残す。tmpを唯一の永続保存先にせず、DB切替前に復元の成功を確認する。
- 必須テスト失敗、検出脱落、未説明の新規警告、監査悪化、Reviewer重大指摘、復旧未確認、未承認の仕様/鍵変更があれば保留し、次段階へ進まない。

## References

初版の外部参照は2026-10-22確認。2026-10-29にP0/P1/P2の保存状況・個別結果と照合して進捗を更新した。未着手段階の具体版は各段階開始時に再照会する。

- [S9最終結果・監査・復旧情報](archive/laravel-php/2026-10-22-laravel-php-s9-result.md)
- [Laravel/PHP段階更新計画](archive/laravel-php/2026-10-19-laravel-php-upgrade.md)
- [backend規約](../development/backend.md)、[frontend規約](../development/frontend.md)
- [JMESPath修正情報](https://github.com/jmespath/jmespath.php/security/advisories/GHSA-pcw8-m77r-2528)
- [AWS SDK CloudFront修正情報](https://github.com/aws/aws-sdk-php/security/advisories/GHSA-27qh-8cxx-2cr5)
- [AWS S3暗号化情報](https://aws.amazon.com/security/security-bulletins/AWS-2025-032/)
- [JWT 7移行情報・鍵長検証](https://github.com/googleapis/php-jwt/releases/tag/v7.0.0)
- [Node対応状況](https://nodejs.org/en/about/previous-releases)
- [MySQL8.4更新経路](https://dev.mysql.com/doc/refman/8.4/en/upgrade-paths.html)
- [MySQL更新前準備](https://dev.mysql.com/doc/refman/8.4/en/upgrade-prerequisites.html)


## 元worktreeで保持するP1〜P3の追記（2026-10-29の履歴）

以下は統合前から元worktreeにあった追記の当時の記録。2026-11-02に本書を含む文書保存コミットへ保存する。上のP4進捗と区別し、以下の「未コミット」は2026-10-29時点を示す。

最終更新: **2026-10-29 JST**。**P3まで実装・検証・Reviewer確認とコミット保存済み。P3保存先は本書を含むcodex/node-lts-updateの完了コミット。元worktreeへのP1〜P3統合・実起動確認も完了し、結果の最終Reviewer問題なし。**
- 段階作業側branch: `codex/node-lts-update`。作業基点は`codex/backend-jwt-security`先端のP2完了コミット（本書の進捗更新を含む）。P2保存後、同worktreeで`git switch -c codex/node-lts-update`により作成・切替。
- P1〜P3を元checkoutの`codex/laravel-php-upgrade`へ`a5648642`までfast-forward済み。元Composeでも依存導入・実起動・全テストと読み取り表示、既存DB/queue保持を確認。[統合計画・結果](archive/dependency-runtime/2026-10-29-p1-p3-integration.md)。本番反映は未実施。
1. P3保存・元worktree統合・実起動検証まで完了。統合結果もReviewer問題なし。結果追記は未コミット。

### 元worktreeへの中間統合（2026-10-29）

元側branchは`codex/laravel-php-upgrade`、HEAD`a5648642`。P1〜P3の依存/runtimeを元Composeへ反映し、backend172成功・既存skip1、frontend204成功・lint/build、元HTTP/browserと全20テーブル/既存queue保持を確認。最終Reviewer問題なし。詳細は[統合結果](archive/dependency-runtime/2026-10-29-p1-p3-integration.md)。この結果追記は未コミット。


## 過去の進捗更新（2026-10-30〜11-02）

最終更新: **2026-11-02 JST**。P4の実装とP4jの保留記録は元worktreeの`codex/laravel-php-upgrade`へff-only統合済み。コード衝突なし、元の文書追記も保持。全204 frontendテスト・lint/型/build/Storybook buildと隔離backend172成功/skip1、元環境の読取起動確認を実施。[統合計画・結果](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)を参照。**moderate14/2advisoryは上流待ちで保留し、P4全体は未完了。**

以下は各段階の保存時点の履歴であり、「元環境未統合」は当時の状態を示す。

最終更新: **2026-10-30 JST**。**P3まで実装・検証・Reviewer確認とコミット保存済み。P3保存先は`a5648642`。元worktreeへのP1〜P3統合と実起動確認も完了。P4aは依存実装・検証・Reviewer確認・コミット保存完了。元環境へ未統合。P4全体は未完了。P4bも実装・検証完了、最終Reviewer確認完了（必須指摘なし）。コミット保存済み・元環境未統合。**


P4cは[Router・uuid計画と結果](archive/dependency-runtime/2026-10-30-frontend-router-uuid.md)を承認後に実装。既存204テスト・lint/build・合成API画面確認・最終Reviewer確認完了（問題なし）、監査33→32/omit-dev9→7。ユーザー依頼により本書を含むP4c/P4d保存コミットへ保存。元環境未統合。通常npm ciのCypress binary取得は失敗し、検証限定で本体取得を省略して導入成功。P4全体は未完了。

P4d-1は[未使用Cypress削除](archive/dependency-runtime/2026-10-30-frontend-cypress-removal.md)を承認後に実装。既存204件・lint/build・旧4ケース相当の手動画面確認・最終Reviewer確認完了（問題なし）。監査32→26、omit-dev7不変、新規指摘なし。Cypress回避変数なしでnpm ci成功。ユーザー依頼により本書を含むP4c/P4d保存コミットへ保存。元環境未統合。

P4eは[React Router 7移行](archive/dependency-runtime/2026-10-30-frontend-router-v7.md)を承認後に実装。7.18.5と必須の型互換1行へ限定し、既存204件・lint/build・合成API画面確認・最終Reviewer確認完了（問題なし）。監査26→24/omit-dev7→5、Routerの残存2advisory解消・新規指摘なし。ユーザー依頼により本書を含むP4e保存コミットへ保存。元環境未統合。

P4fは[MSW更新計画・結果](archive/dependency-runtime/2026-10-30-frontend-msw-update.md)を承認後に実装。MSW3.0.3とテスト1ファイルのAPI互換修正へ限定。npm ci・既存204件・lint/build成功。監査24→21/omit-dev5維持、新規指摘なし。最終Reviewer確認完了（問題なし）。ユーザー依頼により本書を含むP4f保存コミットへ保存。元環境未統合。

P4gは[未使用テスト関連直接依存の整理](archive/dependency-runtime/2026-10-30-frontend-unused-test-dependencies.md)を承認後に実装。6つの直接指定を削除し、追加承認したVitest describe import 2行を補完。npm ci・全204件・lint/型検査/build・coverage・Storybook/UI確認済み。監査21→15/omit-dev5維持、新規advisoryなし。最終Reviewer確認完了（今回の承認範囲は問題なし）。ユーザー依頼により本書を含むP4g保存コミットへ保存。元環境未統合。

P4hは[MSW/Vitest peer整合](archive/dependency-runtime/2026-10-30-frontend-msw-vitest-peer.md)のA案をユーザー承認後に適用。Vitest4.1.12を維持しMSW2.15.0へ調整、テストimport1行を変更。実npm ciとnpm ls --all exit0、全204件・coverage・lint/型検査/build・Storybook/UI成功。監査15/omit-dev5維持、新規advisoryなし。最終Reviewer確認完了（問題なし）。ユーザー依頼により本書を含むP4h保存コミットへ保存。元環境未統合。

P4i-1は[ESLint・Babel・CSS計画と結果](archive/dependency-runtime/2026-10-30-frontend-eslint-babel-css.md)の第1段階Aのみユーザー承認後に適用。manifest不変のlock更新、通常npm ci/実tree、全204件・coverage・lint/型検査/build・Storybook/UI・PC/SPと合成API操作を確認。本番全6assetは基点とhash一致。監査15→6/omit-dev5→0。最終Reviewer確認完了（問題なし・必須指摘なし）。ユーザー依頼により本書を含むP4i-1保存コミットへ保存。元環境未統合。ESLint10移行の[第2段階具体案](archive/dependency-runtime/2026-10-30-frontend-eslint10-migration.md)は設計・Reviewer確認完了（問題なし）。2026-10-31にユーザーが6配列の直接文字列union化を承認し、ESLint10移行と併せて実装・全204件/coverage/lint/build/画面検証済み。最終Reviewer確認完了（問題なし）・ユーザー依頼により本書を含むP4i-2保存コミットへ保存。新しい監査情報の同時点比較は旧18→新14（high6→0、omit-dev0）で、moderate14件の追加対応は未決。P4全体は未完了。

P4jは[残存moderate advisory調査](2026-11-02-frontend-moderate-advisories.md)を実施。2026-11-02の基点・通常更新候補ともmoderate14/omit-dev0。修正版minimatch11/glob14を上位安定版の依存指定がまだ許容せず、現時点の通常更新による解消経路は確認できなかった。ESLint10.14.0だけの更新候補は指摘が減らないため未適用。Reviewer問題なし。実依存の変更は提案せず上位対応待ちを推奨し、部分改善も再評価する。指摘は未解決・P4未完了、調査文書はユーザーの統合依頼に伴い本書を含むコミットへ保存。

- 継続利用するworktree: `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。追加のworktreeは作成しない。
- 現在のbranch: `codex/frontend-build-update`（P4b/P4c/P4d-1保存済み、P4e/P4fも各計画を含む保存コミットへ保存）。P4a保存`a3c14326`から同じ作業worktreeで`git switch -c`により作成・切替。P4aのbranchは`codex/frontend-dependency-security`、P3時は`codex/node-lts-update`。
- P1〜P3は元checkout/元Composeへa5648642まで統合・実起動確認済み。統合結果文書は元側で未コミットとして保持。本P4作業へ無断で移動・保存しない。本番反映は未実施。

| 段階 | 実装・検証 | コミット・保存 | 結果・根拠 |
| --- | --- | --- | --- |
| P0: Laravel/PHP統合・作業基点 | 完了。元環境確認、旧worktree処理、次期worktree準備済み | `8aed4bd34012ba2979be311d60d0943b83f82899` | [元環境への統合結果](archive/laravel-php/2026-10-22-laravel-php-integration-result.md)。末尾の旧worktree処理待ちは当時の記録で、現在は削除・次期作業先準備済み |
| P1: AWS SDK / JMESPath | 完了。SDK3.401.3/JMESPath2.9.1、必須symfony/filesystem8.1.9追加。backend170成功・既存skip1・440 assertions | `8b8dc1157e008e103133ef04bffc7db6e5a940ea` | [P1計画・結果](archive/dependency-runtime/2026-10-22-backend-sdk-security.md)。対象3 advisories解消、Reviewer問題なし |
| P2: JWT 7系 | 完了。JWT7.2.1、旧token互換、実登録/worker/ローカルSMTP/login、backend172成功・既存skip1・446 assertions | `codex/backend-jwt-security`先端（本書を含むP2完了コミット） | [P2計画・結果](archive/dependency-runtime/2026-10-29-backend-jwt-security.md)。JWT指摘解消、Reviewer問題なし |
| P3: Node LTS・導入経路 | **実装・検証・Reviewer確認完了** | `a5648642` | [P3計画・結果](archive/dependency-runtime/2026-10-29-node-lts-update.md)。Node24.22.1/npm11.19.1、npm ci/再導入・全frontend204・build/lint・Storybook/coverage/UI・backend172成功 |
| P4: frontend依存 | **P4a保存済み。P4b実装・検証完了、最終Reviewer確認完了（必須指摘なし）。P4c/P4d-1も実装・検証・Reviewer確認と保存完了。P4eも実装・検証・Reviewer確認と保存完了。P4fも実装・検証・最終Reviewer確認と保存完了。P4gも実装・検証・最終Reviewer確認と保存完了。P4hも実装・検証・最終Reviewer確認と保存完了。P4全体は未完了** | `a3c14326`（P4a）、`e3deec3a`（P4b）、`49069b16`（P4c/P4d）、`7510e7c8`（P4e）、`a2f865d7`（P4f）、`05338cbc`（P4g）、本書を含むP4h保存コミット | [P4a計画・結果](archive/dependency-runtime/2026-10-29-frontend-dependency-security.md)。Axios/Lodash/PostCSSを先行し、各小段階で承認・検証 |
| P5: MySQL8.4 LTS | 未着手 | 未作成 | Node/frontend更新と分離して対応 |
| P6: 最終統合・公開準備 | 未着手 | 未作成 | 全段階の再構築・回帰・残課題確認。本番公開承認を含まない |

### 当時の次の作業

1. [P4a具体案](archive/dependency-runtime/2026-10-29-frontend-dependency-security.md)は同条件監査・設計レビュー済み。対象版/間接依存/検証をユーザー承認済み。
2. P4aは全frontend204件・lint/build・coverage/UI・Storybook・合成APIの実通信を確認済み。最終Reviewerも必須指摘なし。ユーザーの保存依頼により本書を含むP4a完了コミットへ保存。P4bは[Vite/Vitest/Storybook計画・結果](archive/dependency-runtime/2026-10-29-frontend-build-update.md)を承認後に実装・検証済み。Vite7.3.7/Vitest4.1.12組/Storybook10.6.5組、全依存72→33・critical7→0、全204件・build/lint・coverage/UI・HMR・実通信を確認。最終Reviewer確認完了（必須指摘なし）。ユーザーの依頼により本書を含むP4b完了コミットへ保存。P4d-1でCypress削除後は26 packagesが残る。P4eでRouter7.18.5へ移行後は24 packagesが残る。P4fでMSW3.0.3へ移行後は21 packagesが残る。P4gでテスト関連6直接指定を整理後は15 packagesが残る。P4hでMSW/Vitest optional peer整合を解消。ESLint/Babel/CSS調査後、第1段階の互換範囲内更新を実装・検証し監査6件。本結果確認後に第2段階ESLint10移行の実施可否をユーザーが判断する。Storybook7維持では保守中Viteへ移れないため、ユーザーがStorybookも更新する案の調査を選択。その後go aheadで具体版・実装を承認済み。

### 当時の残課題

- P4fからのMSW/Vitest optional peer不整合はP4hで解消。ユーザー承認に基づきMSW2.15.0/Vitest4.1.12へ揃え、実npm ls --allがexit0となった。詳細は[P4h検証結果](archive/dependency-runtime/2026-10-30-frontend-msw-vitest-peer.md#承認後の実装検証結果)。P4i-1適用後の監査は6件（TypeScript ESLint6固定経路）、omit-dev0。

- **Composer監査は0ではない。** P2時点の同時監査は更新前JWT low+Symfony Mime mediumの2件→更新後Mime mediumのみ1件。`symfony/mime v7.4.19` / `PKSA-wtxr-p26d-nn42` / `CVE-2026-45070`が残る。更新前後でpackage/ref・advisoryは同一で、JWT更新による追加ではない。配信された修正範囲と公式GHSAの記載差を別途照合し、対応する段階・具体版は未決。公開判断までに対応案を提示し承認を得る。P2へ無断追加せず、監査ignoreもしない。[P2の残存監査記録](archive/dependency-runtime/2026-10-29-backend-jwt-security.md#残存監査p2対象外)
- P1はユーザー指定により、依存更新と既存backendテストまでに限定。新規テスト・SES補足・SDK/JMESPath smokeは実施していない。この限定はP1のもの。[P1承認範囲](archive/dependency-runtime/2026-10-22-backend-sdk-security.md)
- JWTの開発用鍵は最低長のみ確認済みで、実鍵/APP_KEYは変更していない。本番鍵の適合性・生成強度・本番queue切替、外部SMTP/S3、本番公開は未確認・未実施。
- P3のNode24.22.1は承認済み暫定版。latest24.22.2の対応Alpine image取得は未確認。P4aでAxios/Lodash/PostCSSを更新・検証済み（コミット保存済み・元環境未統合）。全依存監査79→72 packages（critical7/high26/moderate29/low10）、omit-dev19→12。P4bでも同条件72→33（critical0/high14/moderate10/low9）、omit-dev12→9へ改善。その後P4c/P4d-1/P4eで24 packages、P4fで21 packages、P4gで15 packagesまで改善。残存は次の小段階で具体案を提示。MySQL8.4移行は未着手。

実装・検証の完了時、コミット時、branch切り替え時には、本節・版情報・Tasksを対応する実績に合わせて更新する。過去時点の結果は日付を付けて残し、現在の状態と区別する。


### 当時の版情報・更新候補（2026-10-29）

値は現在の作業worktreeのlock/設定を示す。P1〜P3は元環境にも統合済み。P4aは作業worktreeだけで実装・検証し、元環境には未統合。

| 対象 | 計画開始時 | 現worktree | 状態・残る方針 |
| --- | --- | --- | --- |
| aws/aws-sdk-php | 3.336.2 | **3.401.3** | P1完了・コミット済み |
| mtdowling/jmespath.php | 2.8.0 | **2.9.1** | P1完了・コミット済み。間接依存を維持 |
| symfony/filesystem | 未導入 | **8.1.9** | P1でSDKの必須間接依存として追加 |
| firebase/php-jwt | 6.10.2 | **7.2.1** | P2完了・コミット保存済み |
| symfony/mime | 7.4.19 | **7.4.19（未変更）** | P2で残存medium指摘を把握。情報源照合・対応段階/版は別途決定 |
| frontend Node | Docker21.6.1 | **24.22.1 / npm11.19.1** | P3実装・検証・保存済み。承認済み暫定版をdigest固定 |
| PHP image内Node | 16.13.2 | **削除済み** | P3で現行経路に不要と確認。PHP/Composer/FPM/全backendの回帰成功 |
| frontend主要依存 | Axios1.13.4、Lodash4.17.23、PostCSS8.5.6、Vite4.5.14、Vitest1.6.1、Tailwind3.4.19、React Router DOM6.30.3、uuid9.0.1 | **Axios1.20.0、Lodash4.18.1、PostCSS8.5.32、Vite7.3.7、Vitest4.1.12、Storybook10.6.5**。Tailwindは維持。P4c/P4dで未使用uuid/Cypress削除、P4eでRouter7.18.5、P4fでMSW3.0.3へ移行。P4gでテスト関連6直接指定を整理。P4hでMSW2.15.0/Vitest4.1.12へ整合 | P4a保存済み。P4b〜P4eは実装・検証・保存済み。P4f/P4gも実装・検証・最終Reviewer確認と保存完了。P4hも実装・検証・最終Reviewer確認と保存完了。残存対象は次の小段階で対応 |
| MySQL | 8.0.21 | 8.0.21 | P5未着手。8.4 LTSを初期候補とし、具体版/digest・更新経路を実行前に決定 |

未着手段階の候補は確定版ではない。実行前に公式情報・監査・依存解決dry-runから具体的な版と変更対象を提示し、承認を得る。PHP8.5.12とLaravel13.38.0は維持しており、追加更新が必要なら理由と最小案を別途提示する。
