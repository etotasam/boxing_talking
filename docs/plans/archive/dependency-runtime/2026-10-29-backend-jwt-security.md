# P2 JWT 7系への更新

> 履歴文書（2026-10-29作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## Goal

firebase/php-jwtを6.10.2から7.2.1へ更新し、P1後に残る監査1件を解消する。登録メールのHS256署名・30分期限・既存API/エラー・仮登録/job状態を維持する。ユーザーはJWTの必要性調査の結果を受け、専用branchで問題がなければP2を進めることを承認済み。鍵の変更・リンク失効が必要な場合は停止し、追加承認を求める。

## Background / Context

- 作成日: 2026-10-29 JST。
- worktree: `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。
- branch: `codex/backend-jwt-security`。基点: P1完了`8b8dc1157e008e103133ef04bffc7db6e5a940ea`。開始時clean。
- [全体計画](../../2026-10-22-dependency-runtime-update.md)のP2に従う。P1での「新規テスト・SES補足なし」はP1の範囲限定であり、P2では既存テストの鍵修正とJWT移行に必要な確認を行う。
- 公式latestは7.2.1、PHP要件^8.0。PHP8.5.12/Laravel13.38.0/Composer2.9.4は維持。隔離コピーでroot制約を^7.2とし、7.2.1指定のdry-runではJWT1件更新、追加/削除なし。
- JWTの現行脆弱性はGHSA-2x45-7fc3-mxwq / CVE-2025-45769、low。短いHMAC鍵を拒否しない問題で、7.0.0以降が修正版。
- MailSendJobがHS256でuser_id/expを署名し、UserServiceがHS256を固定して検証する。ログイン自体はAuth::attemptでありJWTログインへの変更はしない。
- worktreeにはenv/vendor/JWT鍵/設定cacheなし。元の開発用JWT鍵ファイルだけを読取専用・network none Dockerで読み、値・hash・tokenを出さず、1704 bytesで>=32 bytesを満たすことだけ確認済み。生成時のエントロピーは未確認であり、鍵長確認だけで保証しない。本番鍵・本番envは未参照。
- 元Compose全4サービスは作業開始時に停止済み。起動・再build・設定変更・データ操作はしない。

## Scope

### In Scope

- composer.jsonのJWT制約のみ`^6.8`→`^7.2`、lockのJWTのみ7.2.1へ部分更新。
- UserCreateTestの不正署名用鍵とMailSendJobTestの短い合成鍵を32 bytes以上の合成値へ変更。不正署名用鍵は正しい鍵と別にする。
- 不足している改ざん/不正形式のHTTP拒否を既存UserCreateTest内で確認し、メール正常/期限30分/送信失敗時状態と既存全backend回帰を維持する。
- 6.10.2発行の合成有効tokenを7.2.1で受理する互換確認。新旧で同じ十分長い合成鍵を使い、実鍵/APP_KEYは変更しない。
- 隔離ブラウザ仮登録→実database worker→専用ローカルSMTP→受信リンク→本登録→loginを確認する。
- READMEの鍵長要件・未確認の本番運用条件、本計画の進捗/結果、非秘密証跡。

### Out of Scope

- JWT鍵/APP_KEYの更新、強度確認なしの鍵水増し、鍵検証の無効化、実鍵のコピー・ログ/commitへの混入。
- アプリ/API/guard/HTTP/エラーコード/登録期限の仕様変更、frontend変更、P3以降、外部AWS/SMTP/S3、既存DB/default queueへの操作、元環境起動、commit/push/deploy。
- Composer全更新、監査ignore、vendor手編集、新しい環境変数の導入。

## Impact Area

| 対象 | 変更/確認 |
| --- | --- |
| backend/composer.json / composer.lock | JWT制約/版のみ。他120 packagesとsource/dist refを維持 |
| backend/tests/Feature/AuthController/UserCreateTest.php | 合成不正鍵の有効長化、改ざん/不正形式で400・本登録なし・仮登録保持を確認 |
| backend/tests/Unit/MailSendJobTest.php | 合成鍵の有効長化。SMTP失敗テストが鍵長例外にすり替わらないこと |
| backend/README.md / 本計画 | 鍵要件・運用未確認・結果 |
| app/config/routes/DB/frontend/Docker管理ファイル | 変更予定なし。検証用構成・合成DBは一時領域のみ |

## Options

| 案 | 利点 | 欠点/リスク |
| --- | --- | --- |
| 6系維持し強い鍵で運用 | 主更新を避ける | 監査指摘が残る。弱鍵設定の防止をアプリ側だけに依存 |
| 7.0.0へ最小主更新 | 監査修正と鍵長検証を導入 | 後続7系の修正が入らない |
| 7.2.1へ部分更新（採用） | 照会時の安定版の修正を含み、dry-runはJWT1件更新だけ | 鍵長/claim検証で短いfixtureや不正入力が従来より早く拒否される |

## Decision

7.2.1へ部分更新。既存の開発用鍵は変更せず、短いテスト鍵だけを十分長い合成値へ直す。アプリコードの変更なしを第一案とする。6系tokenは、同じ十分強い鍵・HS256・数値expで有効期限内なら受理する方針。鍵変更や既存リンクの失効が必要なことが分かった場合は停止する。

## Rationale

ユーザーは監査解消に向けた更新を承認済み。開発用鍵の最低長が満たされ、依存差分も限定できるため、既存動作と旧token互換を保つことを検証しながら更新する。本番鍵の強度・本番メール/queue運用の確認は別途必要であり、ローカル検証で本番適合とは判定しない。

## Tasks

- [x] branch/HEAD/clean、規約、利用箇所、公式情報、開発用鍵の最低長とdry-runを確認。
- [x] Reviewer subagentが具体計画を確認し必須指摘なし。承認済みP2の範囲で実装。
- [x] 新旧JWTの隔離依存を用意し、旧token互換を合成鍵で確認。6→7と7→6の両方向で成功、7系の短い鍵拒否も確認。
- [x] manifest/lock/既存テスト鍵と必要最小のJWT拒否ケース/READMEを更新し、隔離検証後にworktreeへ反映。
- [x] Composer validate/platform/install整合/全監査、全backend、旧token/短い鍵拒否を確認。172成功・既存1skip・446 assertions。監査はJWT解消、同時点の既存Mime1件のみ残存。
- [x] 隔離実ブラウザ登録/実worker/ローカルSMTP/本登録/loginと再読込後のsession保持を確認。最終user1/pre0/jobs0/failed0。
- [x] 実装後Reviewerは問題なし。最後の全backendは172成功・既存1skip・446 assertions。非秘密証跡保存と結果報告で今回を終了し、コミット/P3は行わない。

## Test Plan

メインがplanner/worker/tester/backend-testに従って調査・実装・実行し、Reviewerだけsubagentを使用する。既存テストの振る舞いを保ち、不足ケースは既存テストファイル内へ必要最小限を補う。

1. Composer: JWTのみ7.2.1、他120 packageの全オブジェクトとsource/dist不変、121件維持。validate --strict、check-platform-reqs、通常install/scripts、install --dry-run、installed/lock一致。監査はJWT指摘の解消と、新規悪化なしを確認する。開始時の再監査ではJWT lowに加え、P1時点の監査記録にはなかった既存symfony/mimeのmediumも検出した。同時点のbefore/after監査ではJWT+Mimeの2件→Mimeだけ1件となり、Mime packageとadvisoryは前後完全同一。対象外のMimeは無断更新せず残課題として記録する。監査全成功とは扱わない。
2. 既存backend: 専用Compose `-p boxing-p2-20261029 -f /private/tmp/boxing-p2-20261029/compose.yml exec -T php php artisan test`。PHP8.5.12 image、network none、合成APP_KEY/JWT鍵、`DB_CONNECTION=testing`/`DB_TEST_DATABASE=:memory:`、DATABASE_URL未設定、array cache/session/mail、sync queueで固定。開始前に実効値を照合。frontendは同worktreeのソースコピーをread-only参照して追加skipを避ける。空の検証専用.envは新規作成し、元env/鍵/storage/cache/DBを持ち込まない。
3. 基準171識別子=170成功/既存1skip/440 assertionsと比較し、改ざん/不正形式確認の増分を説明する。既存正常・期限切れ・有効長の別鍵による不正署名・30分期限・Mail送信例外時の対象pre_userのみ削除/他保持/job failを保証する。
4. 旧token互換: 6.10.2の隔離vendorで現在時刻基準の30分tokenを発行し、7.2.1で同じ合成鍵・HS256を用いてdecodeする。逆方向も確認可能なら確認。tokenを鍵変更で無効化しない。合成値だけを使い、実鍵/実tokenはログへ出さない。
5. 7系で32 bytes未満の合成鍵がencode/decodeで拒否されることを隔離確認する。これは設定境界の確認であり、本番鍵の値・生成元を参照しない。
6. 実登録: 元環境から分離した専用SQLiteファイル・合成.env/APP_KEY/JWT鍵・専用storage・database queueを使う。アプリ/ローカルSMTPは外向き通信できない専用Docker internal networkに置き、HTTPはloopback限定の別portを使う。元default queueは一切巡回しない。SMTP起動/応答を確認後、ブラウザで合成宛先の仮登録、専用queueの実worker、受信HTML内の本人リンクから本登録、同じ合成利用者でloginを確認。user/pre_user/jobs/failedの最終状態まで比較する。
7. ブラウザ用frontendはworktreeのソースコピーから現行Node/依存で起動またはbuild。共有依存を使う場合はread-only mountとし、元node_modulesやソースを変更しない。frontendの依存更新やNode変更はしない。構成・メモリ/起動上の問題で必須検証ができない場合、未完了として理由を報告し勝手に完了扱いしない。
8. テストと元環境が分離されていること、必要な警告の差異、lock差分とReviewer評価を記録。非秘密ログ・監査・JUnit/結果JSON・ブラウザ証跡をworktreeのGit除外backupへ保存。元env/SQL/storage/秘密鍵は保存しない。

## Risks

- 鍵の長さは十分でも生成エントロピー/本番設定は未確認。元の開発用鍵の長さ確認を本番安全性の証明にしない。
- 短い鍵では7系が署名/検証を拒否し、登録メール/既存リンクへ影響する。本番の鍵適合確認、既存queue・切替時点の扱いは本番反映前に別途確認が必要。
- 7系のclaim検証で非数値iat/nbf/expも拒否される。現アプリは数値expを発行している。既存APIの400/401等が維持されることを確認する。
- 設定不備・必須テスト失敗・既存skip以外の検出脱落・予定外依存・監査悪化・Reviewer重大指摘があれば停止する。
- 復旧基点はP1完了commit、旧manifest/lock。元DBへ変更しないため検証失敗時の元DB復元は不要。ユーザーの無関係な差分を破棄しない。

## References

- [JWT advisory](https://github.com/advisories/GHSA-2x45-7fc3-mxwq)
- [JWT 7.0.0鍵長検証](https://github.com/googleapis/php-jwt/releases/tag/v7.0.0)
- [JWT 7.2.1 release](https://github.com/googleapis/php-jwt/releases/tag/v7.2.1)
- [JWT HMAC minimum key length](https://www.rfc-editor.org/rfc/rfc7518.html#section-3.2)

## Review / Result

2026-10-29、具体計画のReviewer評価は「問題なし、必須修正なし」。P2実装差分と最終結果は確認後に追記する。

監査補足: 実更新時の最新監査でsymfony/mimeのPKSA-wtxr-p26d-nn42 / CVE-2026-45070 / mediumを検出。同時点の更新前lockにも存在し、JWT更新による追加ではない。Composer配信範囲と公式GitHub advisory記載範囲に差があるため、別作業で照合・対応する未解決事項として残す。監査ignoreや勝手なSymfony更新はしない。


## Execution Result (2026-10-29)

以下は実装・検証完了時（コミット前）の記録。追加承認による保存と次期branch準備の結果は末尾に記載する。

- branchは`codex/backend-jwt-security`、基点P1完了commitを維持。commit/P3には進まない。
- JWT `v6.10.2 → v7.2.1`、root制約`^6.8 → ^7.2`。121 packagesのまま、JWT以外120 packagesの全オブジェクトとsource/dist referenceは不変。通常install/scripts、validate --strict、platform、install dry-run成功。installed/lockの全121件の版/source/dist一致。
- 既存2テストファイルの短い合成鍵を有効長へ修正し、既存UserCreateTestへ改ざん/不正形式のHTTP400・仮登録保持・本登録なしの2ケースを追加。アプリ/API/config/routes/frontend/Docker管理ファイルは未変更。
- 初回全backendは173識別子=172成功/既存skip1/446 assertions、失敗/エラー0。P1比+2ケース/+6 assertionsで既存ケース脱落なし。実装後Reviewer評価は「問題なし、必須修正なし」。レビュー後の最後の全件テストも同じ172成功/既存1skip/446 assertions、失敗/エラー0で成功。
- 6系発行の有効な30分tokenを7系で受理し、payload/期限を維持。同じ十分長い合成鍵で7系tokenの6系受理も成功。7系は短い合成鍵のencode/decodeを両方拒否。実鍵や実tokenは互換試験に使用していない。
- 同時点の監査は、更新前JWT low+Mime mediumの2件→更新後Mime mediumのみ1件。JWT指摘は解消したが、Composer auditは全成功ではなくexit1。Mimeは無変更packageで、advisory内容も前後一致し更新による監査悪化なし。ignoreは追加しない。
- ブラウザ確認用frontendは現行Node imageと既存node_modulesのread-only mountからbuild。初回は検証用Node heap約384MBの上限不足でexit134。Docker全体約4GBの範囲内で検証用buildだけheap1024MB/コンテナ1536MBへ変更し再実行成功。既存Browserslist/chunk size通知は残る。Node・frontend依存・元node_modulesは未変更。
- 実ブラウザで合成利用者の仮登録→専用SQLiteのdatabase queueに本人MailSendJob 1件のみであることを確認→実worker1回→ローカルSMTP受信1通→受信HTMLの本人リンク→本登録→同じ利用者でlogin→reload後のユーザー表示を確認。subject/名前/リンクoriginも一致。最終専用DBはusers1/pre_users0/jobs0/failed_jobs0。
- アプリ/SMTP/frontendは専用internal networkで外向き接続を遮断。Docker internal networkの直接port公開が機能しないため、一時的な固定Nginx gatewayだけをdefault/internalの両networkに接続し、HTTPの3portを127.0.0.1へ限定公開した。gatewayは固定upstreamへのproxyだけでありforward proxyではない。今回の作業では元4サービスを起動・停止していない。開始時は停止していたが、最終確認では稼働を確認した。
- 元開発用JWT鍵は32 bytes以上の確認だけで変更/コピーなし。本番鍵/本番env・生成エントロピー・本番queue切替は未確認。本番反映前の別確認事項として残す。

### 残存監査（P2対象外）

`PKSA-wtxr-p26d-nn42` / `CVE-2026-45070` / `symfony/mime` / medium。P1記録では未検出だったが、今回の最新before/after両方で検出し、package/ref・advisoryは同一。Composer配信の修正範囲と[公式GHSA](https://github.com/symfony/symfony/security/advisories/GHSA-vqc8-7275-q272)の記載に差があるため、監査JSONを保存し、情報源照合と必要な修正版の具体案を別作業で扱う。P2で無断更新・監査除外は行わない。


### 証跡と終了状態

非秘密の監査before/after・依存差分・Composerログ・全テスト/JUnit/識別子比較・合成token互換結果・worker/SMTP/DB状態JSON・frontend build・ブラウザ画像は、このworktreeのGit除外`docker/db/backup/backend-jwt-security-20261029/`へ保存する。実鍵/本番env/元DBやSQL、合成鍵・tokenファイル・queue payload・メール原文は保存対象に含めない。ブラウザ画像は合成利用者の結果画面だけを保存する。

検証専用Compose projectのコンテナ/networkは終了・削除済み。元4サービスは開始時停止、最終確認では稼働していた。今回の操作では元サービスの起動・停止・設定/データ変更を行っていない。Git差分はJWTのcomposer.json/lock、既存テスト2ファイル、README、本計画の6ファイル。P1コミットを基点に未コミットで保持し、P3には着手しない。


## 追加承認による保存と次期branch準備（2026-10-29）

- ユーザーがP2のコミット、全体計画更新、次期作業branch作成・切替を承認。
- 保存先は`codex/backend-jwt-security`のP2完了コミット（本書と全体計画の進捗更新を含む）。メッセージ: `fix(backend): JWTを7系へ更新して既知脆弱性に対応`。
- 保存後、同worktreeで`git switch -c codex/node-lts-update`によりP3用branchを作成して切り替える。全体計画はP2完了チェック、P3作業branch準備済みへ更新。
- P3の調査・実装は未着手。元checkoutへのP1/P2統合、push・本番反映は行わない。
