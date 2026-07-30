# Header Height ResizeObserver

## Goal

固定ヘッダーの実際の高さを `ResizeObserver` で監視し、`HEADER_HEIGHT` を最新の実測値としてRecoilへ配布する。

これにより、将来ヘッダー内の要素を追加・変更して高さが変わったときも、共通 `Header` を使う主要レイアウトの本文や管理画面の開始位置がヘッダーと重ならない状態を維持する。

## Background / Context

現在の `useHeaderHeightRef(device)` はcallback refを返し、refが設定されたときだけ `node.clientHeight` を `HEADER_HEIGHT` へ書き込む。callback ref関数は `device` が変わったときに再生成されるため、PC / SP切替では再計測される。

一方、同じヘッダー要素のまま高さを変える要素が追加・削除された場合、`device` は変わらない。外形高が変わっても `HEADER_HEIGHT` が追従しない可能性がある。

`HEADER_HEIGHT` を本文余白やモーダル配置に使う主な `HeaderShell` 配下の箇所は、`HeaderFooterLayout`、`ContentLayout`、`AdminLayout`、管理ページ、`MatchCommentsModal` である。これらは移行せず、共通 `Header` を高さの測定・配布元とする。

`HeaderOnlyLayout` と `Identification` は `HeaderShell` 外だが、前者が共通 `Header` を描画する。このobserverによる高さ配布は維持するが、現状の本文オフセットは本計画の保証対象にしない。

`TermsLayout` は `HeaderShell` 外の独自80pxヘッダーであり、本計画のobserver対象ではない。`HEADER_HEIGHT` を購読している既存の不整合はTerms専用ヘッダーの整理として別タスクで扱う。

## Scope

### In Scope

- `useHeaderHeightRef` をResizeObserverで共通Headerのborder box高を監視するhookへ置換する。
- 初回表示、PC / SP切替、通常ページ / 管理ページ遷移、将来のDOM変更による高さ変化に追従して `HEADER_HEIGHT` を更新する。
- 同じ高さの通知ではRecoil setterを呼ばない。
- observerをunmount時に確実に切断する。
- 制御可能なResizeObserverモックでhookとRecoil連携をテストする。

### Out of Scope

- `HEADER_HEIGHT` を使う既存レイアウト・ページからRecoilを廃止すること。
- 高さを `80` / `126` / `132` の固定値として定数化すること。
- 管理ナビのリンク内容・デザイン・ルート切替。
- `TermsLayout` 独自ヘッダーと `HEADER_HEIGHT` の既存不整合の修正。
- observer callback内で、監視対象header自身の高さ・幅・classNameを変更すること。

## Impact Area

| 対象 | 対応 |
| --- | --- |
| `frontend/src/components/module/Header/hooks/useHeaderHeightRef.ts` | callback-refでの一度きりの計測を、observerの開始・通知・cleanupを持つ実測hookへ置換する。 |
| `frontend/src/components/module/Header/Header.tsx` | hook呼び出しから `device` 引数を外す。 |
| `frontend/src/components/module/Header/component/HeaderView.tsx` | ref objectを受け取るprops型へ変更する。既存のPC / SPレイアウトは変更しない。 |
| `frontend/src/store/elementSizeState.ts` | `HEADER_HEIGHT` atomは維持する。 |
| `HeaderShell` 配下の `HEADER_HEIGHT` 購読側 | 変更不要。実測値をそのまま受け取る。 |
| `TermsLayout` | 本計画の対象外。独自ヘッダーのため、共通Headerの実測値を正として扱わない。 |
| Header関連テスト | ResizeObserverの開始、通知時の高さ反映、同値時の不要更新防止、cleanupを追加する。 |

## Unnecessary / Replacement Inventory

| 現在の要素 | 判断 | 理由 |
| --- | --- | --- |
| `useHeaderHeightRef` | 削除せず置換 | ヘッダー高さをRecoilへ共有する責務は維持する。 |
| hookの `device` 引数 | 削除 | observerが実際の高さ変化を検知するため不要。 |
| hook内の `useCallback` | 削除 | callback refでの再計測をやめ、ref objectとeffect管理へ替える。 |
| `DeviceStateType` のhook内import | 削除 | `device` 引数廃止に伴い不要。 |
| 数値を返す `getHeaderHeight` / `headerMode` | 導入しない | 高さを推測せず、DOM実測値を唯一の値とする。 |
| `elementSizeState('HEADER_HEIGHT')` | 維持 | 複数の既存レイアウト・ページ・モーダルへ高さを配るため必要。 |

## Options

### Option 1: 高さに影響する状態をcallback refの依存値へ追加する

`device` に加えて管理ページ表示・権限状態などを依存配列へ追加し、再計測する。

メリット: 実装量が少なく、新しいブラウザAPIを使わない。

デメリット: 高さを変える状態を将来も漏れなく保守する必要があり、要素追加や折返しなど明示されない変化を検出できない。

### Option 2: ResizeObserverで実測値を監視する（採用）

共通Headerだけを監視し、border box高が変わったときだけ `HEADER_HEIGHT` を更新する。

メリット: 高さの原因を列挙せずに実レイアウトへ追従でき、PC/SP切替や将来のヘッダー変更を同じ仕組みで扱える。監視対象が1要素なので負荷を限定できる。

デメリット: テスト用モックが必要で、callbackが監視対象自身を再サイズしない規約を守る必要がある。

### Option 3: 固定高さを関数で算出してRecoilへ設定する

`device`、管理者状態、管理ページ判定から既知の数値を返す。

メリット: ロジックとテストが単純でDOM APIに依存しない。

デメリット: UI変更時に定数更新が必要で、実レイアウトとの差異が起こり得る。要素追加時の自動追従を満たさない。

## Decision

Option 2を採用する。

`useHeaderHeightRef` は `useRef<HTMLElement | null>` と `useLayoutEffect` を内部で使うhookへ置換する。`Header` は返されたref objectを `HeaderView` のheader要素へ渡し、`HeaderViewProps` は `RefObject<HTMLElement | null>` を受け取る型へ変更する。

observerは `observe(node, { box: 'border-box' })` で開始する。開始直後は `getBoundingClientRect().height` を初期値として設定し、以降は `entry.borderBoxSize?.[0]?.blockSize` を優先して読む。border box情報が得られない場合のfallbackは `entry.target.getBoundingClientRect().height` とする。前回値と同じならsetterを呼ばず、cleanupでは `disconnect()` を呼ぶ。

更新先は本文側の余白だけに限定し、observer callbackで監視対象header自身のサイズを変更しない。

## Rationale

- 高さの真実を固定値ではなく、ブラウザが確定したヘッダー外形に置ける。
- 既存のRecoil購読側を移行せずに、将来のヘッダー高さ変更へ安全に追従できる。
- 監視対象をヘッダー1要素に限定するため、一般的な大量監視の負荷・複雑さを持ち込まない。
- 依存配列で高さの変更原因を保守するより、将来の変更漏れを減らせる。

## Tasks

- [x] `useHeaderHeightRef` をref objectと `useLayoutEffect` によるResizeObserver管理へ置換する。
- [x] `HeaderViewProps` をref object型へ変更し、header要素へ渡す。
- [x] observerを `{ box: 'border-box' }` で開始し、開始時は `getBoundingClientRect().height`、通知時はborder box高を優先して取得する。
- [x] 同じ高さならRecoil setterを呼ばないようにする。
- [x] unmount時の `disconnect()` を実装する。
- [x] `Header.tsx` からhookの `device` 引数を外す。
- [x] Vitestへ制御可能なResizeObserverモックを追加し、各テストでinstanceとcallbackをresetする。
- [x] hook単体で、監視対象、`border-box` option、初期値、異値通知、同値通知、fallback、cleanupをsetter spyで検証する。
- [x] Recoilとレイアウトを組み合わせ、人工通知後に `paddingTop` が更新されることを`act`内で検証する。
- [x] jsdomではTailwindの実測値を前提にせず、実ブラウザで既存PCヘッダーの実測値が本文余白へ反映されることを確認する。SPは既存テストで表示切替を確認する。
- [x] `cd frontend && npm test -- Header`、`cd frontend && npm run lint`、`cd frontend && npm run build` を実行する。
- [x] 実装差分をReviewer subagentでレビューする。

## Test Plan

- mount時にobserverがheader要素を`border-box`で監視し、初期の外形高を `HEADER_HEIGHT` として配布する。
- 異なる高さの人工通知後、購読レイアウトの `paddingTop` が更新される。
- 同じ高さの通知ではhookがRecoil setterを追加で呼ばない。
- `borderBoxSize` がない通知時に、外形高fallbackを使う。
- Headerのunmount時にobserverが切断される。
- PCとSPの切替、および将来のヘッダー高さ変更で、各observer通知の実測高に本文余白が追従する。
- observer callbackによる更新がheader自身の高さ変更を引き起こさず、通知ループを作らない。

## Risks

- jsdomには実際のTailwindレイアウト計測がないため、サイズは制御可能なobserverモックで通知する。画面上の外形確認はブラウザで補う。
- `contentRect.height` や `clientHeight` はborderを含まないため、`border-box` optionと `borderBoxSize` を優先する。fallbackは外形高を返す `getBoundingClientRect().height` とする。
- callback内でheader自身をサイズ変更する処理を追加すると、通知ループやちらつきにつながる。高さに依存する更新は本文側・兄弟要素に限定する。
- 初回observer通知前に購読側が `undefined` を読む可能性があるため、observer開始直後に同期的な初期計測を行う。
- Termsは共通Headerを描画しないため、observer cleanupで `HEADER_HEIGHT` をresetしてはならない。Terms固有の高さ管理は別途整理する。
