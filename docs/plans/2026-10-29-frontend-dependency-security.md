# P4a: frontend通信・ユーティリティ・CSS依存の脆弱性対応

## Goal

P4の最初の小段階としてAxios/Lodash/PostCSSと必須の関連間接依存を更新し、現在のAPI通信・フォーム差分判定・CSS表示を維持したまま対象advisoryを解消する。

## Background / Context

状態: **P4aの依存実装・検証・最終Reviewer確認・コミット保存完了。元環境へ未統合。P4全体は未完了。** 初回作成2026-10-29 JST。

- 作業先は引き続き`/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。新しいworktreeは作らない。
- P3完了`a56486426a398e65b01d2f39a3f120c41cce0843`から`git switch -c codex/frontend-dependency-security`を実行し、P4用branchへ切替済み。調査開始時clean。
- 元worktreeのbranchは`codex/laravel-php-upgrade`、同じP3 commitまでP1〜P3を統合し実起動確認済み。元側の統合結果文書の未コミット差分と未追跡`.codex/environments/`は保持し、今回のbranchへ無断で移動・stageしない。元サービスも停止・再構築しない。
- Node24.22.1/npm11.19.1、既存frontend52ファイル204成功・lint/build成功を基準にする。package-lockはP3でoptional不足情報を補完済み。
- P4全体計画は`2026-10-22-dependency-runtime-update.md`。本書はP4aだけの具体案で、P4完了を意味しない。

### 利用経路

| 対象 | 直接利用と確認する動作 |
| --- | --- |
| Axios | `src/api/axios.ts`で共通instance、withCredentials、XSRF cookie→X-XSRF-TOKEN interceptor、response/error処理。認証・一覧・フォーム送信全般に使用 |
| Lodash | MatchSetFormContainerのcloneDeep、EditMatchForm/functionsやBoxerEditのpick/pickBy/isEqual。初期値・変更差分・送信値の維持 |
| PostCSS | postcss.config.js経由でTailwind3/autoprefixer。production CSS生成とPC/SPの既存表示 |

Axiosのcustom classを使ったdefaults.headers設定やAxiosHeaders独自初期化はsrcで見つからない。Lodashのtemplate/omit/unset直接利用も見つからない。利用していない経路のadvisoryを、現在の画面から必ず悪用可能と断定せず、依存の修正は行う。

### 調査した公開情報（2026-10-29）

- [Axios1.20.0公式release](https://github.com/axios/axios/releases/tag/v1.20.0): runtime option/prototype pollution等のsecurity修正。キャンセル応答・header merge等の互換影響もあるため実通信を検証する。
- [Axios1.21.0公式release](https://github.com/axios/axios/releases/tag/v1.21.0): 最新stableだが、header defaultsの認識、XSRFのCookie Store利用、serialization等に追加変更がある。最小security案と比較する。
- [Lodash advisory](https://github.com/advisories/GHSA-r5fr-rjxr-66jc): template importsに関する修正版は4.18.0。[4.18.1公式release](https://github.com/lodash/lodash/releases/tag/4.18.1)は4.18.0の配布buildの不備を修正しており、4.18.1を候補とする。
- [PostCSS advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp): sourceMappingURL関連の不完全修正は8.5.23で修正。[8.5.32公式release](https://github.com/postcss/postcss/releases/tag/8.5.32)までの同系列修正版を候補とする。
- npm公式registryで候補の公開・依存制約を照合済み。PostCSSのNode制約は`^10 || ^12 || >=14`でNode24を許容。Axios/Lodashの候補にengines指定はない。許容情報だけで実動互換を保証せず、実導入/全検証を行う。

## Scope

### In Scope

| 直接依存 | 現lock | 採用候補lock | manifestの下限 |
| --- | --- | --- | --- |
| axios | 1.13.4 | **1.20.0** | ^1.5.0 → ^1.20.0 |
| lodash | 4.17.23 | **4.18.1** | ^4.17.21 → ^4.18.1 |
| postcss | 8.5.6 | **8.5.32** | ^8.4.29 → ^8.5.32 |

- 必須の関連間接依存の解決とpackage.json/lock更新、前後監査・再現導入・既存機能確認・結果記録。
- 更新コマンドは候補版を明示した`npm install axios@1.20.0 lodash@4.18.1 postcss@8.5.32 --package-lock-only --ignore-scripts --no-audit --no-fund`。デフォルトsave-prefixによりmanifestはcaretだが、実行時はこのlockをnpm ciで使用する。将来の意図的なlock再解決で1.21以降が選ばれる可能性とは区別する。

### Out of Scope

React Router/uuid、Vite/Vitest/UI/coverage/Storybook、Tailwind/React/TypeScript等の主更新、無関係な依存更新、アプリ/認証/API/CSS仕様の変更、backend Composer/PHP/Node/MySQL更新、元環境の再統合・停止、本番設定・外部SMTP/AWS、commit/pushは含めない。必要なら理由と最小案を別途提示する。

## Impact Area

原則変更は`frontend/package.json`、`frontend/package-lock.json`と計画・結果文書のみ。Node image・Compose・旧pnpm lock・ソース・テストコードは維持する。

一時コピーでの候補解決は次の範囲だった。

| 区分 | 対象 |
| --- | --- |
| 直接3件更新 | axios1.20.0、lodash4.18.1、postcss8.5.32 |
| 必須の間接5件更新 | follow-redirects1.15.11→1.16.2、form-data4.0.5→4.0.6、hasown2.0.2→2.0.4、nanoid3.3.11→3.3.20、source-map-js1.2.1→1.2.2 |
| 新規間接3件 | axios配下のhttps-proxy-agent5.0.1、agent-base6.0.2、proxy-from-env2.1.0 |
| metadata | rootの依存指定、既存proxy-from-env1.1.0のdev分類。後者はCypress側に残るため削除しない |

lock1887→1890エントリ、削除0。上記以外の1879エントリはversion/resolved/integrity不変。変更がこの範囲を超えた場合は停止して再提案する。Axios/form-data/PostCSSの新しい依存下限が旧版を許容しないことを確認済み。

## Options

| 案 | 利点 | 欠点・リスク |
| --- | --- | --- |
| 全frontendを一括更新 | 広い監査対象に一度で対応可能 | build/test/router/CSSの複数主更新が混ざり原因と復旧点を切り分けにくい |
| 直接3件を同系列で先行し、Axiosは1.20.0（採用候補） | 対象security修正を狙い、1.21の追加仕様変更を避けて影響を限定 | 1.20でもsecurity修正に伴う互換リスクはあり、全検証が必要 |
| 直接3件を同系列で先行し、Axiosは最新1.21.0 | 最新修正も含み、候補監査で7 packages解消 | header defaults/XSRF等の追加動作変更がある。今回の最小security目的では1.20と比較して採用を決める |

## Decision

Axios1.20.0/Lodash4.18.1/PostCSS8.5.32を採用案とする。候補監査で対象advisoryが解消し、1.21案と同じ対象7 packagesが解消することを確認した。実装と実導入は承認後に実施する。

## Rationale

互換系列の3件と必須関連依存へ絞り、P4b以降のbuild/test基盤・router・uuid・CSS主更新と障害原因を分ける。最小のsecurity版をlockへ固定し、npm ciで再現する。既存アプリを対象にCookie/CSRF・フォーム差分・CSSを検証し、SemVer上の同一majorだけを互換性の根拠にしない。

## Tasks

- [x] 同じworktreeでP4用branchを作成し、P3基点と元worktreeの保持対象を確認。
- [x] 利用箇所、公式情報、候補のmanifest/lock解決と差分を調査。
- [x] 同条件の前後監査・Axios1.20/1.21比較を完了。両候補とも対象3件解消、新規直接advisoryなし。
- [x] Reviewer設計確認、Cookie隔離と監査比較範囲の指摘を反映し再確認済み。
- [x] ユーザーのok! 進めよう！によりP4a具体案の実装承認を取得。
- [x] 承認範囲のmanifest/lockを実装、専用volumeへの実npm ci成功。
- [x] 既存テスト・build/lint・対象ブラウザ/CSRF/Cookie/フォーム/CSS・Storybook等を確認。
- [x] 最終Reviewer確認と監査・結果記録。その後ユーザーのコミット依頼を受け、本書を含むP4a完了コミットへ保存。次段階は別依頼時に実施。

## Test Plan

以下は承認済みの検証方針。実行結果は末尾に記録し、未完了項目を完了扱いにしない。

- 元の稼働Compose/DB/依存volumeは操作しない。同じNode24/npm11 imageでGit管理ソースのenv/生成物なしコピーと独立project/依存volumeを使う。`.env.production`・実鍵等はコピー/参照しない。
- 指定候補から実npm ci成功、manifest/lock hash不変、実installed版・対象以外のlock artifact不変を確認。npm auditは同じnpm/条件で前後比較し、対象と新規advisoryを確認する。audit fix --force、ignore、legacy-peer-depsや包括overridesは使わない。
- 既存全Vitest52ファイル204件、lint、TypeScript/production build。Lodash利用の既存フォーム/差分判定テストとAxiosを通る認証・API hooksを含める。原則、新規テスト・既存テスト変更は不要。仕様上の不足が見つかった場合は理由を示し再提案する。
- Axiosのbrowser adapter/credentials/interceptorsはMSWだけで代用せず、合成データの専用Laravel/SQLiteファイルDB・独自session cookie名・array mail/sync queueと、candidate production buildをloopbackで接続。CSRF cookie取得、保護対象POSTの拒否/正常送信、login/logout、一覧/詳細取得、フォーム送信の成功/失敗表示を確認する。元DB・既存アカウント・外部SMTP/AWSは使わない。
- Cookieはportで分離されないため、認証検証は元環境の`localhost`と異なるhostへ固定する。合成frontend/APIは両方`127.0.0.1`の専用port（例13004/18084）へ統一し、SESSION_DOMAIN=nullのhost-only cookieと独自SESSION_COOKIE=p4a_sessionを使う。元localhostを検証中に開かず、元の標準名XSRF-TOKENも共有しない。事前に127.0.0.1にも元環境が使うcookieがあると判明した場合は認証操作を開始せず、独立profile等の別cookie保存先を確保してから再開する。共有cookieを削除して回避しない。
- CSRF・Cookie値やJWT/tokenをログへ保存しない。必要な確認はcookie/header存在やHTTP状態・合成DBの結果で行う。CORS/認証を緩めて起動・成功を通さない。検証helperと合成dataはGit対象外に置き、PHP/artisanはDockerでだけ実行する。
- LodashのcloneDeep/pick/pickBy/isEqualを使う既存選手/試合編集フォームで初期値・変更差分・送信結果を確認。新たな入力や権限仕様は追加しない。
- PostCSSはTailwind3/autoprefixerを維持してbuildし、同じ合成data・PC/SP条件で主要一覧/詳細/編集フォームの表示を比較。必要なら基点buildとのCSS差分も確認する。
- PostCSSはStorybookのCSS buildにも共有されるため`npm run build-storybook`、loopbackで既存Button等のstory描画を確認。Vite/Vitestの版は維持するが、共通PostCSSを使うVitest UI/非対話coverageも起動・結果とreport生成を確認する。
- 実行時のメモリ上限や処理順はP3の経験を使い、元環境を停止せず大きなbuildを直列化する。検証完了後は専用container/networkだけを片付け、結果を保存する。

## Risks

- Axios1.20でもheader merge・cancel/error・prototype handlingに修正があり、現interceptorのerror.response等を含め実通信の確認が必要。1.21追加変更を避けても無条件互換とは扱わない。
- form-data/proxy等は主にNode adapter経路だが、依存として追加・更新される。browser利用だけを根拠に監査対象から外さない。
- PostCSS parser/source-map修正により既存CSSやStorybookが変わる可能性。Tailwind主更新や設定変更で黙って回避しない。
- critical7を含むbuild/test/Storybook等の残存監査はP4aでは解消しない。P4a終了後、次にVite/Vitest/UI/coverage/Storybook等の互換組と間接依存を調査してP4b案を提示し、理由なく公開判断まで延期しない。P4全体や公開準備の完了とは扱わない。
- React Routerはv6候補6.30.6もあるが全advisory解消を未確認、uuidは修正系列への主更新を伴うため別の小段階で利用と互換性を照合する。監査のfixAvailableだけで主更新を決定しない。
- 元側に残るP1〜P3統合結果文書は未コミット。本作業へ無断で取り込まず、後の保存・統合時に履歴と差分を確認する。

## Investigation Evidence

一時コピー・registry/release・前後監査・解決差分は`/private/tmp/boxing-p4a-20261029/`。候補manifest/lockは`candidate-minimal/`、比較用最新Axios案は`candidate/`、基点は`baseline/`。調査段階では作業branchのpackage.json/lockは未変更。その後、承認済み候補を反映し下記の実装検証を完了した。元環境は変更していない。

### 候補監査・再現性チェックの結果

Node24.22.1/npm11.19.1の同条件package-lock-only監査で、基点79 packages（critical7/high32/moderate30/low10）→Axios1.20採用候補72（critical7/high26/moderate29/low10）。Axios1.21の比較候補も同じ72で、残る直接advisory URL集合も一致した。

- 監査対象から外れたpackagesはaxios/follow-redirects/form-data/lodash/nanoid/postcss/source-map-jsの7件。追加の脆弱package・新規直接advisory URLは0。これはCVEが7件減ったという意味ではない。
- Axios/Lodash/PostCSSの対象advisoryは候補lockで解消。当時は実導入前の候補監査。その後の実導入・動作確認結果は末尾を参照。
- Axios1.20採用候補のnpm ci dry-run（ignore-scripts/no-audit/no-fund）はexit0。実導入・テスト成功とは区別する。
- 修正効果が同じため、追加動作変更がある1.21ではなく1.20.0を今回の採用版とする。最新stableは1.21.0であり、1.20を最新版とは呼ばない。
- 調査のregistry/release/前後監査・差分・dry-run証跡はGit除外`docker/db/backup/frontend-security-p4a-20261029/`にも保存。候補manifest/lockと解決ログを含む。元の未コミット統合文書は移動・変更していない。

- 1.20/1.21候補の監査JSON全体が一致するという意味ではない。TS-ESLint等のvia/range/effectsやfixAvailable提案に差がある。実依存の差分は上記範囲に限定し、同じ対象7 packagesの解消・残存件数・直接advisory URL集合を比較の根拠とする。差分field一覧も証跡へ保存する。

## Reviewer Result

2026-10-29、Reviewerが対象版・間接依存・同条件監査・利用経路・検証計画を確認。Cookieがportで分離されない点を踏まえた別host/Domain条件を補完し、再確認で必須指摘解消・新規必須指摘なし。設計レビュー時点では実装とアプリテストは未実行。その後の実装差分の静的レビューでも必須指摘なし。最終レビューでも承認範囲の差分・監査・全検証・記録が整合し、必須指摘なし。401 toastのAX観測と保存画像の限界を補足して確定した。

## 実装・検証結果（2026-10-29）

- 承認済みmanifest/lockを反映。アプリ・テスト・Compose/Node設定は変更なし。元worktreeも変更していない。
- 実npm ciで1779 packages導入、監査72 packages。package.json/lockは前後byte一致。更新8 packagesの実installed版も一致。
- 元localhostとは異なる127.0.0.1の無状態確認endpointで、認証操作前のCookie名が空配列であることをブラウザ確認した。endpointはCookieを設定/削除せず、値をログへ出力しない。
- 合成backendはSQLiteファイルDB、mail=array、queue=sync、host-only・p4a_session。合成管理者1名・選手2名・試合2件を準備。元DB/実ユーザーを使用していない。


### 依存・監査・既存テスト

- Node24.22.1/npm11.19.1、専用Compose project `boxing-p4a-20261029` と新規依存volumeで実npm ci成功。承認候補・branch・導入コピーのmanifest/lockはbyte一致。元worktreeのmanifest/lockは基点版のまま。
- 全依存監査は79→72 packages（critical7/high26/moderate29/low10）。omit-devも同じNode/npmのpackage-lock-only条件で19→12（critical0/high4/moderate7/low1）。対象7 packages解消、新規の脆弱packageなし。実npm ciの監査件数も72で一致。残るcritical7はP4bの調査対象とし、解消不能とは扱わない。
- 非対話coverage実行で既存52ファイル204件成功。新規テスト・既存テスト・アプリコード変更なし。coverageはstatement/line50.83%、branch80.24%、function68.94%。JUnit、HTML/JSON coverageを生成。
- lint、TypeScript/production build、Storybook build成功。Vitest UIでも52ファイル204件成功のdashboardを実ブラウザで確認。
- npm ciには既存依存のdeprecation・npm11のallowScripts警告、buildには既存のchunkサイズ等の警告あり。Vitest UIはcontainer内ブラウザの自動起動でxdg-open不在を表示したが、サーバーは継続し別ブラウザから全件成功を確認。警告対応の追加依存更新は行わない。

### 実ブラウザと表示

- 認証前の127.0.0.1 Cookie名は空。元localhostとの分離を確認後、合成管理者・合成SQLiteだけで検証。外部への実メール送信なし。
- CSRF/Cookieなしの保護POSTは419。誤った合成passwordのloginは401と失敗toast、正しいloginは200と管理者表示。401の失敗toastは操作直後のブラウザAX状態で確認しており、保存したbrowser-login-failure.pngでは自動非表示後のため写っていない。画像だけをtoast確認の根拠にはしない。logoutは200とログイン画面への復帰を確認。成功/失敗時の認証POSTはCookie・X-XSRF-TOKENの存在を値なしのログで確認。CORS/CSRFを無効化していない。
- 一覧・詳細の取得、選手編集/試合編集の初期値復元と保存成功（PATCH200）を確認。合成選手名と合成会場名だけを変更し、他の選手属性、試合日/選手ID/grade/weight/countryの保持をDB結果でも確認。件数は管理者1・選手2・試合2を維持。
- 重複選手登録は422と入力保持。更新前buildでも同じ応答/入力保持を確認した。422時のtoast描画は明確に確認できず、失敗表示の確認は401の明示toastで行った。既存の更新APIは同名への変更を許容するため、重複登録と更新の挙動を混同せず仕様変更は加えない。
- 更新前/更新後を同じNode/API環境でproduction buildし、生成CSSはbyte一致（SHA256 `c1d27f2ad67eb80db5de533a2fa6e6f840d2a9140baeaddc9f0cda0e202d3750`）。PC1280×720、SP390×844の一覧・詳細・編集を確認。SPの試合編集には横はみ出しがあるが、同じデータ/画面幅の更新前buildでも再現した。今回の更新による表示差は確認されず、既存の表示課題として記録し修正は含めない。
- Storybookをloopbackで起動し、既存Button/Default storyのボタンとControls描画を確認。作業終了時に画面幅の一時指定を解除。

### 証跡・後片付け・残作業

- 実行ログ、前後監査、manifest/lock、JUnit/coverage、HTTP状態とCookie/header存在だけのログ、合成DB結果、ブラウザ画像はGit除外 `docker/db/backup/frontend-security-p4a-20261029/` に保存済み。合成DB本体・session・鍵・環境設定・password helperは保存対象にしない。
- 専用projectのcontainer7件・network2件を終了/削除済み。volumeは削除していない。元Composeのphp/web/node/dbは継続稼働、元DB・依存volume・元側未コミット文書を保持。最終Reviewer確認も完了、必須指摘なし。
- ユーザーのコミット依頼により、P4aの依存更新・全体plan・本書を`codex/frontend-dependency-security`の本書を含む完了コミットへ保存。元環境へは未統合。次の作業依頼後、P4bのVite/Vitest/UI/coverage/Storybook等の互換組とcritical7件の具体的な対応案を調査する。P4全体完了・公開準備完了とは扱わない。
