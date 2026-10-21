# S6: Laravel 12→13 実行提案

## Goal

Laravel 12.70.1から13の安定版へ更新し、PHP 8.3系で認証・送信元検証・保存データ・既存業務動作を検証する。依存・コード・DBの変更は本計画へのユーザー承認後。S7以降は開始しない。

## Background / Context

2026-10-22 JST確認。

- 対象worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。
- branch: `codex/laravel-php-s4-s5`、HEAD: `c1dae83ee5c30f9da637acd9d15becfed160210c`。
- 調査開始時の未コミット差分は `docs/plans/2026-10-22-laravel-php-s6-handoff.md` の新規ファイルのみ。
- Docker実版: Laravel12.70.1 / PHP8.3.35 / Composer2.9.4。Sanctum4.3.3とCollision8.9.5のlock制約はLaravel13/PHPUnit12を許容する。
- S5基準（過去の検証結果）: backend103識別子=102成功/既存1skip/320assertions、frontend52ファイル204成功、MySQL追加回帰5件41assertions。今回まだ再実行していない。
- 再監査: 4件/3packages、Laravel0件。aws/aws-sdk-php 2件、firebase/php-jwt 1件、mtdowling/jmespath.php 1件。監査終了コード1はこの既知残件による。
- PHP公式8.3.36には重大2件（CVE-2026-109618/109619）の修正掲載あり。ただし今回も公式 `php:8.3.36-fpm-trixie` のmanifestはnot found。既存8.3.35では未修正。
- Composer配布版の追加照会はユーザーがコマンドを許可しなかったため未実行。Laravel13の確定版と実際の解決可否は承認後dry-runで確定する。

### 環境と復旧情報の再確認

- S5のphp/fpm/nginx/dbコンテナは稼働中。S4/S3等の旧DBも保持されている。
- S5のHTTP18081/18082、frontend13002、SMTP11033、受信HTML preview11034の既存経路を確認。frontend/SMTP/previewはloopback待受。
- S5 DBに35migration、users10、boxing_matches2、jobs0、failed_jobs0を読み取り確認。fresh/rollback専用DBも存在する。
- `/private/tmp/boxing-upgrade-s5/compose.yml`、`laravel11-before.sql`（28,303 bytes）、`laravel12-verified.sql`（28,818 bytes）は存在する。内容の復元成功や永続保存を今回保証したものではない。
- PHPイメージ `boxing-talking-php:s3-8.3.35` は稼働サービスで使用中。
- `/private/tmp/boxing-upgrade-s6` は未作成。mkcertはPATH上に見つからず、opensslは存在する。

## Scope

### In Scope

- framework13、Tinker3、PHPUnit12、PHP要件^8.3と必須周辺依存の部分更新。
- 承認されたCSRF方針の適用、隔離HTTPS経路での実HTTP/ブラウザ検証。
- セッション・キャッシュ・キューの更新前データ互換性、PHPUnit検出維持、MySQL fresh/引継ぎ検証。
- 計画、結果、復旧手順、必要なREADMEの更新。

### Out of Scope

- PHP8.4/8.5（S7以降）、本番反映、外部公開、外部SMTP/S3、本番データ・秘密情報の参照。
- 無関係な依存一括更新、既存監査残件の独立修正、Node/MySQL/フロント主更新、Kernel/Providerのひな型置換。
- 既存コメント重複表示の修正、未提供の削除UI追加、認証方式やAPI契約の追加変更。

## Impact Area

| 対象 | 内容 |
| --- | --- |
| backend/composer.json / composer.lock | framework、Tinker、PHPUnit、PHP下限と必須依存 |
| backend/app/Http/Middleware/VerifyCsrfToken.php | 新PreventRequestForgeryの継承、承認方針の実装 |
| backend/app/Http/Kernel.php / config/sanctum.php | webとSanctum stateful経路の同一方針適用、名称変更する場合の参照整合 |
| backend/config/session.php / cache.php / database.php | 既存名・接頭辞維持、serializationと保存内容照合。必要部分のみ変更 |
| backend/tests / phpunit.xml | 検出比較、CSRF・保存互換性の振る舞いテスト、12系必須修正 |
| 一時Compose/Nginx/証明書/検証スクリプト | `/private/tmp/boxing-upgrade-s6`、Git対象外 |
| README / docs/plans | 新設定値・導入手順がある場合の説明、検証結果 |

## Options

### 作業場所

| 案 | 利点 | 注意点 |
| --- | --- | --- |
| A: 既存worktreeを再利用しS6専用ブランチ作成（推奨） | 引き継ぎ文書と既存作業場所を保ち、追加checkoutを減らす | S5サービスが同じbackendをbind mountしているため更新前の停止と実行データ分離が必要 |
| B: c1dae83eから別worktree作成 | S5コード/実行環境を並行保持しやすい | 新しい場所の登録、設定、依存構築、引き継ぎ文書コピーが必要 |

Aでは承認後に既存worktree内で `codex/laravel-php-s6` をc1dae83eから作成する。S5ブランチの参照と主checkoutは動かさない。引き継ぎ文書と本計画を保護し、ブランチ名衝突・既存差分があれば先に報告する。

### CSRF / 送信元検証（明示承認事項）

| 案 | 動作 | 評価 |
| --- | --- | --- |
| A: Laravel13標準（推奨） | Sec-Fetch-Site=same-originならトークン省略。他はトークン検証へfallback | 標準仕様へ追従できる。S5の「欠落/不正は常に419」から一部の期待値が変わる |
| B: 現行トークン必須を維持 | AppミドルウェアでhasValidOriginをfalseにし更新時のトークン検証を必須化 | 従来契約を維持できるが独自方針を継続管理する必要がある |

AではoriginOnlyとallowSameSiteの拡張を有効にしない。独自Kernel/Provider構成のままAppミドルウェアの親を新PreventRequestForgeryへ移す。名称を変更する場合もwebとSanctumのvalidate_csrf_token両参照を揃える。廃止予定aliasに依存して見かけ上更新済みとしない。

### PHPパッチと監査残件

S6の切り分けのためPHP8.3.35を維持し、既知の重大2件を残した合成データ・隔離検証の継続を承認項目とする。修正版PHPの取得後に別のパッチ更新・再検証を提案する。修正版を先に適用する選択も可能だが、配布確認と別基準検証が必要なためS6開始を保留する。監査4件は比較記録を継続し、無断で更新対象や例外を増やさない。

## Decision

2026-10-22にユーザーが「S6 を開始してくれ」と実装承認。採用は既存worktree+専用S6ブランチ、Laravel13標準CSRF、PHP8.3.35固定の隔離検証。別役割subagentは使わずメインが調査・設計・承認後の実装/テストを担当する。ReviewerのみAGENTS.mdに従いsubagentで設計と最終差分を確認する。

## Rationale

LaravelとPHPの主更新を分離し、依存解決・送信元検証・データ互換性それぞれの原因を追跡できる。標準CSRF採用による契約変更を事前承認し、HTTPテストだけでHTTPS機能を確認したと扱わない。

## Tasks

- [x] 指定worktreeの指示・引き継ぎ・全体計画・S5結果を読み、Git/実版/稼働/DB/dump/監査を確認する。
- [x] Reviewerの設計評価を反映し、ユーザーの作業場所・CSRF・PHP残課題を含む実装承認を得る。
- [x] 承認後にS6ブランチを作成し、S5コード/lock/image/dumpの対応と復元を確認する。
- [x] S5のphp/fpm/nginx/frontend/実workerを停止する。DB・SMTP・dumpは保持し、既存DBを初期化しない。
- [x] S6専用Compose project/DBを用意する。S6のvendor/storage/bootstrap-cacheは専用volume又は一時作業コピーに分離し、S5の保存データを上書きしない。
- [x] S5コード/lockでS6隔離環境を起動し、更新前のテスト検出一覧・全基準・HTTPSセッション/キャッシュ/キューデータを保存する。
- [x] composer.jsonの必要制約を変更し、framework/tinker/phpunitの部分updateを `-W --minimal-changes --dry-run` で確認する。Sanctum/Collision等は互換の既存lockを維持し、衝突があれば理由と最小追加対象を提示する。
- [x] dry-runの実版・監査・変更パッケージを評価したうえで実update。Laravel監査0件、platform要件、install再現性を確認する。監査無効化、新規例外、ignore-platform-reqsは使わない。
- [x] CSRFと保存互換性の必要修正/テストを追加し、以下の検証を実施する。
- [x] Reviewer最終確認、関連テスト最終実行、結果・残課題・復旧情報を記録しS6で停止する。

### 隔離HTTPS経路

- 予定portはHTTPS18443/18444、HTTP/FPM18084、artisan18083、内部frontend13003。実行時に空きを再確認する。frontend13003はTLS終端からの上流として使い、same-site用ページをHTTPで直接開かない。
- NginxでTLSを終端しFastCGIでFPMへ送る。HTTPS側はHTTPS=on等を設定し、アプリのisSecure/URL生成を確認する。直接TLS→FPMなのでTrustProxiesの全信頼は追加しない。
- HTTP proxy経由へ構成変更が必要なら検証環境限定で信頼IP/必要headersを限定し、直接送信した偽装forwardedヘッダーを信頼しないことを確認する。
- localhost/127.0.0.1 SANを含む検証用CA証明書を用意し、可能なら検証専用ブラウザprofileだけに信頼を設定する。OS trust storeの変更や新規ツール導入が必要なら、その具体案を別途承認対象にする。
- 証明書警告のクリック迂回、ignoreHTTPSErrors、curl -kを使わない。CA検証付きHTTPクライアントとブラウザで確認し、信頼経路が用意できなければS6を保留する。
- 次のTLS listener/送信元URLを用意し、schemeful siteと実ヘッダーを確認する。全TLS listenerの証明書にlocalhostと127.0.0.1のSANを含める。

| 送信元ページ | 更新先API | 期待Sec-Fetch-Site | TLS listener |
| --- | --- | --- | --- |
| `https://localhost:18443/` | `https://localhost:18443/api/...` | same-origin | 18443でSPA/APIを提供 |
| `https://localhost:18444/` | `https://localhost:18443/api/...` | same-site | 18444で検証ページを提供 |
| `https://127.0.0.1:18444/` | `https://localhost:18443/api/...` | cross-site | 18444の別hostで検証ページを提供 |
| `http://localhost:18084/` | `https://localhost:18443/api/...` | cross-site（scheme差） | HTTP比較用、same-site証跡に使わない |

same-site用localhost:18444は検証用Sanctum stateful/CORS許可に含め、cross-site非stateful条件とは分ける。ブラウザではCookie抑止も別記録し、CSRFそのもののマトリクスはstateful更新経路の実HTTPでも補完する。
- APP_URL/FRONT_APP_URL/Sanctum stateful/CORS/session domain/secureは検証環境のみ整合させ、Secure/HttpOnly/SameSite属性も確認する。

### セッション/キャッシュ互換性

- 現アプリ設定はsession.cookie/cache.prefix/redis.prefixを明示済み。更新前後の実値を比較し、名前や接頭辞を新ひな型既定値へ変えない。
- session.serializationはphpを明示維持し、json化による全session失効を混在させない。JSON化は別途判断する。
- cache.serializable_classesの現行fallbackと実payloadを確認する。scalar/arrayだけならfalse、PHPobjectが必要なら必要classだけの許可リストを提示し、無制限trueを使わない。アプリに直接Cache使用が見つからなくても認証/throttle/依存の使用を確認する。
- 合成環境でAPP_KEY/APP_NAMEと同じHTTPS hostname・Cookie設定を保ち、Laravel12で作ったsession/cache/queueを13で読み書きする。HTTP→HTTPS切替によるCookie差を版の非互換と混同しない。
- 期限前後、ログイン維持、ID再生成、logout後無効化、キューworkerによる既存payload処理を確認。S5の稼働storageを共有して検証しない。

## Test Plan

### CSRFマトリクス

次表はCSRFが適用されるstateful更新経路の期待値で、通過はCSRF判定のみを意味する。認証・認可・validation・CORSによる最終応答は別に確認する。B案ならすべて正トークンのみ通過し、欠落/不正は419。

| 接続/実ヘッダー | A案: 正token | A案: 欠落/不正token |
| --- | --- | --- |
| HTTPS / same-origin | 通過 | 通過 |
| HTTPS / same-site | 通過 | 419 |
| HTTPS / cross-site | 通過 | 419 |
| HTTPS / none・ヘッダーなし | 通過 | 419 |
| HTTP / ヘッダーなし | 通過 | 419 |

公式docsはブラウザのsecure接続でのFetch Metadata送信を説明する一方、調査時13.xソースのhasValidOriginはSec-Fetch-Siteを直接評価しisSecure判定を持たない。HTTP上の人工same-originヘッダーやloopbackのブラウザ動作を「必ずfallback」と決めつけない。採用する安定tagのソースを固定し、HTTP/HTTPS双方で実ヘッダーと結果を記録する。差があれば原因を説明し、承認した仕様と矛盾する場合は停止して再提案する。

- GET/HEAD/OPTIONSとPOST/PUT/PATCH/DELETE、正/欠落/不正tokenを確認する。
- webとSanctum stateful APIの両経路で方針適用を確認する。PHPUnitの通常のCSRF省略を避けたテストと実HTTPを組み合わせる。
- SanctumのOrigin/Refererによるstateful判定、Fetch MetadataによるCSRF判定、ブラウザSameSiteによるCookie不送信、CORSのpreflight/読み取り拒否を分けて記録する。
- cross-site非stateful APIを一律419とはしない。匿名/通常/guest/adminの認証・権限とDBの無変更を確認し、Origin/Referer欠落・偽装や既存Bearer動作も照合する。
- ブラウザの自動Sec-Fetch-Siteと人工HTTPヘッダーの証跡を区別する。CORSエラーだけで更新拒否成功とは判定しない。

### 既存動作とデータ

- DockerのみでPHP/Composer/artisan/PHPUnitを実行。PHPUnit12で旧103識別子全残存を比較し、既存1skipの理由維持、追加分を分離する。警告/非推奨を一括抑制しない。
- backend全テスト、frontend Vitest全204基準と認証関連、PHP構文/Composer validate/check-platform-reqs/install dry-run、CLI/FPMの実要件・ini・ログ・scheduleを確認する。
- S6専用MySQL fresh DBの全35履歴、S5dump復元DBの引継ぎ履歴とNothing to migrate、型/NULL/default/index/FK/照合順序を比較する。適用済みmigrationを再実行しない。
- 既存MySQL回帰5件/41assertionsを維持し、token期限NULL/hash/abilities、日時/日次Tokyo境界を検証する。
- 通常/guest/adminのlogin/logout、権限、一覧/詳細、投稿/投票、管理削除/一般拒否を実HTTPとブラウザで確認。削除UI未提供はS5同様HTTP代替として明記する。
- 仮登録→database queue実worker→ローカルSMTP→受信リンク→本登録→新規loginを確認し、jobs/failed_jobs/仮登録データの最終状態を記録する。
- コメント一時重複表示は更新前後を比較して既存残課題と更新起因を区別する。新たなリグレッションなら完了判定を保留する。

### 復旧と完了条件

- 承認後、S5dumpをS6使い捨てDBへ実際に復元し、35履歴/合成データ/主要読み書きを確認してから更新する。ファイル存在だけを復旧可能の根拠にしない。
- 復旧はc1dae83eの別作業場所、同lockからDocker内install、同PHPイメージ、S5dumpを新しい専用DBへ復元する。必要なsession/cache/queueの更新前コピーも対応させる。
- git reset --hard、再帰的強制削除、既存DB/volume削除を使わない。無関係差分や引き継ぎ文書を保護する。
- 必須HTTPS/自動テスト/DB/ブラウザ/メール/互換性確認、Laravel監査0件、Reviewer重大指摘解決が完了条件。未達ならS6確認待ちとし、S7へ進まない。
- tmpfs/dumpは永続バックアップではない。秘密値、JWT、メール、dump、生成物をコミットしない。commit/pushは今回の実行承認に自動的に含めない。

## Risks

- PHP重大2件と依存監査4件は残る。S6完了は本番公開可能の判断ではない。
- 13.xブランチの資料と安定tagの差、依存解決、TLS用信頼設定は実行時のゲート。必要な追加変更は具体案を提示する。
- S5と同worktreeを使う場合のbind mount、vendor/storage/cache混用、Cookieのport間共有に注意し、停止・コピー・専用profileで分離する。
- 更新前セッションの有効期間切れを避けて検証し、期限切れを互換性障害と混同しない。

## References

- [Laravel13 upgrade](https://laravel.com/framework/docs/13.x/upgrade)
- [Laravel13 CSRF](https://laravel.com/framework/docs/13.x/csrf)
- [PreventRequestForgery実装（調査時13.x、実行時tag再確認）](https://github.com/laravel/framework/blob/13.x/src/Illuminate/Foundation/Http/Middleware/PreventRequestForgery.php)
- [Framework依存制約](https://github.com/laravel/framework/blob/13.x/composer.json)
- [PHP8 changelog](https://www.php.net/ChangeLog-8.php#PHP_8_3)
- 既存全体計画、S5結果、S6引き継ぎ文書。

## Review / Approval

- 設計Reviewer: HTTPSページのscheme/host/portとTLS listenerを具体化するP2指摘を受け、上表を追記した。再確認でP2解消、新規必須指摘なし。dump復元とLaravel12互換データ作成の実施順序も確認済み。設計レビューのみで変更・テスト実行なし。
- 実装承認: 2026-10-22取得。推奨案でS6開始。OS信頼ストア変更も別承認取得済み。実ブラウザ検証後、信頼設定と対象証明書項目を解除済み。
- 本計画はドキュメントのみ。今回の全テスト未実行。承認後の基準取得・実装・最終検証で実行する。

## S6実行状況（2026-10-22）

実装・自動/実HTTP検証済み。Laravel13.38.0/PHPUnit12.5.40/Tinker3.0.2、互換のためIgnition2.12.1のみ明示追加。backend163成功/1skip/392assertions、旧103識別子全残存、frontend204成功、MySQL5件41assertions、実HTTP/HTTPSマトリクス135成功。実HTTPSでFPM SAPI/拡張/secure確認済み。Reviewerの必須コード指摘なし。

専用CA一時信頼登録の別承認とユーザーのOS認証後、警告迂回なしの実ブラウザHTTPS・送信元検証・主要操作・登録メールの全必須確認を完了。信頼設定と証明書項目を解除し、最終Reviewerも必須未実施なしと確認。**S6完了、S7未着手。** 詳細は[実行記録](2026-10-22-laravel-php-s6-result.md)。
