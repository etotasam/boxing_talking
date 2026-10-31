# P4i-2: ESLint 10への設定移行案

## Goal

ESLint 8のサポート終了と、TypeScript ESLint 6の固定minimatch経路に残るfrontend監査6件へ対応する。既存のlint方針・対象範囲・アプリ動作を維持してESLint 10へ移行する。型専用配列は直接の文字列unionへ変更する（authCheckStateの4状態への限定は追加承認済み）。

## Background / Context

- 2026-10-30 JST。基点b0d30c87。worktree `/Users/terashimamasato/.codex/worktrees/backend-sdk-security/boxing_talking`、branch `codex/frontend-build-update`。調査開始時clean。
- 第1段階Aは実装・検証・Reviewer確認とcommit保存済み。全204件、実npm ci/tree、lint/build/coverage/UI/Storybook/PC/SP成功、全依存監査6・omit-dev0。
- ユーザーのgo aheadは、説明済みの「具体化→Reviewer→提案→承認後実装」の流れに沿って進める。2026-10-31、型専用配列の直接union化をユーザーが承認。underscore rename案は採用せず、改訂設計のReviewer確認後に実装・検証する。
- 既存lintはESLint8.57.1、TypeScript ESLint6.21.0、旧.eslintrc.cjs。実測262ファイル、通常258とstory4の2種類の実効設定、警告/エラー0。

## Scope

### In Scope

- 設定・ルール・対象/除外・依存条件の具体化、隔離コピーでのnpm ci/tree・lint・型検査・監査・ルール動作比較。
- 本計画、Reviewer設計確認、実装可否のユーザー判断。
- 承認後の提案範囲は依存/lock、flat config、lint script/README、および後述5ファイルの6定数を直接の文字列unionへ置換する対応に限定する。

### Out of Scope

- commit/push/merge、元環境統合・本番反映。
- React Compiler向けルールの導入、型情報を使うlint、新規recommendedルールの一括採用、eslint-disable追加、既存ルールの無断弱化。
- UI/API/Recoil key/default/export名の変更。authCheckState以外の公開型の変更、実使用中のboolean型authCheckingStateの変更。テストコードの変更や新規テスト追加。
- Vite/Vitest/Storybook/React/Router/MSW/Babel/CSSの再更新。backend・元DB・元Compose・秘密設定。

## Impact Area

| 変更候補 | 内容 |
| --- | --- |
| frontend/package.json / package-lock.json | ESLint10.13.0、@typescript-eslint parser/plugin8.72.1、react-hooks7.1.1、react-refresh0.5.7、globals13.24.0の直接dev指定。Storybook plugin10.6.5/TS5.9.3は維持 |
| frontend/.eslintrc.cjs | 承認後にapply_patchで削除 |
| frontend/eslint.config.mjs | 旧実効ルールを明示するflat configを追加 |
| package.jsonのlint script | `eslint . --max-warnings 0`。対象拡張子・unused disableのerror判定をconfigへ移動 |
| frontend/README.md | flat config、互換方針、現行lintコマンドを説明。旧形式のtemplate拡張例を現行設定と整合させる |
| frontend/src/store/{apiFetchDataState,authCheckState,boolState,elementSizeState,modalState}.ts | 型参照専用の配列6つを削除し直接の文字列unionへ置換。authCheckStateのみstringから4状態へ限定 |

設定・manifest・README・sourceを合わせて10パス（旧設定削除/新設定追加をそれぞれ計上）。計画/結果文書は別途更新する。

## Options

| 案 | 実測/利点 | 問題・判断 |
| --- | --- | --- |
| 現状維持 | 既存lint成功 | 監査6件とESLint EOLが残るため不採用 |
| 新recommended一括採用 | 対象262件は一致 | エラー20・警告7。Compiler系がstatic-components1/set-state-in-effect10/immutability4/refs5、unused-vars7。アプリの広い変更に及ぶため今回は不採用 |
| 旧実効ルールを移行、source不変 | 対象262件一致、エラー0 | 型参照だけの非公開定数6つを新unused-varsが検出。max-warnings0のためlint失敗。名前個別ignoreやルール停止は採用しない |
| 旧実効ルール移行 + 非公開定数6つのrename | 対象262件一致、エラー/警告0、型検査成功、監査0 | 初回の調査案。後のユーザー判断により不採用 |

型だけへの直接書換えも検討したが、authCheckStateの`state`はas constがなく、現在のStateTypeはstringである。初回は型維持のためrenameを提案したが、ユーザーが型直接定義を選択した。authCheckStateもloading/success/error/idleの4状態への限定を承認済み。現在このatomへのimport参照はない。実際の認証画面は別のauthCheckingStateを使用している。

## Decision

旧実効ルール移行 + 型専用配列6つの直接union化を採用。2026-10-31の「全てstringのunion型にしましょう」により実装承認済み。ESLint設定・依存は前回設計から維持し、source方針を改訂する。

### 設定の具体方針

- 新recommendedをextends/spreadせず、基点の実効ルールを明示する。既存のno-console（errorのみ許可）、any/unusedのwarnとmax-warnings0、exhaustive-deps offを維持。Hooksは既存rules-of-hooksを維持しCompiler系を追加しない。
- Storybookの4storyには旧実効overrideを移す。通常設定と同じunused-varsは重複指定せず、caughtErrors noneを含む共通設定を継承させる。storybook rules・storyではrules-of-hooks offという既存方針を維持する。
- `files: ['**/*.{ts,tsx}']`、global ignoresで`**/dist/**`、`**/.*`、`**/*.{js,cjs,mjs,jsx}`を除外する。旧dotfile除外も維持し、.storybookやJS設定を今回無断でlint対象に増やさない。既存の全262ファイルのリスト一致を検証する。
- parserは現行@typescript-eslint/parser。sourceType module、ecmaVersion2020。reportUnusedDisableDirectives error、inline disableの扱いは維持。既存test-setupの1つのdisableも有効性を確認する。
- globalsは旧ESLintから間接利用していた13.24.0を直接dev指定し、旧builtin/browser/es2020の実効定義826件（名前/readonly）が完全一致するよう維持する。当初候補17.13.0では定義差が生じるため、今回の設定互換を優先して採用しない。globalsデータ更新は監査6件の修正に不要。
- @eslint/jsは新たな直接指定を加えない。今回の明示ルール構成ではimportしないためで、ESLint自身の間接依存は通常解決のまま。
- 旧`@typescript-eslint/ban-types`は削除済みのため、`no-restricted-types`へ旧既定の禁止8型（String/Boolean/Number/Symbol/BigInt/Function/Object/{}）と修正候補を移す。新no-empty-object-typeの追加範囲（空interface等）は導入しない。
- `@typescript-eslint/no-loss-of-precision`は同じ検査のcore `no-loss-of-precision`へ置換する。
- 既定値変化を明示して旧動作を維持: unused-vars caughtErrors none、no-constant-condition checkLoops all、no-inner-declarations blockScopedFunctions disallow、no-shadow-restricted-names reportGlobalThis false。
- 旧no-var-requires、no-extra-semi、no-mixed-spaces-and-tabsは候補版でも利用可能なため維持する。deprecatedだが現メジャーで削除されていない。新no-require-imports等の広い範囲の検査へ無断で置換しない。

### source union化の具体範囲（2026-10-31承認）

- apiFetchDataState: state配列をApiFetchStateTypeのloading/fetching/refetching/success/error/idle unionへ、dataName配列をDataNameTypeの既存5値unionへ置換する。
- authCheckState: state配列を削除し、StateTypeをloading/success/error/idleのunionとする。旧RecoilState<string>から4状態へ限定する、承認済みの唯一の公開型変更。実使用中のauthCheckingStateは別atomであり変更しない。
- boolState: boolTypeName配列を削除し、AtomTypeを単一文字列literal IS_SCROLLへ。保存する値はbooleanを維持。
- elementSizeState: elementNameAndPosition配列を削除し、ElementNameAndPositionTypeを既存5値のunionへ。保存値number | undefinedは維持。
- modalState: modalNames配列を削除し、ModalNameTypeを既存4値のunionへ。各modalの開閉値はbooleanを維持。
- 型alias/export名、Recoil key/defaultは変更しない。authCheckStateの既存key重複は今回の対象外（質問への説明のみで変更依頼なし）。不要なunderscore付与・lint抑制は追加しない。

## Rationale

監査とツール保守の課題を解消しながら、新lint方針による広いアプリ修正を分離できる。現設定を機械的に新recommendedへ置換すると、検査追加と既定値の弱化が同時に生じる。実効ルール/対象一覧と正常・異常の小さなコード例を比較し、変更する点を明示した移行にする。

## Tasks

- [x] 旧実効ルール・262ファイル・既存disableを取得。
- [x] 公式migration/docs・候補packageの対応条件/ルール/既定値を確認。
- [x] 隔離コピーで新recommended、旧方針移行、rename込みの案を比較。
- [x] 最終候補の通常npm ci・実tree・lint/型検査・全依存/omit-dev監査を確認。
- [x] Reviewerによる設計案確認・必要な補正（補正後は問題なし・必須指摘なし）。
- [x] source5ファイル・6配列の直接文字列union化を含むユーザー実装承認。
- [x] union化へ改訂した設計のReviewer確認（問題なし・必須指摘なし）。
- [x] 実worktreeへ承認範囲を適用し、全件/coverage/build/UI等を検証。監査は同時点比較を記録し、新規配信のmoderate14件は残課題として分離。
- [x] 最終Reviewer確認（問題なし・必須指摘なし）。結果報告。
- [x] ユーザー依頼により第2段階の実装・検証記録を本書を含むコミットへ保存。

## Test Plan

- 調査済み: Node24.22.1/npm11.19.1の専用Docker、秘密設定を除いたコピー・専用volume。通常npm ciと実npm ls --all exit0。提案済みrename込みの`npm run lint`/tsc --noEmit成功。最終候補監査は全依存0/omit-dev0。force/legacy-peer/overrideなし。
- 旧262ファイルと新262ファイルのリストが完全一致。診断の増減は上記各案に分けて記録。
- 一時コード例22ケースでconsole、unused/_除外/catch、禁止型/許可型、定数条件、内側function、globalThis名、不要semi、混在indent、require、数値精度、Hooks/depsを新旧比較。ルール名置換を正規化後、診断のrule/severity/位置が一致。全面的な検査同値性を証明したものではない。
- private rename前後の公開8 exportをTypeScript TypeCheckerで比較して一致。authCheckStateはRecoilState<string>を維持。storyの未使用catch/未使用変数も追加probeし、通常258/story4の両実効設定でcaughtErrors noneを確認。
- 承認後: 実worktreeで通常npm ci/実treeとlintを先に確認。型検査/production build、52ファイル204件・識別子/skip維持、coverage207対象維持、Storybook build・Vitest UI・既存story表示を確認。
- 6配列の削除・union値をdiffとTypeCheckerで確認。authCheckState以外の公開型の一致、authCheckStateの4状態への限定、key/default/boolean値維持を確認。型定義を写す実行時テストは追加せず、型検査と既存204件で検証する。
- 本番assetを同じenvで比較し、差があれば説明。主要画面/合成APIのPC/SP確認、画面consoleと既存VoteIcon制限の区別、監査0と新規advisoryなしを確認。専用環境以外へ接続しない。
- 調査時点では第2段階の全件/coverage/build/画面は未検証だった。承認後に実worktreeで再検証し、結果を以下に記録。

## Risks

- explicitなルール一覧の保守が必要。次のlint方針更新では現在とのdiffを確認する。新recommended採用やdeprecatedルールの代替は別途判断する。
- 同じrule名でも新版の実装変更があり、22例と既存ソースの成功だけでは全コードの同値を保証しない。実装後の回帰・最終レビューで確認する。
- authCheckStateのみ承認済みの4状態への型限定がある。実際の認証画面で使うauthCheckingStateとの混同を避ける。その他の公開型は維持し、全件/build確認を行う。
- audit0は候補・実行時点の結果。将来の監査0やbackend監査0を保証しない。元環境統合やP4全体の完了判断は別段階。
- 実装範囲が増える場合は無断追加せず提案を更新する。

## References / Evidence

- https://eslint.org/docs/latest/use/migrate-to-10.0.0
- https://eslint.org/docs/latest/use/configure/migration-guide
- https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/
- https://typescript-eslint.io/rules/no-unused-vars/
- https://typescript-eslint.io/rules/no-restricted-types/
- https://react.dev/reference/eslint-plugin-react-hooks
- Git除外 `docker/db/backup/frontend-eslint10-design-p4i2-20261030/` に基点/候補の実効ルール・対象一覧・診断・既定値・22例比較・通常ci/tree・監査・型検査・候補manifest/lock/config・rename案diff・summary/hash manifestを保存。
- 関連: [第1段階の計画と結果](2026-10-30-frontend-eslint-babel-css.md)。

## Reviewer設計確認の補正

- 初回prototypeのstory overrideでunused-vars optionsを重複指定し、caughtErrors noneを継承できていない点を指摘。重複ruleを除去し、通常/story双方の実効設定とcatch/unused-localコード例を追加比較して補正。
- 補正後も対象262、警告/エラー0。22例の新旧診断と、対象5storeの公開8exportの型が一致。
- Reviewer最終評価は問題なし、実装承認前の必須指摘なし。旧ルール/対象/実効globals、renameと公開型維持、story補正、証跡52項目のhashを確認。全204件/coverage/build/画面確認は承認後の実装で行う。

## 2026-10-31の承認と改訂

- 型専用の値に対する警告の意味と公式推奨（型の直接定義）を説明し、ユーザーは全て文字列unionへ変更する方針を選択。旧underscore案は履歴として残し、上のDecision/Scopeを改訂。
- 旧prototypeの公開8export一致・22例・監査0等はrename案の調査結果であり、union実装の成功を示すものではない。実worktreeで改めて検証する。

## 2026-10-31の実装・検証結果

- ESLint10.13.0/TypeScript ESLint8.72.1/react-hooks7.1.1/react-refresh0.5.7と旧globals13.24.0を適用。package/lockはレビュー済み候補と一致、旧設定をapply_patchで削除しflat config/READMEへ移行。
- 型専用配列6つを削除し、直接の文字列literal/unionへ置換。5ファイル、保存するboolean/number値、key/default/export名は維持。authCheckStateのみ承認どおり4状態へ限定。使用中のauthCheckingStateは変更なし。
- 専用Node24.22.1/npm11.19.1、通常npm ci/実npm ls --all exit0。lintは警告/エラー0、対象262件維持、story/通常のcatch設定継承と22例の診断一致を確認。
- 全52ファイル204件成功、失敗/skip0、基点と全識別子・結果一致。coverage対象207件維持。型検査・本番build・Storybook build成功。
- TypeCheckerでauthCheckState以外の既存7exportの双方向代入互換を確認。authCheckStateのStateTypeを解決し、error/idle/loading/successの4値のみを確認。unionの表示順やalias名は互換判定に使わない。
- 同じAPI/titleの生成条件で本番JS/CSS/画像全6assetのhashは基点と完全一致。
- PC/SP390x844で一覧/login modal/詳細/予想modal選択・閉じる/管理フォーム必須validation・合成選手POST成功を確認。元DBと別の合成Laravel/SQLite APIを使用。画面console errorなし。
- Vitest UIは204pass/52files/0fail。StorybookのButton/PredictionVoteModal/ToastModal表示成功、VoteIcon単独storyのRecoilRoot不足は既知制限のまま。
- 監査は当初調査の0件と異なる。現在の同時点監査は更新前18（high6/moderate12）→更新後14（high0/moderate14）、omit-devは双方0。従来のhigh6経路は解消、新規advisory IDの追加は旧新lock比較では0。
- 現在のmoderateはGHSA-g3hv-75wg-m249（minimatch <11.0.1、修正11.0.1）とGHSA-3g3m-2fjr-6pw4（glob9〜14.0.1、修正14.0.2）の2advisoryと上位依存への波及。公式GHSAは2026-10-30に公開/更新された情報を確認。根拠は監査JSON・同時点基点監査・公式情報。旧調査0を現状0として扱わない。
- moderate件数12→14は、旧high分類の6 packagesが残存する別moderate advisoryの対象へ移ったこと、旧経路5 packagesの削除、新経路@eslint/config-arrayの1 package追加を合わせた結果。全件数は18→14で、既存high advisoryは解消、新旧advisory ID追加は0。コード互換の回帰ではないが、監査0の成功条件は未達。P4全体は未完了で、追加の依存更新方針を別途判断する。force/override/監査ignoreやnpm提案のStorybook大幅downgradeは適用しない。
- 証跡はGit除外 `docker/db/backup/frontend-eslint10-implementation-p4i2-20261031/`。ci/tree、全件/coverage、build2条件、lint/型/probe、画面、監査同時点比較、runtime log、summary/hash manifestを保存。合成DB/秘密鍵/資格情報は含めない。
- 最終Reviewer確認完了（問題なし・必須指摘なし）。候補と実効設定/依存の一致、全204件/coverage207/本番asset/証跡hash、監査同時点比較の帰属を確認。テストは保存証跡を評価し独立再実行なし。
- 検証Compose終了、volume/合成環境は保持。ユーザー依頼により本書を含むP4i-2保存コミットへ保存・元環境未統合。moderate14件が残るためP4全体は未完了。

### 追加の公式修正情報

- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
