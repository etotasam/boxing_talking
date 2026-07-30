# Admin User Header Navigation Redesign

## Goal

添付デザインB案と確認済みUIモックに沿って、ヘッダーをユーザー権限とデバイスだけで切り替える構成へ改修する。

- adminユーザーのPCは、上段80px・下段約52pxの2段ヘッダーにする。
  - 上段は現行PCの通常導線を維持し、サイトタイトル、`Schedule`、`Match Result`、ユーザー情報、ログアウトを表示する。
  - 下段は4件の管理リンクをB案の等幅カード列で常設し、現在ページを黄色で強調する。
- adminユーザーのSPは、既存の2段ヘッダーを維持する。
  - 下段には4件の管理リンクを横並びで常設する。
  - 共通リンク（`Schedule`、`Match Result`）は下段末尾の「一般ページ」アコーディオンから表示する。
- non-adminユーザーは、PC/SPとも既存の共通リンク中心のヘッダーを維持し、管理リンクを一切表示しない。

PC管理ポップオーバーは新構成で一切描画しない。adminは常設の管理リンクを使い、non-adminには管理機能を表示しない。

本書は、同じファイル名で作成していた「管理ページのときだけPCを2段化する」計画を、この権限ベースの方針へ置き換えるものである。実装はユーザー承認後に行う。

## Background / Context

現在の共通`Header`は、PCでは80pxの1段に通常ナビ、PC管理ポップオーバー、認証情報を置き、SPでは70px＋56pxの2段に通常ナビとSP管理ポップオーバーを置く。`AdminMenuPopover`と`SpAdminMenuPopover`は内部で`useAdmin()`を参照し、管理者だけに4リンクを表示する。

新しいUIでは、管理リンクを「管理ページだけ」の導線ではなく、adminユーザーの恒常的な主導線として扱う。このため、ヘッダーの構成判定に現在のURLは使わず、`deviceState`と`useAdmin().isAdmin`だけを使う。URLは管理リンクの現在地強調にのみ使う。

`useHeaderHeightRef`は直近コミット`30a4361`で共通`header`のborder box高を`ResizeObserver`で監視し、`elementSizeState('HEADER_HEIGHT')`へ実測値を共有するようになった。adminのPCヘッダーが約132pxへ増えても、`AdminLayout`を含む既存の購読側は実測値を`paddingTop`に使うため、本文位置は自動追従できる。ただし、管理画面内にヘッダー基準の固定sticky offsetを持つ`MatchRegister`と`MatchEdit`は、古い80px前提の数値を`HEADER_HEIGHT`へ置換する必要がある。`BoxerEdit`の`top-[30px]`は独立したscrollコンテナ内のローカル余白であり、変更しない。SPのアコーディオンは既存SP管理ポップオーバーと同様にヘッダー外へ重ねて表示し、固定ヘッダーの高さ126pxを変えない。

`deviceState`は現在、幅が`768px`ちょうどのときSPを設定する一方、Tailwindの`pc:`は768pxから有効である。PC/SPだけで明確に分ける今回の方針では、この境界を`768px以上 = PC`へ統一する必要がある。

### Existing plans and worktree protection

- 本書は`docs/plans/2026-07-30-admin-page-pc-two-row-header.md`を更新する。過去の「管理ページのパスでPC2段化する」決定、PCの「その他ページ」案、末尾スラッシュを含むパスでヘッダーモードを切り替える設計は採用しない。
- `docs/plans/admin-navigation-popover.md`と`docs/plans/header-redesign-admin-mobile-menu.md`は、現在のポップオーバー構成に至る過去計画である。リンク定義の共通化とSPアコーディオンのアクセシビリティ方針は参照するが、表示の主従は本計画で反転する。
- `docs/plans/header-navigation-context-refactor.md`は削除済みで存在しない。
- 未コミットの`.serena/project.yml`と`frontend/src/components/module/Header/component/AdminMenuPopover.tsx`は無関係なユーザー変更である。前者は変更しない。後者は新構成では参照しないが、削除・編集・整形しない。実装開始前に両ファイルのSHA-256を記録し、実装後も一致することを確認する。全体フォーマットおよび自動fixコマンドは実行しない。

## Scope

### In Scope

- `isAdmin === true`のときだけ、PCを2段、SP下段を管理リンク中心に切り替える。
- PC adminの上段に既存の通常ナビを残し、PC管理ポップオーバーを描画しない。
- PC adminの下段に、アイコン・ラベル付きの4等分管理カードをB案風に表示する。
- SP adminの下段に、4管理リンクと「一般ページ」アコーディオンボタンを`grid-cols-5`で5等分表示する。各セルは幅・高さとも44px以上（320px幅では実測約64px × 56px）とし、管理リンクは20px以上のアイコンと`clamp(9px, 2.7vw, 12px)`相当のラベルを縦積みで表示する。各ラベルは省略せず、320px級でセル内に収める。PC/SP以外の表示モードは導入しない。
- SP adminの「一般ページ」アコーディオンに、共通リンク2件を縦リストで表示する。開閉、Esc、外側タップ、リンク遷移時のclose、`aria-expanded`、`aria-controls`、退出中の`inert`／ポインター抑止を既存SPポップオーバーと同水準で提供する。Escで閉じる場合は、開いていたリンクからトリガーボタンへフォーカスを戻す。
- non-adminのPCは現行の80px・通常ナビ・認証情報の構成を保ち、non-adminのSPも現行の通常ナビを保つ。
- `useAdmin`がReact Queryの`isFetching`を公開し、admin UIの表示条件を`isAdmin === true && !isFetching && !isError`とする。再取得中・再取得失敗・logout直後は、キャッシュ済みのtrueを表示に使わない。
- `useInitializeDevice`を`width >= DEVICE_BREAKPOINT.pc`へ修正し、768pxをPCとする。全`deviceState`購読者（試合表示、投票、コメント、ヘッダーを含む）が768pxでPC表示へ切り替わる影響を確認する。
- 共通リンク定義を再利用可能な定数へ切り出し、PC通常ナビとSP一般ページアコーディオンのリンク先・表示名を一元管理する。
- 未参照の`AdministratorPageLinks.tsx`を、実装直前の参照確認後に削除する。
- Header、管理リンク、SP一般ページアコーディオン、デバイス境界のテストを追加・更新する。

### Out of Scope

- 管理画面のルート、認可、API、DB、ログアウト処理の変更。
- non-adminに管理リンクまたは管理メニューを表示すること。
- PCで共通リンクをアコーディオンへ移すこと。admin PCも上段の通常ナビを維持する。
- SPのヘッダーを3段以上にすること、またはSPで横スクロールするナビゲーションを導入すること。
- `AdminMenuPopover.tsx`の未コミット変更を含む編集・削除。
- `HEADER_HEIGHT`の購読方式、`useHeaderHeightRef`自体、`AdminLayout`以外のレイアウトのリファクタリング。
- 新規ルート、追加の管理リンク、アイコンライブラリ、バックエンド変更。

## Impact Area

| 区分 | 対象 | 実装時の対応 |
| --- | --- | --- |
| 権限・構成選択 | `frontend/src/components/module/Header/Header.tsx` | `useAdmin()`を一度だけ呼び、`isAdmin === true && !isFetching && !isError`のfail-closed条件でPC/SP用のadminスロットを選ぶ。URLでヘッダー形状を分岐しない。PCでは`AdminMenuPopover`を一切描画しない。 |
| 管理者判定 | `frontend/src/hooks/apiHooks/auth/useAdmin.ts` | `isFetching`を呼び出し元へ公開し、キャッシュ済みtrueの再取得中・失敗時を含めてfail-closedにadmin UIを隠せるようにする。 |
| ヘッダー構造 | `frontend/src/components/module/Header/component/HeaderView.tsx` | PC non-adminの1段80px、PC adminの80px＋52px、SPの70px＋56pxを明示的に描画する。PC admin上段には通常ナビを渡し、下段には管理ナビを渡す。 |
| 共通リンク定義 | `frontend/src/constants/commonPageLinks.ts`（新規候補）、`HeaderNavigation.tsx` | `Schedule`と`Match Result`の定義を一元化し、PC/SP通常ナビとSP一般ページアコーディオンで使う。 |
| PC管理リンク | `frontend/src/components/module/Header/component/PcAdminPageNavigation.tsx`（新規候補） | `AdminPageLinkList`と`AdminPageLinkIcon`を再利用し、4等分カード、黄色の現在地表示、keyboard focusを実装する。 |
| SP管理リンク | `frontend/src/components/module/Header/component/SpAdminPageNavigation.tsx`（新規候補） | 4リンクを下段内で横並びにし、アイコン＋短いラベルを縦方向に配置する。`aria-current`と各リンクのアクセシブルネームを維持する。 |
| SP一般ページアコーディオン | `frontend/src/components/module/Header/component/SpCommonMenuPopover.tsx`（新規候補） | 既存`SpAdminMenuPopover`の開閉・退出保護パターンを共通リンク向けに置換する。管理者判定は持たず、admin時に`Header`からのみ描画する。 |
| 既存SPポップオーバー | `frontend/src/components/module/Header/component/SpAdminMenuPopover.tsx` | 新規実装と重複するため、承認後に削除する。対応するテストも置換する。 |
| 共通管理リンク | `frontend/src/components/module/AdminNavigation.tsx` | `AdminPageLinkList`のリンク定義・権限保護・現在地属性を再利用する。PC/SP専用の見た目をclassNameとrender callbackに閉じ込め、既存APIを不要に拡張しないことを優先する。 |
| 不要コード | `frontend/src/components/module/AdministratorPageLinks.tsx` | 実参照がないことを再確認して削除する。 |
| 保護対象 | `frontend/src/components/module/Header/component/AdminMenuPopover.tsx` | 新規ヘッダーから参照しないが、未コミット変更を守るため本タスクでは触らず残す。 |
| PC/SP境界 | `frontend/src/hooks/useInitializeDevice.ts` | 768pxをPCとして設定し、Tailwindの`pc: 768px`と一致させる。 |
| 高さ共有 | `frontend/src/components/module/Header/hooks/useHeaderHeightRef.ts`、`frontend/src/layout/AdminLayout.tsx` | コード変更不要。admin PCの2段ヘッダーも実測高を既存購読側へ配布する。 |
| 管理画面内sticky | `frontend/src/page/Admin/MatchRegister.tsx`、`frontend/src/page/Admin/MatchEdit.tsx` | `top-[10px]`、`top-[100px]`の80px前提offsetを、既存の`HEADER_HEIGHT`を使うstyleへ置換し、2段ヘッダーと重ならないようにする。`BoxerEdit`はすでに一覧側で`HEADER_HEIGHT`を使い、編集側の`top-[30px]`はローカル余白のため変更しない。 |
| deviceState購読者 | `MatchResult`、`MatchCard`、`Matches`、`VoteIcon`、`PostCommentContainer`、試合詳細の`BoxerInfo`、Header関連 | コード変更の有無を確認し、768pxでSP/PC表示が矛盾しないことをスモーク確認する。 |
| テスト | Header、HeaderNavigation、AdminNavigation、SPポップオーバー、`useInitializeDevice`のテスト | 権限・デバイス別の公開挙動、開閉アクセシビリティ、境界、実測高連携を保証する。 |

## Removal / Retention Inventory

実装完了後に、旧ポップオーバー構成が意図せず残らないよう、次の棚卸しを実施する。

| 現在の要素 | 判断 | 実装時の扱い・確認 |
| --- | --- | --- |
| `SpAdminMenuPopover.tsx` | 削除 | SP adminで管理リンクを下段へ常設するため役割がなくなる。共通リンク向けの`SpCommonMenuPopover`へ置換する。 |
| `SpAdminMenuPopover.test.tsx` | 削除 | 削除する実装だけを検証しているため、`SpCommonMenuPopover.test.tsx`へ置換する。開閉・Esc・外側タップ・リンク遷移・フォーカス復帰を新しい公開仕様として検証する。 |
| `AdministratorPageLinks.tsx` | 削除 | 実行コードとテストから参照がないことを確認済み。管理リンクは`AdminPageLinkList`へ集約済みのため、重複UIを残さない。 |
| `AdminMenuPopover.tsx` | 保留・非参照 | Headerからimport・描画を外すため新構成では未使用になる。ただし未コミットのユーザー変更を保護する制約により、本タスクでは編集・削除しない。 |
| `AdminMenuPopover.test.tsx` | 保留 | 保護対象コンポーネントを残す間は、その既存振る舞いを検証するテストも残す。コンポーネント削除は、ユーザー差分が解消された後の別タスクでテストと同時に行う。 |
| `AdminMenuButton` | 保留 | 新しいHeaderでは使わないが、保護対象の`AdminMenuPopover.tsx`がimportしているため削除しない。将来のPCポップオーバー削除と同じ変更で安全に除去する。 |
| `AdminPageLinkList`、`AdminPageLinkIcon`、`ADMIN_PAGE_LINKS` | 維持 | 新しいPC／SP常設管理ナビで再利用する。管理リンクの定義、権限保護、現在地属性を一元化し続ける。 |
| `HeaderNavigation.tsx` | 維持・共通リンク定義へ移行 | PC admin/non-adminとSP non-adminで使い続ける。`Schedule`と`Match Result`のデータだけを新しい共通定数へ切り出す。 |
| `Header.test.tsx`の旧ポップオーバーmock・期待値 | 置換 | `AdminMenuPopover`と`SpAdminMenuPopover`のHeader経由の期待値を削除し、新しいPC／SP admin構成と`SpCommonMenuPopover`の期待値に置換する。 |
| `HeaderDeviceSwitch.test.tsx`の旧SPメニュー期待値 | 置換 | 旧`SpAdminMenuPopover`と「管理メニューを開閉」への依存を外す。SP adminで開いた「一般ページ」アコーディオンがSP→PC→SPの切替後に閉じた状態へ戻ることを検証する。 |

削除前には`rg`で実行コード・テスト・importを再確認する。保護対象を除く削除後は、`rg`で旧SPポップオーバーと`AdministratorPageLinks`の参照がテストを含めて0件であること、`npm test -- --run`と`npm run build`で未解決importがないことを確認する。

## Options

### Option 1: 管理ページのURLにいるときだけ2段化する

adminでも通常ページは現行PCヘッダーにし、`/admin/*`だけ下段を追加する。

メリット:

- 通常ページでは現在のヘッダー高を維持できる。

デメリット・リスク:

- 同じadminユーザーでも画面遷移ごとにヘッダーの構成が変わり、導線の一貫性がない。
- URL判定、末尾スラッシュ、リダイレクトなど、UI構成と関係のない分岐を増やす。

### Option 2: adminユーザーはデバイスごとに一貫した構成を使う（採用）

adminであればページに関係なく、PCは通常リンクを持つ上段＋常設管理リンク下段、SPは常設管理リンク下段＋共通リンクアコーディオンを使う。non-adminは現行の共通リンク構成を使う。

メリット:

- 判定が`isAdmin`とPC/SPだけになり、ヘッダーの責務が明快になる。
- adminの管理画面・通常画面間でナビゲーション構造がぶれない。
- PCでは通常リンクも常に視認でき、SPでは管理操作を最短1タップにできる。

デメリット・リスク:

- admin判定の取得完了後、PCでは80pxから132pxへの高さ変化が起きる。
- SPの下段に5項目を収めるため、ラベルをコンパクトに設計する必要がある。

### Option 3: adminのPC/SPとも通常リンクと管理リンクを同じ段に置く

現行の1段PCやSP下段に、通常リンクと管理リンクをすべて横並びにする。

メリット:

- アコーディオンが不要である。

デメリット・リスク:

- PCでB案の2段構成を満たさず、SPでは6項目が競合する。
- 画面幅に応じた別メニューや横スクロールが必要になり、PC/SPだけで済ませる意図に反する。

## Decision

Option 2を採用する。

`useAdmin`はReact Queryの`isFetching`を公開する。`Header`と管理リンクUIは`isAdmin === true && !isFetching && !isError`をadmin構成の条件とする。これにより、初回取得中だけでなく、logout後のADMIN query再取得中・再取得失敗時も、キャッシュ済みのtrueを使って管理リンクを残さない。admin判定が確定してから2段PCまたはSP管理下段に切り替わるが、共通`header`の`ResizeObserver`が実測高を配布するため、本文の余白は追従する。

PC adminは、上段80pxに現行の`HeaderNavigation`をそのまま保持する。右側は既存の`HeaderAuthInfo`を使い、PC管理ポップオーバーは描画しない。下段52pxは`nav aria-label="管理ページ"`とし、`ADMIN_PAGE_LINKS`の4件を等幅カードで並べる。リンクはアイコンとラベルを持ち、現在地には黄色の背景と黒文字、非現在地には暗色背景・白文字、すべてに明確なfocus-visible状態を与える。

SP adminは、既存の70px上段を維持する。56px下段を`grid-cols-5`で5等分し、先頭4枠に`ADMIN_PAGE_LINKS`をアイコン＋ラベルの縦積みリンクとして表示し、最後の1枠を「一般ページ」ボタンにする。320pxで各セルは約64px × 56pxとなるため、44px以上のタップ領域を満たす。アイコンは20px以上、ラベルは`clamp(9px, 2.7vw, 12px)`相当とし、省略せずセル内へ収める。これにより、追加の画面種別・横スクロール・「その他管理」メニューを導入しない。一般ページボタンは、ヘッダー直下に全幅パネルとして`Schedule`と`Match Result`を縦に展開する。リンククリック、外側タップ、再押下で閉じる。Escで閉じるときはトリガーへフォーカスを戻し、閉じる最中は操作・支援技術の対象から外す。

non-adminは`HeaderView`のadmin用スロットを受け取らず、PCは既存1段、SPは既存の2リンク下段を描画する。管理リンクの防御的な表示判定も、`useAdmin`のfail-closed条件に揃える。認可の実体は既存`AdminOnly`のままとする。

現在の`SpAdminMenuPopover`は共通リンク用の`SpCommonMenuPopover`に置換する。PCの`AdminMenuPopover.tsx`はユーザーの未コミット変更を保護するため、Headerからのimport／描画だけを外し、ファイル自体は編集・削除しない。

## Rationale

- ユーザーが求めた「PC/SPだけ」の構成切替に、admin/non-adminの権限表示だけを重ねる最小限の設計である。
- PC adminでも現行の通常リンクを上段に残すため、通常ページへの導線を失わない。
- B案の視認性を管理リンク下段へ適用し、adminの主要操作を常に1クリックで行える。
- SPでは優先度を反転し、管理リンクを常設、共通リンクを必要時のみアコーディオンへ収められる。
- 既存の`ResizeObserver`による実測高共有、`ADMIN_PAGE_LINKS`の単一定義、ポップオーバーのアクセシビリティ実装を再利用できる。
- 管理ページURLによるヘッダー形状の切替をなくし、パス判定の境界リスクを削減する。

## Tasks

- [x] 実装開始直前に`git status --short`と`git diff --check`を記録し、Plan Document以外の既存差分を特定する。`.serena/project.yml`と`AdminMenuPopover.tsx`のSHA-256を記録し、実装後も一致することを確認する。全体フォーマットおよび`--fix`は実行しない。
- [ ] `useAdmin`から`isFetching`を返し、Headerと管理リンクの表示条件を`isAdmin === true && !isFetching && !isError`へ統一する。初回取得、cached trueの再取得中、再取得失敗、logout成功直後をテストする。
- [ ] `useInitializeDevice`を768px以上でPCとする判定へ更新し、テストを追加する。
- [x] 共通リンク定義を切り出し、`HeaderNavigation`とSP一般ページアコーディオンで共有する。
- [x] `Header`で`useAdmin()`を利用して、PC/SPのadminスロットとnon-adminスロットを明示的に選ぶ。PC管理ポップオーバーのimport・描画を外す。
- [x] `HeaderView`をPC admin用の2段、PC non-admin用の1段、SP admin用の管理下段、SP non-admin用の通常下段として整理する。
- [x] PC用とSP用の常設管理リンクコンポーネントを追加し、`AdminPageLinkList`・`AdminPageLinkIcon`・`ADMIN_PAGE_LINKS`を再利用する。
- [x] `SpAdminMenuPopover`を削除し、共通リンク用の`SpCommonMenuPopover`へ置換する。開閉・退出時のアクセシビリティ保護を維持する。
- [x] `MatchRegister`と`MatchEdit`のヘッダー基準sticky offsetを既存`HEADER_HEIGHT`ベースへ置換し、PC adminの132pxヘッダー下で重ならないようにする。`BoxerEdit`のローカル`top-[30px]`は変更しない。
- [x] 未参照の`AdministratorPageLinks.tsx`を参照確認後に削除する。保護対象の`AdminMenuPopover.tsx`には触らない。
- [x] Header、管理ナビ、SP一般ページアコーディオン、デバイス境界のユニットテストを追加・更新する。`HeaderDeviceSwitch.test.tsx`は、SP adminの一般ページアコーディオンがSP→PC→SPで閉じることを検証する仕様へ置換する。
- [ ] Vitest、lint、production buildを実行する。Vitest（46 files / 166 tests）、lint、production build（tsc + vite build）は成功。Cypress specは固定アカウント/API依存を除き、`/api/user`・`/api/admin`・一覧APIをinterceptするfixture相当へ更新したが、Cypress 13.17.0バイナリがmacOS arm64で必須依存ライブラリ不足によりSIGABRTとなり実行不可。したがって実ブラウザでPC admin／PC non-admin／SP admin／SP non-admin、767px・768px・769px、320pxセル寸法・ラベル非省略・一般ページパネル上端、768px通常試合ページの確認は未実施。
- [ ] 実装後にReviewer subagentで差分、仕様、テスト、保護対象の不変性をレビューする。

## Test Plan

テストでは実装のclass名ではなく、ユーザーから見える表示・操作を保証する。

- PC adminでは、通常リンク、ユーザー情報、ログアウト、4管理リンクを表示し、PC管理メニュー開閉ボタンを表示しない。ヘッダーは2段構成である。
- PC non-adminでは、通常リンク、ユーザー情報、ログアウトを表示し、管理リンク・管理メニュー開閉ボタン・2段目を表示しない。
- SP adminでは、下段に4管理リンクと「一般ページ」ボタンを表示する。一般ページボタンを押すと`Schedule`と`Match Result`を表示し、再押下、Esc、外側タップ、リンク遷移で閉じる。開閉状態を`aria-expanded`で伝え、退出中はリンクを操作・フォーカスできない。
- SP non-adminでは、現行どおり`Schedule`と`Match Result`を下段に表示し、管理リンクと一般ページアコーディオンを表示しない。
- SP adminで開いた一般ページアコーディオンは、PCへ切り替えた時点でアンマウントされ、SPへ戻っても閉じた状態である。
- adminリンク4件は既存のURLに遷移し、現在ページだけに`aria-current="page"`を設定する。
- `useAdmin()`が未確定・エラー・falseの間に管理リンクを描画しない。cached trueの再取得中・再取得失敗・logout成功直後にも、管理リンクを描画しない。trueかつ取得完了へ確定後にだけadmin構成へ切り替わる。
- `useInitializeDevice`は767pxでSP、768pxと769pxでPCを設定する。
- `useHeaderHeightRef`の既存統合テストで、132px相当の実測高通知が`HEADER_HEIGHT`と購読レイアウトの`paddingTop`に伝わることを維持する。HeaderテストではPC adminの2段構成を別途確認する。
- TabでSPアコーディオンのリンクへ移動した後にEscを押すと、トリガーの「一般ページ」ボタンへフォーカスが戻る。
- PC adminでは、下段4カードが一列に収まり、`main`のcomputed `paddingTop`がheaderの実測高以上であることを確認する。`MatchRegister`と`MatchEdit`をスクロールしたとき、ヘッダー基準のsticky要素の上端がheaderの下へ潜らないことを確認する。`BoxerEdit`は既存どおり一覧側が`HEADER_HEIGHT`に追従し、編集側のローカル余白が不要に増えないことを確認する。
- Cypressのadminログイン済み320px viewportで、SP adminのheaderに水平スクロールがなく、5セルがすべてviewport内にあり、各セルの幅・高さが44px以上、ラベル要素の`scrollWidth <= clientWidth`であることを確認する。一般ページアコーディオンがヘッダー直下に開くことを確認する。
- 767pxではSP、768px・769pxではPC構成となることを確認する。768pxで通常の試合ページを開き、`deviceState`を使う既存コンポーネントがPC表示となることをスモーク確認する。

実行コマンド:

- `cd frontend && npm test -- --run`
- `cd frontend && npx cypress run --spec cypress/e2e/test.cy.ts`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

## Risks

- `useAdmin()`の取得後にadmin構成へ切り替わるため、初回表示直後にPCではヘッダー高が80pxから約132pxへ変わる。再取得中・エラー時はfail-closedで80px構成に戻る。`ResizeObserver`が本文余白へ追従すること、視覚的な切替が許容できることを確認する。
- SP下段は5枠であり、320px級の幅ではラベルが9pxまで小さくなる。PC/SP以外のモードを作らずに収めるため、アイコンの意味、`aria-label`、44px以上のタップ領域、ラベル非省略をCypressと実機幅で確認する。
- SPアコーディオンは本文上に重なる。外側タップ・Esc・リンク選択による閉鎖、退出中の`inert`とポインター無効化をテストする。
- 固定ヘッダー高が変わると、ページ内のヘッダー基準sticky offsetが見えなくなる。`MatchRegister`と`MatchEdit`では`HEADER_HEIGHT`を唯一のheader offsetにして、スクロール状態でも確認する。`BoxerEdit`の編集側`top-[30px]`はローカル余白として維持する。
- 768px境界の変更はHeader以外の`deviceState`購読者にも影響する。全Vitestと通常試合ページの768pxスモーク確認で、PC/SP表示の回帰を検出する。
- `AdminMenuPopover.tsx`は無関係な未コミット差分を保護して残すため、Headerから参照されないファイルとその既存テストが一時的に存在する。差分保護が不要になった時点で、通常PCの導線も含めて別タスクで整理する。
