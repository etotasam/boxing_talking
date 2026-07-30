# Replace Flag SVG Assets With React Components

## Goal

既存の国旗 SVG アセット import 方式を、React で扱える国旗コンポーネント方式へ移行する。
表示側の API はできるだけ維持し、利用箇所の変更を最小化する。

## Background / Context

現在は `frontend/src/utils/nationalFlag.ts` で国ごとの SVG ファイルを import し、`getNationalFlag(country)` が画像 URL を返している。
`frontend/src/components/atomic/FlagImage.tsx` はその URL を `<img src={...}>` に渡して表示している。

対象国は `frontend/src/constants/country.ts` の `COUNTRY` 定数で管理されており、値は `Japan`, `USA`, `SouthAfrica` など独自のアプリ内表現になっている。
一方、React 向け国旗パッケージは基本的に ISO 3166-1 alpha-2 コード、例: `JP`, `US`, `ZA` を前提にする。

`react-icons` は既に依存に含まれているが、国旗アイコンは提供していないため今回の用途には適さない。
候補としては `country-flag-icons` が有力。Context7 のドキュメント上でも `country-flag-icons/react/3x2` および `country-flag-icons/react/3x2/US` のような個別 import が確認できる。

## Scope

### In Scope

- `country-flag-icons` をフロントエンド依存に追加する。
- `COUNTRY` の値を ISO コードへ変更せず、アプリ内の既存 `CountryType` は維持する。
- `COUNTRY` から国旗 React コンポーネントへのマッピングを追加する。
- `FlagImage` の props 互換性を維持し、既存利用箇所の変更を最小化する。
- 既存のローカル国旗 SVG import を廃止する。
- 表示崩れを避けるため、現在の `className` 指定、サイズ指定、枠線指定の挙動を維持する。
- `FlagImage` の公開される表示仕様をコンポーネントテストで保証する。

### Out of Scope

- `COUNTRY` の値を ISO コードへ全面変更する。
- バックエンドの国コード仕様を変更する。
- 国籍選択 UI や国名ラベルの仕様変更。
- 未使用 SVG アセットの削除。実装後に安全確認できれば別途提案する。
- 国旗デザイン自体のカスタマイズ。

## Impact Area

- `frontend/package.json`
- `frontend/package-lock.json` または使用中のロックファイル
- `frontend/src/components/atomic/FlagImage.tsx`
- `frontend/src/utils/nationalFlag.ts`
- 必要に応じて `frontend/src/constants/` 配下に国旗マッピング定数を追加
- `FlagImage` を利用する画面・コンポーネント
  - `EngNameWithFlag`
  - `MatchInfo`
  - `PredictionVoteModal`
  - `BoxerSummary`
  - `MatchMeta`
  - その他 `FlagImage` 利用箇所

## Options

### Option A: `country-flag-icons` の React コンポーネントへ移行する

変更方針:

- `country-flag-icons` を追加する。
- `COUNTRY` ごとに `JP`, `US`, `ZA` などの国旗コンポーネントを対応付ける。
- `FlagImage` は `<img>` ではなく選択された React コンポーネントを render する。
- `FlagImage` の `nationality` / `className` は維持する。
- 国旗コンポーネントの対応表は `Record<CountryType, FlagComponent>` 相当の型で定義し、国追加時のマッピング漏れを TypeScript で検出できる構造にする。

メリット:

- ローカル SVG import の羅列を削減できる。
- 新しい国を追加するときの作業が、マッピング追加中心になる。
- React コンポーネントとして扱えるため、className や title を直接渡せる。
- 個別 import を使えば不要な国旗まで bundle に入りにくい。

デメリット:

- 新規依存が増える。
- 国旗パッケージの見た目に差し替わるため、既存 SVG と細部が変わる可能性がある。
- `UK` は ISO 上は通常 `GB`、`PuertoRico` は `PR` など、アプリ内表現との対応表が必要。

リスク:

- import パスや型定義が bundler / TypeScript 設定と合わない場合、build で検出される。
- SVG の viewBox / aspect ratio の差により、既存表示サイズに微妙な差が出る可能性がある。

### Option B: 既存 SVG を維持し、`nationalFlag.ts` だけ map 化する

変更方針:

- 依存は追加しない。
- 既存 SVG import はそのまま使い、if 文を `Record<CountryType, string>` に置き換える。

メリット:

- 見た目が変わらない。
- 依存追加がない。
- 変更リスクが小さい。

デメリット:

- 「React で使える icon にする」という目的は満たさない。
- SVG アセット管理の手間は残る。
- 国追加時に SVG ファイル調達が必要。

リスク:

- 根本的な改善ではなく、整理に留まる。

### Option C: `flag-icons` の CSS/SVG クラス方式へ移行する

変更方針:

- `flag-icons` を追加し、CSS class で国旗を表示する。

メリット:

- 国旗ライブラリとして実績がある。
- CSS class ベースで表示できる。

デメリット:

- React コンポーネントとしての扱いやすさは Option A より弱い。
- CSS import と class 組み立てが必要になり、型安全性が下がる。
- 既存 Tailwind class と責務が混ざりやすい。

リスク:

- 表示制御が CSS 依存になり、コンポーネント単位のテスト・保守性が下がる。

## Decision

Option A の `country-flag-icons` React コンポーネント方式を採用する。

## Rationale

今回の目的は「国旗を React で使える icon / component として扱う」ことなので、既存 SVG 整理だけの Option B は目的に対して弱い。
Option C は国旗ライブラリとしては有効だが、React コンポーネントとして扱う観点では Option A の方が素直。

`country-flag-icons` は React 向け subpackage を持ち、個別 import が可能なため、既存の `FlagImage` コンポーネントに閉じ込めて移行できる。
`COUNTRY` の値を変えない方針にすることで、検索フォーム、API パラメータ、既存テスト、バックエンドとの整合性への影響を避ける。

## Tasks

- [x] `frontend` に `country-flag-icons` を追加する。
- [x] `COUNTRY` から国旗コンポーネントへの対応表を作成する。
  - `Record<CountryType, FlagComponent>` 相当の型を使い、全 `CountryType` の網羅性を TypeScript で保証する。
  - `Japan` -> `JP`
  - `Mexico` -> `MX`
  - `USA` -> `US`
  - `Kazakhstan` -> `KZ`
  - `UK` -> `GB`
  - `Russia` -> `RU`
  - `Philippines` -> `PH`
  - `Ukraine` -> `UA`
  - `Canada` -> `CA`
  - `Venezuela` -> `VE`
  - `SouthAfrica` -> `ZA`
  - `China` -> `CN`
  - `PuertoRico` -> `PR`
  - `SaudiArabia` -> `SA`
  - `Ghana` -> `GH`
  - `Australia` -> `AU`
  - `Uzbekistan` -> `UZ`
  - `Argentina` -> `AR`
  - `Ireland` -> `IE`
  - `Thailand` -> `TH`
- [x] `FlagImage` を `<img>` から国旗 React コンポーネント render に変更する。
- [x] `FlagImage` の `nationality` / `className` props は維持する。
- [x] SVG 化後も既存の表示指定が効くようにする。
  - wrapper の `className` は維持する。
  - 実際に表示される国旗 SVG には `h-full w-full object-cover` 相当の class を付与する。
  - 既存利用箇所の `h-*`, `w-*`, `border-*`, `shrink-0` が引き続き効く構造にする。
- [x] アクセシビリティ属性を明示し、国名情報が失われないようにする。
  - `role="img"` と `aria-label={nationality}`、またはライブラリの `title` prop を使う。
  - 既存 `<img alt={nationality}>` と同等に、国名がアクセシブルに取得できる状態を維持する。
- [x] `nationalFlag.ts` の責務を見直す。
  - URL 取得関数を廃止するか、React コンポーネント取得関数に置き換える。
  - 未使用になった `formatPosition` は利用状況を確認し、未使用なら削除候補にする。
- [x] 既存 SVG アセットは今回の実装では削除しない。実装後に未参照確認を行い、削除は別途承認を取る。
- [x] `FlagImage` のコンポーネントテストを追加する。
  - 代表国が描画されることを確認する。
  - `className` が反映されることを確認する。
  - 国名情報がアクセシブルに取得できることを確認する。

## Test Plan

- `cd frontend && npm run lint`
  - import、未使用変数、型違反、既存 ESLint ルール違反がないことを確認する。
- `cd frontend && npm run build`
  - TypeScript と Vite build が `country-flag-icons` の import を解決できることを確認する。
- `FlagImage` のコンポーネントテストを追加・実行する。
  - `COUNTRY.JAPAN`, `COUNTRY.USA`, `COUNTRY.UK` など代表国が描画されることを保証する。
  - `className` が wrapper または実表示要素へ反映され、既存サイズ指定が効くことを保証する。
  - `aria-label` または `title` により、国名情報がアクセシブルに取得できることを保証する。
  - `Record<CountryType, FlagComponent>` 相当の型により、マッピング漏れが TypeScript で検出されることを build で保証する。

## Risks

- `country-flag-icons` の国旗デザインが既存 SVG と完全一致しない可能性がある。
- 既存の `<img alt>` から SVG コンポーネントへ変わるため、アクセシビリティ属性の扱いを実装時に確認する必要がある。
- 国コード対応表を間違えると別国の国旗が表示される。特に `UK -> GB`, `SouthAfrica -> ZA`, `SaudiArabia -> SA`, `PuertoRico -> PR` は注意する。
- `COUNTRY.UK` / `イギリス` の表示は維持しつつ、国旗コンポーネントは `GB` を使う。UI 表記と国旗コードの差異は仕様として許容する。
- 依存追加により lockfile が更新される。
