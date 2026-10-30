# P4i: ESLint・Babel・CSS関連の調査と段階的更新案

## Goal

残るfrontend監査指摘15 packagesの依存経路・修正経路を整理し、変更範囲と検証方針を提示する。調査後、ユーザーが第1段階Aのみの実装・検証を承認。第2段階Cへ進むかは結果確認後に判断する。第1段階のcommitは追加のユーザー依頼により承認済み。

## Background / Context

- 2026-10-30 JST。P4hはユーザー依頼により0f2c0010で保存。既存専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/frontend-build-update`。保存直後clean。
- 基点はMSW2.15.0/Vitest4.1.12、実npm ci/npm ls成功、全204件・coverage・lint・型検査/build・Storybook/UI成功、最終Reviewer問題なし。
- 現監査15（critical0/high10/moderate4/low1）、omit-dev5。件数は脆弱と判定されたpackage数でCVE件数ではない。
- Node24.22.1/npm11.19.1、TS5.9.3、Vite7.3.7、ESLint8.57.1、TypeScript ESLint6.21.0。lint設定は.eslintrc.cjs、Babel7.28.6、Tailwind3.4.19/PostCSS8.5.32/Autoprefixer10.4.23。

## Scope

### In Scope

- frontend設定・lock・監査・依存経路と公式公開版/サポート状況の調査。
- 一時manifest/lockだけでの通常解決・lock上npm ls・全依存/omit-dev監査の比較。
- 本計画、Reviewer設計確認、ユーザーへの報告。
- 承認済み第1段階Aのlock適用、実npm ci/npm ls、全件・coverage・lint/build・画面比較・最終レビュー。

### Out of Scope

- 第2段階Cの実装、manifest・アプリ・設定・テストコード変更、push/merge。
- Babel8、Tailwind4、Vitest5、React/Router/MSWの更新。backend/元checkout/元Compose、本番秘密設定。
- force/legacy-peer-deps、強制override、node_modules手編集、監査ignore、lintルールの無断弱化や新規の型情報を使うlint。
- ESLint10のflat configそのものの実装。第2段階は依存成立性と影響方針までで、有効ルール/対象ファイルの具体的移行差分は別途確認して承認する。

## Impact Area / 指摘経路

| 領域 | 現状の経路 | 解消候補 |
| --- | --- | --- |
| Babel | @babel/core7.28.6、@vitejs/plugin-reactとreact-docgenも7系を利用 | 7.29.7。Babel8は今回不要 |
| Babel/CSS共通 | Babel targetsとAutoprefixer→Browserslist4.28.1→baseline-browser-mapping2.9.18 | Browserslist4.29.5、baseline-browser-mapping2.11.34と必要なブラウザデータ |
| CSS | Tailwind3/postcss-nested→postcss-selector-parser6.1.2 | 6.1.5。Tailwind4/PostCSSのメジャー移行は今回不要 |
| lint共通 | ESLint8配下のajv6、js-yaml4、minimatch3/brace-expansion1等 | 現在の依存範囲内の修正版 |
| glob共通 | picomatch2.3.1、tinyglobby配下4.0.3 | 2.3.2/4.0.7。Vite等に既存の4.0.7は維持 |
| TypeScript lint | TypeScript ESLint6→typescript-estreeがminimatch9.0.3を完全固定 | parser/plugin8.72.1等、上位側の更新が必要 |
| Storybook周辺 | Storybook系→solid-js→seroval1.6.9（~1.6.8） | 範囲内1.6.12。共通開発依存の残存moderate1件として併せて調査 |

TypeScript ESLint6のminimatchはcaret範囲ではなく完全固定のため、通常の間接依存更新だけでは解消しない。強制overrideは採用しない。

## 公式情報の確認

- ESLint10.13.0が調査時点latest、8/9系は公式EOL。8系は2024-10-05、9系は2026-08-06でサポート終了。長期的な着地点は10系。
- ESLint10のNode要件は `^20.19.0 || ^22.13.0 || >=24`。現Node24.22.1で適合。10系は旧.eslintrc形式を廃止しflat configが必要。
- TypeScript ESLint8.72.1はESLint `^8.57.0 || ^9.0.0 || ^10.0.0`、TS `>=4.8.4 <6.1.0` に対応。現TS5.9.3を維持できる。
- ESLint10候補はreact-hooks7.1.1、react-refresh0.5.7を使用。両方10系に対応。Storybook plugin10.6.5は維持（peer ESLint>=8）。
- Babelの公式advisoryは7.29.6で修正済みと記載。候補7.29.7を使用し、Babel8の新既定動作や周辺plugin移行は含めない。
- CSS parserは公式advisoryで6.1.5の修正を確認。現Tailwind/PostCSS設定とサポート対象ブラウザの方針は維持する。

## Options / 調査用候補の結果

`/private/tmp/boxing-p4i-eslint-babel-css-research-20261030/` のmanifest/lockのみを専用Node24 Dockerで解決。npm ci/実動検証は行わず、node_modulesが作成されていないことを確認した。

| 案 | 変更範囲 | lock上整合 | 全依存監査 / omit-dev | 判断 |
| --- | --- | --- | --- | --- |
| 現状維持 | なし | 基点は実npm ls成功 | 15 / 5 | 指摘とESLint EOLが残る |
| A: 既存範囲内の修正版 | manifest不変、lock更新。Babel/CSS/共通glob/旧lintの間接依存/seroval等 | 問題なし | 6 / 0 | 第1段階として推奨 |
| B: A+TypeScript ESLint8、ESLint8維持 | parser/pluginの2直接指定とlock。旧設定は使用可能 | 問題なし | 0 / 0 | 監査は0になるがESLint8 EOLが残るため最終案にしない |
| C: A+ESLint10系構成 | ESLint10.13.0、parser/plugin8.72.1、react-hooks7.1.1、react-refresh0.5.7、@eslint/js10.0.1、globals17.13.0。実装時flat config移行が必要 | 問題なし | 0 / 0 | 第2段階の着地点として推奨。設定移行と実動は未検証 |

- Aは通常の `npm update --package-lock-only --ignore-scripts --no-audit --no-fund` で@babel/core/ajv/baseline-browser-mapping/brace-expansion/browserslist/js-yaml/minimatch/picomatch/postcss-selector-parser/serovalを対象に解決。manifestは基点と一致、744→742 entries、共通pathの版変更33件。
- Aの主な候補はBabel core7.29.7、ajv6.15.0、js-yaml4.3.2、minimatch3.1.5、brace-expansion1.1.21/2.1.7、picomatch2.3.2/4.0.7、CSS parser6.1.5、seroval1.6.12。Babelのhelper/parser/generator、Browserslistが要求するcaniuse-lite等も通常解決で更新される。
- Aの残存6件はTypeScript ESLintの5 packagesと固定minimatch9.0.3、すべてhigh。omit-devは0。これは依存区分上の結果で、現在の配信bundleに5件の実行時脆弱性があったという断定ではない。
- Bは721 entries、Cは712 entries。監査0は調査時点・候補lock上の結果で、将来の監査0や実動互換を保証しない。
- Cは旧ESLint8のlockから一括解決した初回にERESOLVE。BのTypeScript ESLint更新済みlockを基点に、ESLint10と関連plugin等を明示して通常解決し成功。force/override等は未使用。初回失敗ログを成功ログと区別して保存。
- Babel/Tailwind等をlatestメジャーへ揃える案は、現利用側の依存範囲や設定への影響が増え、今回の監査解消に不要なため対象外。

## Decision

A→Cの2段階を推奨する。まずAでBabel/CSS/共通依存を既存範囲の修正版へ更新し、実動検証・保存する。その後、TypeScript ESLint更新を含むCのESLint10移行を具体化し、別途承認・検証する。第1段階Aのみ実装承認済み。第2段階Cは未承認・未着手。

## Rationale

Babel/CSSが生成物に与える影響と、lint設定のメジャー移行を分けることで、問題が出た際に原因を切り分けられる。Aだけで大部分の指摘を除去でき、Cで残る固定依存とESLintサポート終了へ対応できる。Bは一時的な解決手段として成立するが、ESLint8を残すため保守上の着地点には選ばない。

## Tasks

- [x] P4h保存、基点/監査/設定/依存経路を確認。
- [x] 公式公開版・Node/TS/peer・EOL・migration・修正advisoryを確認。
- [x] 一時候補A/B/Cの通常lock解決・lock上npm ls・監査を比較。
- [x] Reviewerによる調査・提案確認（問題なし、必須指摘・追加修正なし）。
- [x] ユーザーへ結果と未検証範囲を報告。
- [x] 第1段階Aの実装承認・適用・実検証。
- [x] 第1段階Aの最終Reviewer確認（問題なし・必須指摘なし）。
- [x] 第1段階Aのcommit保存（ユーザー依頼により本書を含む保存コミットへ保存）。
- [ ] 第2段階Cの設定/ルール/対象範囲の具体化・設計確認・実装承認。

## Test Plan（各段階の実装承認後）

- Aは候補lock以外の無関係な版/範囲変更を確認し、新規専用volumeでnpm ciと実npm ls --all exit0を検証。実worktreeの設定・アプリ・テストコードは変更しない方針。
- 全52ファイル204件、識別子/expect/skip維持、lint、型検査/production build、coverage/UI、Storybook build/既存story表示。VoteIconの既存RecoilRoot不足は基点と区別。
- JS/CSS生成物のhash/差分を比較。Browserslist/caniuseデータ更新でprefix等が変わる可能性を確認し、PC/SP・主要一覧/詳細/フォーム/モーダル等の表示・操作・合成API実通信を同じ基点条件と比較する。設定の対象ブラウザやPC/SP判定仕様を変更しない。
- Aはaudit6/omit-dev0と新規advisoryなしを確認、Reviewer最終確認後に記録。成功後もTypeScript ESLint6固定経路とESLint8 EOLは残る。
- Cは.eslintrc.cjsからeslint.config.mjs等への移行、必要なlint script/README差分を先に具体化する。旧有効ルールと対象ファイル/除外一覧を比較し、no-console、既存exhaustive-depsの扱い、TSの命名/型/unused方針を維持する。
- 新recommendedで追加される診断や削除/改名ルール、React compiler系ルールの取り込みは自動判断で仕様追加・無効化しない。型情報を使うlintを無断追加しない。アプリ修正が必要なら影響と具体案を示して別途承認。
- C適用後は実npm lsとlintの実動を先行確認し、全件/build/開発機能とaudit0を再検証する。依存解決だけで旧設定のまま動くと扱わない。

## Risks

- 第1段階Aは実検証済み。B/Cの根拠は引き続き公式metadata・静的な依存経路・lock解決と監査のみで、実動は未検証。
- AにもBabel変換・ブラウザデータ・CSS解析の挙動変化があり得る。アプリコード不変だけで無影響と判断しない。
- CはESLint10の設定形式/APIと各pluginのrecommended変更を伴う。宣言上のpeer適合だけではplugin実動やlint成功を保証しない。
- A/BだけではESLintのサポート終了が残る。Cの実装・最終回帰・残項目確認までP4全体完了としない。
- 本調査はfrontendが対象。既存Composer等の別領域の残課題を監査0に含めない。元環境統合/本番反映も別段階。

## References

- https://eslint.org/version-support/
- https://eslint.org/docs/latest/use/migrate-to-10.0.0
- https://typescript-eslint.io/users/dependency-versions/
- https://github.com/advisories/GHSA-4x5r-pxfx-6jf8
- https://github.com/advisories/GHSA-rj75-hqrm-r3gf
- https://babeljs.io/docs/v8-migration
- Git除外 `docker/db/backup/frontend-eslint-babel-css-investigation-p4i-20261030/` に公式npm metadata・候補manifest/lock/tree/監査・解決ログ・summaryの40ファイル+manifestを保存。

## Reviewer確認結果

- Reviewer subagentが調査・段階案を確認し、問題なし、必須指摘・追加修正なし。A→Cの分割を妥当と評価。
- Aのmanifest不変・33経路の版変更・監査15→6/omit-dev0、B/Cのlock整合・監査0、公式ESLint保守状況、証跡40ファイルのhash一致を確認。
- 実装承認後のAで生成物/表示を実検証し、Cは有効ルール・対象・除外の移行差分を別途レビュー・承認する。全候補のnpm ci/実動互換性は未検証で、P4全体は未完了。
- 上記は調査時点の確認。承認後の第1段階Aの結果は以下に記録。

## 第1段階Aの実装・検証結果

- ユーザーの「1まで進めましょう。確認後に2に進むか判断」でAのみ承認。第2段階は未着手。
- 基点0f2c0010、同一worktree/branchを使用。frontendの変更はpackage-lock.jsonのみで、調査済みA候補とbytes/hashが完全一致。manifest・設定・アプリ・テストコードは変更なし。
- 専用Node24.22.1/npm11.19.1・専用node_modules volumeで通常npm ciと実npm ls --allがexit0。force/override/legacy-peer-depsなし。
- 全52ファイル204件成功、失敗/skip0。基点と全テスト識別子・状態が一致。coverage生成成功、対象207ファイル維持。lint・型検査/本番build・Storybook build成功。
- 基点と同じAPI接続先・タイトルで生成した本番JS/CSS/画像の全6assetはSHA256完全一致。ブラウザ対象やCSS prefixの変更は発生していない。既存のchunkサイズ/PURE注記通知は継続。
- PC1280x900・SP390x844で一覧/詳細/管理フォームのDOM・主要layout/styleを基点と比較して一致。同じタブと合成Laravel/SQLite APIを使用し、loading完了・focus状態を揃えて比較。初回の一時loading/active差は同条件で比較し直し、一致を確認。
- 合成管理者login、必須入力エラー、合成選手登録POST成功、SP予想modalの選択/送信可能化/閉じるを確認。実画面console errorなし。元DB・元Compose・本番秘密設定は未使用。
- Vitest UIは204 pass/0 fail/52 files。StorybookはButton・PredictionVoteModal・ToastModalを表示確認。VoteIcon単独storyのRecoilRoot不足は基点からの既知制限で継続し、今回の対象外。
- 実監査は全依存15→6（high6、他0）、omit-dev5→0。残存はTypeScript ESLint6系5 packagesと固定minimatch9.0.3。ESLint8のEOLも残るため、P4全体完了とはしない。
- 再開時にDocker停止と以前の一時ファイル消失を確認。専用volumeは残っていたためDockerを復旧し、上記チェックと画面比較を再実行、結果を永続側へ保存した。失われたログだけを根拠に完了扱いしていない。
- 証跡: Git除外 `docker/db/backup/frontend-compatible-update-p4i1-20261030/`。npm ci/tree、全件/coverage、lint/build、監査、asset比較、画面操作、専用serviceログ、summaryとhash manifest。DB・秘密鍵・合成資格情報のスクリプトは含めない。
- 最終Reviewer確認完了（問題なし・必須指摘なし）。Reviewerは候補一致・実tree・全204件の識別子/結果・本番6asset・監査・証跡24項目のhashを確認。比較用build-browser.logを補完し、checks用build.logとの環境差をsummaryへ明記。
- 検証用Composeは終了済み、volume/合成データは保持。ユーザー依頼により本書を含む第1段階保存コミットへ保存。元環境未統合。第2段階へ進むかはユーザー判断待ち。
