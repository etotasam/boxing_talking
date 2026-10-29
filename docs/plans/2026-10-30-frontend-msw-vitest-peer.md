# P4h: MSW / Vitest peer整合の調査・提案

## Goal

MSW3.0.3とVitest4.1.12内部のoptional peer不整合を解消する選択肢を調査し、変更範囲と検証方針を提示する。調査報告後、ユーザーがMSWのダウングレードによるA案の実装・検証を承認済み。Vitest4.1.12を維持し、MSW2.15.0へ揃える。

## Background / Context

- 2026-10-30 JST、既存専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/frontend-build-update`、基点05338cbc。開始時clean。
- P4gで全204件・coverage・lint・型検査/build・Storybook/UI成功。全依存監査15（high10/moderate4/low1）、omit-dev5。
- npm ls --allはMSW3.0.3 invalidの1件でexit1。Vitest4.1.12内部の@vitest/mocker4.1.12はoptional peer msw ^2.4.9を宣言。optionalでも導入済みの版が対応範囲外なら不整合になる。
- 不整合はP4fから存在する。P4fでは導入・テスト・監査は確認したが、このpeer条件の確認が不足していた。今回の調査は宣言された組合せへ揃えるためのもの。
- MSWの直接利用はコメント取得テスト1ファイル・9ケース・6ハンドラー。setupServerによるNode側mockのみ。Vitest Browser Mode/ブラウザMSW/GraphQLは使用しない。

## Scope

### In Scope

- 公式npm registry、Vitest5移行ガイド、MSW2→3移行ガイドの確認。
- 一時ディレクトリで候補manifest/lockを解決し、lock上の整合と同条件の全依存/omit-dev監査を比較。
- 本計画の作成とReviewer設計確認、ユーザーへの報告。
- 追加承認済みA案のmanifest/lockとコメントテストimport1行の適用・実検証・最終レビュー、全体計画の記録。

### Out of Scope

- A案以外の候補適用・依存更新、テストimport1行以外のアプリ/テスト/設定変更、push/merge（commitは後続のユーザー保存依頼により追加承認）。
- B/C候補のnpm ci・実node_modules上のnpm ls・実動テスト/build/UI。調査時は全候補lock解決のみ。A案の承認後の実検証は末尾に記録。
- force/legacy-peer-deps、override、peer条件の書換え、node_modules手編集、監査ignore。
- backend/元checkout/元Compose、本番秘密設定、他の15監査対象の更新。

## Impact Area

| 案 | 直接指定とコードへの影響 | 追加の注意 |
| --- | --- | --- |
| A: Vitest4維持・MSW2.15.0（推奨） | package.json/lock、コメント取得テストのimport 1行。msw/httpからmswへ変更 | setupServerはmsw/nodeのまま。http/HttpResponseの6ハンドラーと9ケースの期待値は維持する方針。通常解決でGraphQL16.14.2が依存へ追加される |
| B: MSW3維持・Vitest5.0.5 | vitest/@vitest/ui/@vitest/coverage-v8を5.0.5、@types/nodeを24.19.2へ | テスト基盤のメジャー移行。設定・README・テスト互換修正の要否を追加検証する必要がある |
| C: 直接版維持・通常lock再解決 | manifest変更なし | 不整合が残り解決にならなかった |

## Options

- 2026-10-30のregistry調査時点でVitest4系最新は4.1.12、5系最新は5.0.5。MSW2系最新は2.15.0、3系最新は3.0.3。4系の通常パッチ更新でpeer条件を直す公開版は確認できない。
- @vitest/mocker5.0.5のpeerは `msw ^2.4.9 || ^3.0.0`。Vitest5へ更新する案は宣言上MSW3.0.3に対応する。
- Vitest5.0.5のNode要件は `^22.12.0 || ^24.0.0 || >=26.0.0`、Viteは `^6.4.0 || ^7.0.0 || ^8.0.0`。現Node24.22.1/Vite7.3.7は適合。
- 一方、Vitest5のoptional peer @types/nodeは `^22.0.0 || >=24.0.0`。現在の直接指定/lock20.19.30は範囲外なので、B候補は実Node24と揃え24.19.2へ更新した。
- 5系はclearMocksの既定true、UIのtoken認証必須、ネストしたhoisted mock呼出しのエラー化、未await非同期assertの失敗化、coverage判定/一部型/APIの変更等を含む。今回の204件への影響は未実動確認。clearMocksを無検証で変更せず、基点の保証を比較して移行方針を定める。
- A案はMSWを2.15.0へ揃える。2.15.0はpeer ^2.4.9内。公式exportsにmsw/httpはないため、既存testの `import { http, HttpResponse } from 'msw/http'` を `from 'msw'` に変更する必要がある。rest APIへ戻す変更は不要。

## 調査用候補の結果（実装適用前）

Node24.22.1/npm11.19.1の既存検証imageを使用。一時ディレクトリ `/private/tmp/boxing-p4h-msw-vitest-research-20261030/` のmanifest/lockだけを対象に、通常の `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` と `npm ls --all --package-lock-only --json` を実行した。node_modulesは導入していない。

| 候補 | lock上のnpm ls | 全依存監査 | omit-dev | lock差分 |
| --- | --- | --- | --- | --- |
| 基点 | MSW invalidの既存1件 | 15 | 5 | 744 entries |
| A: MSW2.15.0 | 問題なし | 15 | 5 | 744 entries、追加16/削除16、同一pathの版変更3 |
| B: Vitest組5.0.5 + Node型24.19.2 | 問題なし | 15 | 5 | 731 entries、追加6/削除19、同一pathの版変更12 |
| C: 直接版維持・再解決 | MSW invalidが残る | 未再監査 | 未再監査 | 744 entries、package内容に実質変更なし |

- A/Bの監査内訳は基点と同じcritical0/high10/moderate4/low1、omit-devはhigh2/moderate2/low1。新規advisoryなし。MSW/cookie/@xmldom/xmldomの旧指摘の再発もない。
- Aの同一pathの版変更はmsw3.0.3→2.15.0、@mswjs/interceptors0.45.10→0.41.9、@open-draft/until3.0.1→2.1.0。GraphQLはAで16.14.2が追加、Bは未導入のまま。
- 最初のA/Bコマンドはset -e下のnpm auditが既存15指摘によりexit1で終了した。解決とlock上npm lsは成功し、audit JSONも取得。omit-devは別コマンドで取得。監査exit1を解決失敗や新規脆弱性と混同しない。
- lock上の結果は実インストール後の結果を保証しない。候補のnpm ci/全204件/lint/build/UIは今回実施していない。基点の成功結果と候補の未検証を区別する。

## Decision

A案を採用。調査・Reviewer設計確認後、ユーザーが「MSWのダウングレードで対応しましょう」と実装・検証を承認。B案は比較した代替案として記録し、適用しない。

## Rationale

Aは変更対象をmanifest/lock/既存テストimport 1行に絞れ、現在のVitestの挙動・coverage/UI運用とNode型を維持できる。調査用lockでは既存の脆弱性改善も維持できた。BはMSW3を維持できる利点があるが、実行基盤と型定義の更新・移行挙動の検証範囲が広い。GraphQL依存追加とMSW2への調整はAの明示的なトレードオフであり、2系の保守期限やEOLを推測して比較しない。

## Tasks

- [x] 基点・現行peer・利用範囲を確認。
- [x] 公式の現行公開版・要件・移行点を調査。
- [x] 一時候補A/B/Cのlock解決・peer整合を比較。
- [x] A/Bの全依存/omit-dev監査、新規advisoryを比較。
- [x] Reviewerによる調査・設計確認（問題なし、必須指摘なし）。
- [x] ユーザーへ比較結果と実動未検証の限界を報告。
- [x] A案の実装承認を取得、manifest/lock/コメントテストimport1行を適用。
- [x] 実npm ci/実npm ls・関連9件/全204件・lint/build・coverage/UI・監査を確認。
- [x] 最終Reviewer確認と結果記録（問題なし、必須指摘・追加修正なし）。

## Test Plan（承認済みA案）

- A採用ならMSW2.15.0へのmanifest/lock適用と、コメントテストimport 1行のみ修正。設定や期待値を追加変更しない。
- 新規専用依存volumeでnpm ci、実node_modulesを対象にnpm ls --allがexit0になることを確認。
- 関連9ケース、全52ファイル204件、lint、型検査/production build、同じ環境値でassets比較。件数・識別子・expect・skipを基点と比較。
- coverage生成とVitest UI起動/結果、Storybook build/既存storyを確認。VoteIconのRecoilRoot不足は基点にもある既存エラーとして区別する。
- audit15/omit-dev5を基点として新規advisoryなしを確認。Reviewer最終レビュー後に結果記録。
- B採用時は本計画を更新し、clearMocks等の既定挙動・UI token認証・Node型の影響と必要な設定/README差分を先に具体化し、承認範囲を確定する。

## Risks

- 調査時はA/Bとも実動未検証。承認後のAの実検証結果は末尾に記録。Bは実動未検証のまま。lock上のpeer整合と監査成功だけで互換性を断定しない。
- Aで使っていないGraphQL依存が追加される。削除や強制overrideをせずMSW2の必須依存として確認する。
- BではNode型の変更がアプリ/テスト/Storybook全体の型検査に影響し得る。Vitest組の版も揃える必要がある。
- 脆弱性指摘15件はどちらの案でも残る。peer不整合の修正だけでP4全体完了とはしない。

## References

- https://raw.githubusercontent.com/vitest-dev/vitest/v5.0.5/packages/mocker/package.json
- https://raw.githubusercontent.com/vitest-dev/vitest/v5.0.5/packages/vitest/package.json
- https://vitest.dev/guide/migration/
- https://mswjs.io/docs/migrations/2.x-to-3.x
- https://registry.npmjs.org/msw/2.15.0
- https://docs.npmjs.com/cli/v11/commands/npm-ls/#package-lock-only
- 上記tmp内のregistry metadata、候補manifest/lock/resolve.log/tree.json/audit JSON、comparison-summary.json。

## Reviewer確認・調査記録

- Reviewer subagentが調査・設計を確認し、問題なし、必須指摘・追加修正なし。peer整合を小さい範囲で直す目的ならA推奨は妥当。
- A/Bのlock上整合と監査15/omit-dev5維持、AのGraphQL追加、Bの挙動/UI認証/Node型への影響、証跡25ファイルのhash一致を確認。
- 実装承認後は実npm ci・実node_modules上npm ls exit0と関連9件/全204件/coverage/UI等の確認が必要。候補の実動互換性は未検証のまま。
- Git除外 docker/db/backup/frontend-msw-vitest-peer-investigation-p4h-20261030/ に公式metadata・候補manifest/lock/tree/監査・比較summaryの25ファイル+manifestを保存。実worktreeのfrontendには変更なし。本提案書のみ新規、実装/commitは行っていない。

## 承認後の実装・検証結果

- MSW2.15.0の承認済み候補manifest/lockを調査証跡のhashと照合して適用。コメント取得テストのimportをmsw/httpからmswへ1行変更。Vitest4.1.12・設定・期待値・アプリ本体は維持。
- 新規専用volume boxing-p4h-msw2_node_modulesへnpm ci成功（646 packages）。元環境/既存依存volumeは変更なし。

- 実node_modulesに対するnpm ls --allがexit0となり、peer不整合を解消。MSW2.15.0/Vitest4.1.12を確認。
- 関連9ケース、全52ファイル204件とcoverage成功。fail/skip0、テスト識別子は基点一致。テスト本文/期待値は基点と比較しimport1行以外の変更なし。coverage対象src207ファイルの一覧も基点と一致。
- lint・型検査/production build・Storybook build成功。production assets全6ファイルの名前/SHA256は基点と一致。
- Vitest UIで204 PASS/0 FAIL/204 TOTAL、52ファイルを実ブラウザで確認。Storybook静的buildをloopback配信し、Button/PredictionVoteModal/ToastModalの表示成功。VoteIconはP4g基点と同じ既存RecoilRoot不足エラーを確認し、今回起因と扱わない。
- 全依存監査15（critical0/high10/moderate4/low1）、omit-dev5（high2/moderate2/low1）を維持、新規advisoryなし。MSW/cookie/XML旧指摘の再発なし。監査15件は引き続き別段階で対応する。
- Git除外 `docker/db/backup/frontend-msw2-peer-p4h-20261030/` に17証跡+manifestを保存。実導入/npm ls/関連・全件テスト/coverage/lint/build/Storybook/UI/監査/アセット比較とhashを含む。
- 検証用UI/Storybookコンテナは終了・削除済み。専用依存volumeとtmp証跡は保持。元checkout・元Composeへの操作なし。ユーザー依頼により本計画・全体計画を含むP4h保存コミットへ保存。push/merge・元環境統合は未実施。最終Reviewer評価完了（問題なし、必須指摘・追加修正なし）。
