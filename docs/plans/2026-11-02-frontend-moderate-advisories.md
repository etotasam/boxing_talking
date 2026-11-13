# P4j: 残存moderate advisoryの更新経路調査

## Goal

P4i-2後のfrontend監査moderate14 packagesの原因と修正経路を確認し、既存機能を維持した通常更新で解消できるかを判断する。今回は最新監査・候補調査・Reviewer設計確認・報告まで。依存実装やcommitは行わない。

## Background / Context

- 2026-11-02 JST。基点a2e3e709、branch `codex/frontend-build-update`。専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`。開始時clean。
- P4i-2はESLint10移行と6配列の直接文字列union化を実装・検証・Reviewer確認・commit済み。52ファイル204件、lint/型/build/coverage/画面等成功。元環境未統合。
- 今回はユーザーが説明済みの手順1〜3（調査・具体案・Reviewer後報告）を承認。実worktreeのfrontendには変更しない。
- Node24.22.1/npm11.19.1の既存専用imageを使用。候補は一時manifest/lockのみ、実node_modulesは新規作成していない。

## Scope

### In Scope

- 基点lockの最新全依存/omit-dev監査、2advisoryの公式修正範囲を確認。
- 関連する安定版上位packageの公式npm metadata（version/dependencies/peer/Node制約）を取得。
- 一時コピー上の通常package-lock-only更新・lock上npm ls・監査・manifest/lock比較。
- 既存導入済みライブラリの該当呼出箇所を読取専用で補足確認。
- 本計画、Reviewer確認、ユーザー報告。

### Out of Scope

- 実worktreeのpackage/lock/コード/設定/テスト変更、実装、commit/push/merge、元環境統合・本番反映。
- npm audit fix --force、legacy-peer-deps、override、node_modules編集、独自patch/fork、監査ignoreや判定閾値の弱化。
- eslint/Storybook等の機能削除・置換、大幅downgrade、別領域のbackend/MySQL/Node更新。
- 候補のnpm ci/実tree/lint/test/coverage/build/ブラウザ検証。lock整合だけで実動互換を判定しない。

## Impact Area / 原因と公開修正版

基点の最新監査はcritical0/high0/moderate14/low0、omit-dev0。14は影響package数で、根本advisoryは以下の2件。

| advisory | 公式の影響範囲 | 修正範囲/調査時latest |
| --- | --- | --- |
| GHSA-g3hv-75wg-m249 / minimatch | <11.0.1 | 11.0.1以上、latest11.0.3 |
| GHSA-3g3m-2fjr-6pw4 / glob | >=9.0.0 <=14.0.1 | 14.0.2以上、latest14.0.3 |

両修正版のNode要件は現Node24に適合する。今回の主な阻害要因はNodeではなく利用元の依存版範囲である。

## Stable Upstream / 現在の更新経路

| 上位package（公式latest） | 修正を阻む指定 | 判定 |
| --- | --- | --- |
| ESLint10.14.0 | minimatch ^10.2.6 | minimatch11は通常解決の範囲外 |
| @eslint/config-array0.23.5 | minimatch ^10.2.4 | 同上 |
| @typescript-eslint/typescript-estree8.72.1 | minimatch ^10.2.2 | 同上。parser/pluginも8.72.1がlatest |
| @storybook/react-vite10.6.5 | docgen plugin ^0.7.0 | 選択されるdocgen0.7.0はglob ^13.0.1 |
| docgen plugin0.9.0 | glob ^13.0.6 | 仮にこちらへ上げてもglob14は通常範囲外。Storybookの^0.7.0にも収まらない |
| eslint-plugin-storybook10.6.5 | @typescript-eslint/utils ^8.60.0 | TS ESLint/ESLint経路に波及し、これだけ上げても解消しない |

- storybook/@storybook/react-vite/pluginはいずれも現10.6.5がlatest。ESLintだけは10.13.0→10.14.0が公開されているが、修正済みminimatchを要求していない。
- ルートにminimatch11/glob14を直接追加しても、上位の^10/^13指定を満たさず、元の依存を安全に置換できたことにはならない。
- npm auditのfixAvailableにはeslint-plugin-storybook0.1.1や@storybook/react-vite8.5.3へのdowngrade提案が含まれる。機能・peer・保守状況を維持する適切な修正案とは扱わず、実行していない。

## Options

| 案 | 根拠/利点 | 欠点・判断 |
| --- | --- | --- |
| A: 現依存を維持し上位の修正対応版を待つ | 既存検証済みの構成を維持できる。修正を取り込む安定版の公開後に通常更新を再評価 | 指摘は未解決のまま。今回はこれを推奨し、P4を完了扱いしない |
| B: 既存範囲内で関連依存を通常更新 | 一時lockで実測。manifest不変、ESLint10.14.0へ上がりlock整合exit0 | 監査14/omit-dev0のまま。今回のadvisory解消には効かず、実worktree適用は提案しない |
| C: メジャーを跨ぐoverride/独自patch等 | 修正版へ強制的に差し替える選択肢自体はある | 利用元の保証範囲外。現依頼の通常更新から外れ、互換性・保守責任の別調査/承認が必要。今回は未試行・不採用 |
| D: ツール削除/置換・大幅downgrade | 依存経路を別構成に変えることは可能 | lint/型解析/Storybookの機能と保守状況へ影響。現目的に対して過大で不採用 |

## Decision

Aを推奨する。現時点で調査した関連安定版と宣言範囲では、通常更新による解消経路を確認できなかった。依存実装の変更案は提示せず、残存指摘と再確認条件を記録する。これは脆弱性解消・恒久受容・監査ignoreの承認ではない。修正対応を含む上位版が公開されたら、通常解決と監査を再実施して具体案を提示する。

## Rationale / 利用状況の補足

- 全指摘は開発依存側で、omit-devは0。ただし本番manifestにはbuild用依存もあり、依存区分だけで実行時到達性を断定しない。
- 公式minimatchの説明は、攻撃者制御patternとoptimizationLevel>=2による増幅。導入済みESLint/config-arrayの呼出箇所を確認し、設定側のglob利用を確認した。config-arrayの標準呼出はdot:trueで、今回のeslint.config.mjsも固定glob。これだけで全経路の非到達を証明したとは扱わない。
- docgen pluginはStorybookの型解析用で、実設定はreact-docgen-typescript。導入済みpluginのglobSync呼出ではabsolute/cwd/ignore/nodir指定を確認し、その呼出ではAbortSignal指定を確認できなかった。glob advisoryの全実行経路の非到達保証ではない。
- 開発/build/CI環境への影響や信頼境界は残る。公開修正版があることと、現在の利用元へ安全に取り込めることを区別する。

## Tasks

- [x] 基点と最新監査、2advisoryの修正範囲を確認。
- [x] 関連安定版11packagesの公式npm metadata/依存範囲/Node要件を確認。
- [x] 一時lock通常更新・lock上tree・監査・manifest/版差分を比較。
- [x] 利用箇所を読取専用で補足調査、証跡保存。
- [x] Reviewerによる根拠・選択肢・残リスク・再確認条件の評価（問題なし・必須指摘なし）。
- [x] ユーザーへの結果報告。
- [ ] 上位が修正対応版を公開後、候補再解決・監査・具体案の承認へ進む（時期未定）。

## Test Plan / 今回の実測

- 基点npm audit: moderate14、それ以外0。omit-dev0。
- 一時コピーで関連packageを指定してnpm update --package-lock-only --ignore-scripts --no-audit --no-fund。成功、manifest bytes不変、ESLint10.13.0→10.14.0のみ版変更。
- npm ls --all --package-lock-only --json exit0、候補監査moderate14/omit-dev0、基点との新規advisory ID差0。
- 一時コピーにnode_modulesが作成されていないことを確認。実npm ci/実tree/互換検証は未実施、worktreeには候補未適用。
- 実装変更なしのため全204件/lint/buildは再実行しない。git diff --checkと証跡hashを検証する。
- 将来の実装時は通常npm ci/実tree、lint対象/実効ルール・全204件/coverage/型/build/Storybook/UI・必要なPC/SP・合成API回帰と監査を行う。0件になった監査だけで実動成功とはしない。

## Risks / 再開条件

- 待機中もmoderate14と2advisoryは残る。P4全体/公開判断を完了扱いせず、残存課題を引き継ぐ。
- 上位の対応版が出る時期は不明。推奨版・advisoryの範囲・severityは変わり得るため、再開時に最新情報を取り直す。
- 再評価の条件: いずれかの上位依存が修正を取り込んだ場合、部分的な指摘削減も含めて再評価する。全解消にはESLint/config-array/TS-estreeの各経路が修正版minimatch11以上を許容し、Storybookから選択されるdocgen系が修正版glob14.0.2以上を許容することが必要。別の修正backport/advisory範囲更新があればそれも再評価する。
- override/patchを必要とする方針へ変更する場合は、対象経路・API/Node互換・lint/型解析/Storybook回帰・将来の撤去条件を別案として具体化し、承認前に適用しない。
- 今回の結論は調査した関連安定版・現在の宣言範囲についてのもの。全歴史版/未公開版/別ツールを網羅した修正不可能の証明ではない。

## References / Evidence

- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
- https://github.com/eslint/eslint/releases/tag/v10.14.0
- https://github.com/isaacs/minimatch/releases/tag/v11.0.1
- https://github.com/isaacs/node-glob/releases/tag/v14.0.2
- https://docs.npmjs.com/cli/v11/commands/npm-update
- https://docs.npmjs.com/cli/v11/commands/npm-audit
- Git除外 `docker/db/backup/frontend-advisory-research-p4j-20261102/` にlatest metadata、基点/候補manifest-lock・監査・lock上tree・通常解決ログ・利用箇所抜粋・summary/hash manifestを保存（49ファイル含manifest（Reviewer確認後にreview-result/cleanupを追加））。

## Reviewer確認結果

- 問題なし、必須指摘なし。基点/候補の監査14/omit-dev0、2advisory、公式依存範囲、ESLintだけの版変更・manifest不変、lock上treeと証跡46項目のhashを確認。
- 実装は未変更、候補の実導入/lint/test/buildも未検証。現在の結論を調査した安定版・宣言範囲へ限定し、待機を解消扱いせずP4未完了を維持する方針を確認。
- 調査用Composeは終了し、元環境/元DB/実依存は変更していない。ユーザーの元worktree統合依頼に伴い、本書を含む調査・統合計画のコミットへ保存。
