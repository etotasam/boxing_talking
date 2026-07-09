# Header Redesign Admin Mobile Menu

## Goal

添付画像の PC / SP デザインに近いヘッダーへ段階的に変更する。

特に SP では通常ナビゲーションを `Schedule / Match Result` のタブとして表示し、ハンバーガーメニューは管理者ユーザーの場合だけ表示する。管理者向けの登録・編集ページリンクは、SP ではハンバーガーメニュー内に配置する。

## Background / Context

現在のヘッダーは `frontend/src/components/module/Header` 配下にまとまっている。

- `Header.tsx` は `deviceState` を見て、PC では `HeaderNavigation`、SP では `Hamburger` を表示している。
- `HeaderView.tsx` はヘッダー全体の高さ・背景・タイトル・ナビ・認証情報の配置を担当している。
- `HeaderNavigation.tsx` は `Schedule / Match Result` と、管理者なら `AdministratorPageLinks` を表示している。
- `Hamburger.tsx` は SP で常時表示され、現在は画面下中央に固定されている。
- `MenuModal.tsx` はハンバーガーから開くメニュー本体で、現在は一般リンクのみを表示している。
- `AdministratorPageLinks.tsx` は管理者リンク定義と PC 用アイコン表示を内包している。

添付 SP デザインでは、ヘッダー上段にロゴ・ユーザーアイコン・ハンバーガー、下段に `Schedule / Match Result` タブがある。現在の実装とは、SP の表示構造とハンバーガーの用途が異なる。

## Scope

### In Scope

- ヘッダーの PC / SP レイアウト調整。
- SP で通常ナビゲーションを表示する。
- SP のハンバーガーを管理者ユーザーだけに表示する。
- SP のハンバーガーメニューに管理者ページリンクを表示する。
- 管理者リンク定義を共通化し、PC アイコンリンクと SP メニューで使い回せるようにする。
- 関連するフロントエンドテストを追加・更新する。

### Out of Scope

- 管理者ページ自体の改修。
- バックエンドの認証・権限 API 変更。
- 試合カードや背景など、ヘッダー以外の添付画像再現。
- ログアウト処理やログインモーダルの仕様変更。
- 新しいルート追加。

## Impact Area

- `frontend/src/components/module/Header/Header.tsx`
- `frontend/src/components/module/Header/component/HeaderView.tsx`
- `frontend/src/components/module/Header/component/HeaderNavigation.tsx`
- `frontend/src/components/module/Header/component/Hamburger.tsx`
- `frontend/src/components/module/Header/component/HeaderAuthInfo.tsx`
- `frontend/src/components/module/AdministratorPageLinks.tsx`
- `frontend/src/components/modal/MenuModal.tsx`
- `frontend/src/constants/routePath.ts`
- `frontend/src/hooks/apiHooks/auth/useAdmin.ts`
- `frontend/src/store/deviceState.ts`
- `frontend/src/store/elementSizeState.ts`
- Header 関連テスト
  - `frontend/src/components/module/Header/__test__/Header.test.tsx`
  - `frontend/src/components/module/Header/__test__/HeaderNavigation.test.tsx`
  - `frontend/src/components/module/Header/__test__/HeaderAuthInfo.test.tsx`
- 必要に応じて `Hamburger` / `MenuModal` のテストを追加する。

API / DB / バックエンドの変更は想定しない。

## Options

### Option 1: 最小変更で既存構造に寄せる

`Header.tsx` の表示条件と各コンポーネントの className を調整し、既存の `AdministratorPageLinks` と `MenuModal` を大きく変えずに見た目を近づける。

メリット:

- 変更量が少ない。
- 既存テストの修正範囲を抑えやすい。

デメリット:

- 管理者リンク定義が PC / SP で分散しやすい。
- SP のハンバーガーメニューに管理者リンクを入れる際に重複が生まれやすい。
- 今後リンク追加時に更新漏れが起きやすい。

リスク:

- 表示は近づくが、構造上の負債が残る。

### Option 2: 管理者リンクを共通化して段階的に再構成する

管理者リンク定義を共通化し、PC ではアイコンリンク、SP ではハンバーガーメニュー内リンクとして表示する。通常ナビゲーションは PC / SP 共通で使える形に寄せる。

メリット:

- PC / SP でリンク追加・変更の更新箇所を揃えられる。
- 管理者限定表示の責務を整理しやすい。
- 段階ごとに見た目と挙動を確認しやすい。

デメリット:

- Option 1 より変更ファイルが増える。
- 既存テストの更新に加えて、メニュー表示条件のテスト追加が必要になる可能性がある。

リスク:

- 共通化の切り出し方によっては一時的に差分が大きく見える。

### Option 3: DesktopHeader / MobileHeader に分離する

PC と SP のヘッダーを別コンポーネントに分け、添付デザインに合わせてそれぞれ独立して実装する。

メリット:

- 画面ごとの JSX が読みやすくなる。
- PC / SP で大きく違うデザインに対応しやすい。

デメリット:

- 既存構造からの変更量が大きい。
- 共通処理の抽出設計が必要になり、今回の目的に対してやや過剰。

リスク:

- レイアウト以外の差分が増え、レビューしにくくなる。

## Decision

Option 2 を採用する。

## Rationale

今回の要件は単なる見た目変更ではなく、SP のハンバーガーを管理者専用にし、管理者向けの編集リンクをそこに配置するという権限表示の整理を含む。

Option 2 なら、PC では既存の管理者アイコンリンクを維持しつつ、SP では同じリンク定義をメニューに流用できる。リンク追加時の更新漏れを避けやすく、段階的に実装しても各段階でレビューしやすい。

Option 3 ほど大きく分離せず、既存の `Header` 周辺の責務を活かせるため、影響範囲と保守性のバランスがよい。

## Tasks

### Phase 1: 管理者リンク定義の共通化

- [x] `AdministratorPageLinks` 内の管理者リンク配列を共通利用できる場所へ切り出す。
- [x] PC の管理者アイコンリンクが既存通り表示されることを保つ。
- [x] 既存の `HeaderNavigation` テストを更新し、管理者リンクの表示条件を維持する。

確認観点:

- PC 管理者で登録・編集リンクが表示される。
- PC 非管理者で登録・編集リンクが表示されない。
- ルートパスは既存と変わらない。

### Phase 2: SP ヘッダー構造の整理

- [x] SP でも `Schedule / Match Result` の通常ナビゲーションを表示する。
- [x] SP のヘッダーを上段と下段に分ける。
- [x] `HeaderView` の SP 背景を添付画像に近い黒系へ変更する。
- [x] ヘッダー高さ変更が `elementSizeState('HEADER_HEIGHT')` 経由の main padding に反映されることを確認する。

確認観点:

- SP でタイトル、ユーザーアイコン、通常ナビが表示される。
- SP で現在ページのタブが黄色表示・下線表示になる。
- PC の通常ナビ表示が壊れない。

### Phase 3: SP 管理者ハンバーガーの表示条件と配置

- [x] SP のハンバーガーをヘッダー右上に配置する。
- [x] `useAdmin()` が `true` の場合だけ SP ハンバーガーを表示する。
- [x] `Hamburger` をクリック可能な `button` として扱い、アクセシブルネームを付ける。
- [x] 管理者判定のローディング中に大きなレイアウトシフトが起きないようにする。

確認観点:

- SP 管理者でハンバーガーが表示される。
- SP 非管理者でハンバーガーが表示されない。
- SP 管理者判定取得前後でヘッダー内要素が不自然に詰まらない。

### Phase 4: SP 管理者メニュー内容の変更

- [ ] `MenuModal` に管理者ページリンクを表示する。
- [ ] 非管理者の場合は、メニューが開いても管理者リンクを表示しない。
- [ ] メニューリンク押下時に既存通りメニューを閉じる。
- [ ] PC へ切り替わった時に既存通りメニューを閉じる。

確認観点:

- SP 管理者でボクサー登録・編集、試合登録・編集へ遷移できる。
- SP 非管理者で管理者リンクが表示されない。
- メニュー開閉・ページ遷移時の close 処理が維持される。

### Phase 5: PC ヘッダーの見た目調整

- [ ] PC のヘッダーを添付画像に近い黒系背景・ロゴ左寄せ・タブ中央寄せに調整する。
- [ ] 管理者アイコンリンク、ユーザー情報、ログアウトアイコンの配置を整理する。
- [ ] hover で大きく赤背景になる現状挙動を残すか削除するか、デザインに合わせて判断する。

確認観点:

- PC で通常ナビのアクティブ状態が画像に近い。
- PC 管理者リンクが右寄りのアイコン群として表示される。
- PC 非管理者で管理者リンクが表示されない。

### Phase 6: テスト・表示確認

- [ ] Header 系 unit test を更新・追加する。
- [ ] `Hamburger` の管理者表示条件とアクセシブルネームをテストする。
- [ ] `MenuModal` の管理者リンク表示条件をテストする。
- [ ] `cd frontend && npm test -- Header` を実行する。
- [ ] `cd frontend && npm run lint` を実行する。
- [ ] 可能なら `cd frontend && npm run build` を実行する。
- [ ] 必要に応じてローカル表示で PC / SP 幅を確認する。

## Test Plan

追加・更新するテスト:

- `Header.test.tsx`
  - PC で通常ナビと認証情報を表示する。
  - SP で通常ナビを表示する。
  - SP 管理者でハンバーガーを表示する。
  - SP 非管理者でハンバーガーを表示しない。

- `HeaderNavigation.test.tsx`
  - `Schedule / Match Result` のリンク先を保証する。
  - PC 管理者リンクの表示・非表示を保証する。
  - アクティブリンクの className 変更が必要なら期待値を更新する。

- `Hamburger` のテストを追加する場合
  - ボタンとして認識できる。
  - クリックで `useMenuModal().toggle` が呼ばれる。
  - アニメーション中の二重クリック防止は既存仕様として維持する。

- `MenuModal` のテストを追加する場合
  - 管理者なら管理者ページリンクを表示する。
  - 非管理者なら管理者ページリンクを表示しない。
  - リンククリックでメニューを閉じる。

実行するコマンド:

- `cd frontend && npm test -- Header`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

テスト実行できない場合は、失敗理由と未確認範囲を報告する。

## Risks

- `useAdmin()` は API 結果取得まで `isAdmin` が `undefined` になるため、SP ハンバーガーの表示が遅れて見える可能性がある。
- SP ヘッダーを 2 段にするとヘッダー高さが変わり、ページ本文の `paddingTop` に影響する。
- `MenuModal` は現在グローバルにマウントされているため、ボタン側だけでなくメニュー側でも管理者判定を行わないと表示責務が弱くなる。
- `Hamburger` の現在位置が画面下中央固定のため、ヘッダー内配置に変えるとアニメーションや z-index の調整が必要になる。
- `AdministratorPageLinks` は現在 `<Link><button /></Link>` 構造のため、触る場合はリンク自体をボタン風にする改善を同時に検討する。
- PC の hover でヘッダー背景が赤く広がる現状挙動は添付画像と異なる。残すか削除するかで印象が変わる。
