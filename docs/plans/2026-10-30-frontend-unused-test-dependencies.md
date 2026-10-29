# P4g: 未使用のテスト関連直接依存の整理

## Goal

実際に使用していないテスト関連の直接依存を除去し、既存テストと開発機能を維持する。調査・Reviewer設計確認と具体案提示後、ユーザーが「了解 進めてくれ」で6つの直接指定の削除と検証を承認済み。

## Background / Context

- 2026-10-30 JST。ユーザーが「利用状況を調べ、削除候補と理由を提示して承認後に削除・検証する」流れを了承。
- 既存専用worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/frontend-build-update`、基点 `a2f865d7`。開始時clean。元checkout・元Composeは変更しない。
- frontend規約、explorer/plannerスキルを参照。現行はNode24.22.1/npm11.19.1、Vitest4.1.12、Storybook10.6.5、MSW3.0.3。
- 基点で全52ファイル204テスト・lint・型検査/build成功、最終Reviewer問題なし。監査21（high10/moderate4/low7）、omit-dev5。
- 調査対象はfrontendのテスト関連直接依存6つ。全リポジトリの未使用依存を網羅したという意味ではない。追跡中のsrc、設定、scripts、Storybook、Docker/README、lockの依存/peer経路を確認。

## Scope

### In Scope（承認済み）

- package.jsonのdevDependenciesから下表の6つの直接指定を削除する案。
- package-lock.jsonの通常npm解決による不要経路の除去・必要な再配置。
- この計画と全体計画の結果記録。
- 追加承認済みの2テストファイルでVitest importにdescribeを追加（後述）。

### Out of Scope

- アプリ/設定変更、承認済みdescribe import追加以外のテスト変更、push/merge（commitは後続のユーザー保存依頼により追加承認）。
- テスト削除・expect変更・skip追加・フレームワーク更新・ESLint更新・他依存の任意更新。
- Vitest/Storybookが必要とするChai系間接依存、jest-dom、Testing Library、MSW、jsdomの削除。
- backend、元環境、production秘密設定、pnpm-lock.yaml、Docker定義の変更。
- tsconfig.jsonの既存types配置の修正。削除で問題が判明した場合は削除範囲を再検討し、設定変更を無断で追加しない。

## Impact Area

実装対象はmanifest/lock、追加承認済みのdescribe import 2行、記録文書。コードからのimportだけでなく、テストの型環境・Vitest・Storybook・coverage/UIの起動も影響確認する。

| 削除する直接指定 | 実際の参照・依存 | 判断と注意 |
| --- | --- | --- |
| ts-jest | scripts/config/sourceで未参照。lockではJestを必須peerとして導入 | VitestによるTSテストに未使用。Jest経路の除去候補 |
| ts-node | scripts/config/sourceで未参照。lockの利用者はJest configのpeer | Vite/Vitest設定は既存ローダーで処理。Jest側除去後の依存ツリーも確認 |
| @types/jest | 明示import/referenceなし。全52テストがVitestを明示import | 現在は自動読み込みあり。型検査が必要 |
| @types/mocha | 明示import/reference、Mocha実行設定なし | 同上。テスト実行基盤はVitest |
| chai | sourceからの直接importなし。ルート5.3.3はStorybook→@vitest/expect3.2.4も使用 | 直接指定だけ除去。Storybook用Chai5とVitest用Chai6は必要 |
| @types/chai | ソースの明示参照なし。ルート4.3.20と、Vitest/Storybook側が必要とする5.2.3が併存 | 直接4系指定を除去し、必要な間接5系は通常解決に任せる |

- @testing-library/jest-dom/vitestは21テストファイルで実使用。名前にjestが含まれていても維持する。Vitestとの統合は公式にも記載。
- 現tsconfig.jsonのtypesはcompilerOptions外にある。既存専用Docker内でtsc --showConfigによりcompilerOptions.types未指定、tsc --listFilesOnlyでJest/Mocha/ルートChai型の自動読み込みを確認。削除で型環境は変わるため「importなしだけで安全」と判断しない。
- Storybook→@vitest/expect3.2.4→Chai5/@types/chai5、Vitest→@vitest/expect4.1.12→Chai6/@types/chai5は残す。Jestと名前が付くすべての間接依存を一律に削除しない。
- 監査lowのts-jest/@jest/core/jest/jest-cli/jest-config/deepmergeは同じ削除候補経路。指摘減少が見込めるが、削除後の件数は未検証であり確約しない。

## Options

| 案 | メリット | デメリット・リスク |
| --- | --- | --- |
| 現状維持 | 変更なし | 未使用Jest経路と型の重複が残る |
| ts-jestのみ除去 | 最小の変更でJest経路削減を狙える | 他の未使用直接指定と自動読み込み型が残る |
| 6つの直接指定を整理（推奨） | 実使用に合わせ、Jest系と不要なルート型指定を整理 | 型の自動読み込み/Chaiのhoist変化があり、全件とStorybook等の確認が必要 |

## Decision

6つの直接指定を削除する案を採用。Reviewer設計確認・具体案提示・Jest/Vitestの説明後、ユーザーが削除と検証を承認済み。

## Rationale

scripts・明示import・設定に利用がなく、必要なChai系は利用側が依存として宣言している。小分けに残すより同じ目的の直接指定をまとめて整理し、再現導入・全テスト・型検査・開発機能で影響を確認する。無関係なバージョン更新や設定変更は含めない。

## Tasks

- [x] 基点clean・規約・scripts・設定・52テストのVitest importを確認。
- [x] 6候補の利用とlock依存/peer経路、jest-domの実使用を確認。
- [x] 現行TypeScriptの有効設定・自動読み込み型を読み取り専用で確認。
- [x] 代替案・リスク・検証方針を計画化。
- [x] Reviewerによる設計確認（問題なし、必須指摘なし）。
- [x] ユーザーへ具体案提示・削除承認。
- [x] 承認後に6つの直接指定とlockを更新。
- [x] 新規専用volumeでnpm ci・全件・lint/build・開発機能・監査を検証（npm lsは基点と同一の既存optional peer不整合が残る）。
- [x] Reviewer最終確認・記録（今回の承認範囲は問題なし、必須追加修正なし）。

## Test Plan

- 承認後、npmの通常手順で6つの直接指定を除去してlockを解決する。node_modulesを手編集しない。共通packageの無関係な版更新があれば切り分ける。
- 専用Node24 Dockerと新規node_modules volumeにnpm ciで再現導入。元Compose/元volumeに操作しない。残存Chai/型/Storybook/Vitestの依存経路を確認。
- 全52ファイル204テスト。基点の検出・識別子・期待値・skip状態を維持。アプリ/テスト本体の仕様変更なし。
- npm run lint、npm run build（TypeScript含む）。既存の自動型読み込み除去後もDOM matcher/モック/Reactテストが型検査を通ることを確認。
- npm run build-storybook。StorybookとVitest両方のexpect/Chai経路を検証。
- 非対話Vitest coverage生成、Vitest UIのloopback起動と結果表示、Storybookのloopback起動と既存story表示を確認。既存VoteIcon storyのRecoilRoot不足エラーは基点と比較して今回起因と区別し、無断修正しない（P4b結果に記録あり）。必要な一時設定は調査/検証側に限定し、アプリ設定は変更しない。
- 全依存/omit-dev auditを基点21/5と比較。件数だけでなく新規advisory/packageがないことを確認。
- 同じbuild用環境値でproduction assetsの名前/hashをP4fと比較。アプリ通信やbackendは変更しないため、合成backend/API画面操作の再実施は予定しない。
- 完了後にReviewerが差分・必要依存維持・結果を確認。失敗時は原因を調べ、無断のテスト弱化や設定修正で通さない。

## Risks

- 明示参照がなくても自動読み込み型が現在のコンパイルに影響している。未使用の断定は削除後の型検査まで留保する。
- Chai/@types/chaiは消滅しない。直接指定削除によるhoist/配置変化をバージョン単位で確認する。
- peer依存の自動導入で削除候補経路が残る場合は、経路を確認し必要な依存を強制削除しない。
- 監査は21からどこまで減るか未測定。ESLint/Babel/CSS等は別段階。P4全体の完了は本作業だけで確約しない。
- 実装前は本計画のみ作成。現在の適用・検証状況は末尾に記録。

## References

- frontend/package.json、package-lock.json、tsconfig.json、tsconfig.node.json、vite.config.ts、vitest.config.mjs、test-setup.tsx、.storybook/、src内52テスト、frontend/README.md。
- 現行型の読み取り結果: /private/tmp/boxing-p4f-msw-implementation-20261030/p4g-tsconfig-effective.json、p4g-typescript-files.txt。
- https://v4.vitest.dev/guide/migration.html
- https://github.com/testing-library/jest-dom#with-vitest
- [全体計画](2026-10-22-dependency-runtime-update.md)

## Reviewer設計レビュー結果

- Reviewer subagentの設計確認完了。問題なし、必須指摘なし。6つの直接指定の削除案をユーザーへ提示可能。
- 利用箇所・依存経路、必要なChai間接依存/jest-dom維持、自動型読み込み/hoistリスク、検証範囲を確認。
- 任意改善として既存VoteIcon storyエラーとの区別を追記。P4b結果で基点にも存在したことを照合済み。
- 削除後のlock/監査/動作は未検証。実装ファイルは未変更、削除承認待ち。

## 実装・検証結果（経過記録）

- npm uninstall --save-dev --package-lock-only --ignore-scripts --offline --no-audit --no-fundで6つの直接指定を削除。新規専用volume boxing-p4g-unused-tests_node_modulesへnpm ci --offline --no-audit --no-fund成功（646 packages）。元環境への操作なし。
- lockエントリ1224→744、追加0・削除480。維持される全packageエントリは基点と内容一致（ルートdevDependenciesの6指定除去のみ変更）。版変更なし。npmによる並べ替えがありテキスト差分は大きい。
- ts-jest/ts-node/Jest本体/@types/jest/@types/mochaの経路を除去。Chai5.3.3/6.3.0、間接@types/chai5.2.3、Storybook/Vitest両方のexpect、jest-dom6.9.1は維持。
- 監査21→15（critical0/high10/moderate4/low1）。Jest関連6 packagesのlowが解消。omit-dev5不変。新規advisoryなし。
- 全件/coverage・lint/build・Storybook等の検証を実施中。実装差分はmanifest/lockのみ。commit未実施。


## 削除後に判明した型参照と追加提案（追加承認・適用済み）

- 通常のテスト用origin条件では全52ファイル204件とcoverage成功、lint成功。一方、型検査はdescribe未定義のTS2582で2件失敗。
- 対象は `src/components/module/MatchSetForm/EditMatchForm/__test__/functions.test.ts` と `src/components/module/MatchSetForm/RegisterMatchForm/__test__/RegisterMatchForm.test.tsx`。functions.test.tsは既存 `import { expect, test } from 'vitest'`、RegisterMatchForm.test.tsxは既存 `import { expect, test, vi } from 'vitest'` へ、それぞれ `describe` を1語追加（計2行）。
- 全52ファイルがVitestをimportしている事実は確認したが、全APIの明示importを保証するものではなかった。グローバルdescribeの型をJest/Mochaの自動読み込みで補っていた点を調査で見落とした。Jestを実行していたという意味ではない。
- 代替案はMocha型の直接指定を戻す、またはtsconfig.typesをcompilerOptionsへ移す。前者は不要な型基盤依存を残し、後者は設定全体の型読み込み範囲を変えるため、既存Vitest importを補う最小案を推奨。
- Reviewerは追加2importを設計確認し、妥当・推奨と評価。設定・test名・期待値・処理を変えずに型依存を正せる。テストコード変更は承認済みScope外のため、ユーザーへこの2行のみ追加承認を求める。承認前にはテストコードを編集しない。
- 承認後は該当テスト、型検査/build、全204件を確認する。追加テスト・expect弱化・tsconfig変更・型依存復活は不要。
- 初回coverageは誤ってbuild用URL `http://[::1]:18085` を使用し、jsdom既定originと異なるためCORSで6件失敗。HEADコピーと基点のP4f依存でも同じ6件失敗を再現。既存テスト用URL `http://localhost:3000` では全204件成功。失敗ログとJSONも成功結果と区別して保存。

## 追加承認後の進捗

- ユーザーが「2行のimport追加で進める」を選択して追加承認。上記2ファイルへdescribeの明示importのみ適用。設定/期待値/テスト名/処理は維持。
- 削除後の全204件・coverage成功、lint成功、Storybook build成功。Vitest UIで204 PASS/0 FAIL/204 TOTAL、52ファイルを確認。
- import追加後も全52ファイル204件・lint・型検査/build成功。最終Reviewer評価完了（今回の承認範囲は問題なし、必須追加修正なし）。


## 最終検証結果

- 追加承認済みの2行以外はテスト本文/期待値/名前を変更していないことを基点と機械比較。全52ファイル204件の識別子一致、fail/skip0。通常テスト用URLで全件/coverage成功後、import追加後の全件も成功。
- lint・型検査・production build成功。配信assets全6ファイルの名前/SHA256はP4fと一致。Storybook build成功、coverageはsrcの207ファイルを対象として生成。
- Vitest UIで204 PASS/0 FAIL/204 TOTALと52ファイル成功を実ブラウザで確認。StorybookのButton/PredictionVoteModal/ToastModalは表示成功。VoteIconはHEADコピーと削除後の両方で同じRecoilRoot不足エラー。初回コンパイル時のtimeout通知も基点側に存在し、コンパイル/再読込み後は通常ストーリーを表示できた。既存エラー修正は対象外。
- 全依存audit21→15（critical0/high10/moderate4/low1）、omit-dev5不変。新規advisoryなし。削除された指摘対象はts-jest/@jest/core/jest/jest-cli/jest-config/deepmerge。
- npm ls --allはexit1。Vitest4.1.12内部の@vitest/mockerがoptional peer msw ^2.4.9を宣言し、ルートMSW3.0.3をinvalidと判定する。HEADコピー+P4f依存でも同じ1件を再現。依存削除で追加された指摘ではなく、P4fから残る整合課題。npm ci、全テスト、coverage、UI、buildは成功したが、依存整合が完全にcleanとは報告しない。MSW/Vitest版の再選定・peer対応は今回の6指定削除と分けて具体案を提示する。
- Git除外 `docker/db/backup/frontend-unused-tests-p4g-20261030/` に28証跡+manifestを保存。成功ログ/全件JSON/coverage/監査/lock比較/ブラウザ観測/最終hash、失敗したCORS条件の基点比較、TS2582失敗、削除前後npm ls結果を含む。
- 検証用ComposeのUI/Storybook/基点比較サーバーは終了・コンテナ削除済み。今回専用依存volumeとtmp証跡は保持。元Compose/元checkoutへの操作なし。ユーザー依頼により、本計画・全体計画を含むP4g保存コミットへ保存。push/merge・元環境統合は未実施。
- 最終Reviewer評価完了（今回の承認範囲は問題なし、必須追加修正なし）。P4全体は未完了。
