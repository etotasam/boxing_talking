# Admin Menu Popover Stagger Animation

## Goal

PC / SP の管理メニューについて、開く時はヘッダー直下からパネルを上から下へ露出させ、リンク行を上から順に下方向へ移動させる。閉じる時はパネル全体をヘッダー下へ引き込むように隠す。

## Background / Context

`AdminMenuPopover` と `SpAdminMenuPopover` は、どちらも `isOpen &&` によりパネルを即時にマウント・アンマウントしている。そのため、開閉アニメーションはない。

`framer-motion` はすでに依存関係にあり、モーダルなどで `motion` と `AnimatePresence` を利用している。管理リンクは `AdminPageLinkList` 内で4つの `li` 要素として生成される。

## Scope

### In Scope

- PC / SP の両管理メニューに、開く際のリンク行ごとの段階スライド表示を追加する。
- パネルの開閉に `AnimatePresence` を用い、閉じる際の退出アニメーションを可能にする。
- 開始時刻をずらす時間間隔を約 50ms とし、縦方向の余白・行高・レイアウトは変更しない。
- アニメーションでは透明度を変更せず、要素は常に不透明のまま移動だけさせる。
- 閉じる際は個別の段階アニメーションを行わず、パネル全体を単一のクリップアニメーションでヘッダー下へ引き込むように隠す。
- 既存の開閉、Esc、外側クリック、リンク遷移、`aria-expanded` の振る舞いを維持する。
- 退出中のパネルは、ポインター操作・キーボードフォーカス・支援技術の対象から外す。
- 関連するユニットテストを、退出アニメーションを考慮した期待値に更新する。

### Out of Scope

- 管理リンクの順序、文言、行間、アイコン、配色の変更。
- ヘッダーのサイズ・絶対配置・PC/SPごとの横幅の変更。
- 新しい依存パッケージの追加。
- 開く際にパネル全体の scale を変える演出。
- OS の `prefers-reduced-motion` 対応の新規導入。

## Impact Area

| 区分 | 対象 | 変更内容 |
| --- | --- | --- |
| PC UI | `frontend/src/components/module/Header/component/AdminMenuPopover.tsx` | ヘッダー下からのパネル露出とリンク行の段階表示を追加する。 |
| SP UI | `frontend/src/components/module/Header/component/SpAdminMenuPopover.tsx` | PCと同一の露出原則を、全幅パネルに適用する。 |
| 共通リンク | `frontend/src/components/module/AdminNavigation.tsx` | `li` を `motion.li` として描画できるよう、必要最小限の拡張を行う。 |
| テスト | `frontend/src/components/module/Header/__test__/AdminMenuPopover.test.tsx` | 開閉・閉鎖後の検証をアニメーション完了後に確認できるようにする。 |
| テスト | `frontend/src/components/module/Header/__test__/SpAdminMenuPopover.test.tsx` | 同上。 |

API、状態管理、ルーティング、バックエンドへの影響はない。

## Options

### Option 1: Framer Motionでパネルと各リンク行をアニメーション（採用）

パネルの外側にヘッダー直下で内容を切り抜く `overflow-hidden` の枠を置き、その内側を `AnimatePresence` と `motion.div` で管理する。開く時はパネル全体の `clip-path` を上端から下端へ広げ、各 `motion.li` を `staggerChildren` により上から順に `y: -12 → 0` へ遷移させる。閉じる時はパネルの `clip-path` を逆方向に戻してヘッダー下へ引き込み、子要素には退出の段階表示を設定しない。透明度は変えない。

メリット:

- 要望どおり、開く時だけリンク行ごとの段階スライドにできる。
- 透明度を変えず、ヘッダー下から出入りする動きにできる。
- `isOpen &&` を維持しつつ退出アニメーション後にDOMから外せる。
- 既存のプロジェクトで採用済みのライブラリと実装パターンに沿える。

デメリット・リスク:

- `AdminPageLinkList` の `li` 生成をアニメーション対応に拡張する必要がある。
- 閉じる直後も退出完了までパネルがDOMに残るため、テストの即時非存在チェックを非同期に変更する必要がある。

### Option 2: CSS / Tailwindで常時レンダリングし、クラスを切り替える

パネルと全リンクを常時DOMに置き、`opacity`、`translate`、`transition-delay` を `isOpen` で切り替える。

メリット:

- Framer Motionのコードを増やさずに実装できる。

デメリット・リスク:

- 非表示中もリンクがDOMに残るため、Tab操作・支援技術・ポインターイベントの制御を追加で設計する必要がある。
- リンク数に応じた開始遅延の管理が読みづらくなりやすい。

## Decision

Option 1を採用する。`framer-motion` の `AnimatePresence`、パネル用の `motion.div`、リンク行用の `motion.li` を使用する。

開く時は、`overflow-hidden` の外枠内でパネル全体の `clip-path` を上端から下端へ広げる。各行は上から順に50ms間隔で、開始位置を上に12px置いた状態から下方向へ移動させる。リンク4件なら最後の行も約150ms後に開始し、全体を待たせない。アニメーション中も含め、透明度は常に1とする。

閉じる時は、リンクごとの `exit` を指定せず、親パネルが約150msで `clip-path` を逆方向に戻してヘッダー下に隠れる。親の退出中は `aria-hidden` と `inert`（プロジェクトのReact型定義で利用できない場合は、リンクの `tabIndex={-1}` を設定する代替）により支援技術とキーボードフォーカスの対象から外し、あわせてポインターイベントを無効化する。

## Rationale

- ユーザーが選んだ「open は1段ずつ、close は全パネル」の動きを正確に表現できる。
- 既存の `framer-motion` 採用状況と整合し、依存追加がない。
- `AnimatePresence` により、閉じるクリップアニメーションとアンマウントを安全に両立できる。
- 50ms の開始時刻差は段階感を作りながら、目的のリンクが見えるまでの待ちを最小にできる。

## Tasks

- [x] ヘッダー下でパネルを切り抜く外枠、パネル用・リンク行用のvariants、遷移時間をPC/SPで共通化する。
- [x] `AdminPageLinkList` にアニメーション可能なリスト項目の描画手段を追加し、既存の利用箇所に影響しないことを確認する。
- [x] PCポップオーバーに `AnimatePresence` を追加し、開く時の段階表示と閉じる時の全体クリップアニメーションを実装する。
- [x] SP全幅パネルにも同一の開閉原則を実装する。
- [x] 退出中のパネルを `aria-hidden`、`inert` またはリンクの `tabIndex={-1}` により操作・支援技術の対象から外し、ポインターイベントも抑止する。
- [x] 既存ユニットテストを更新し、開閉・リンク遷移・Esc・外側クリックの公開振る舞いを保証する。
- [ ] PC / SP のブラウザ表示で、開く時にヘッダー下からパネルが現れ、リンクが上から順に現れること、閉じる時にパネル全体だけがヘッダー下へ隠れることを確認する。
- [x] 関連テスト、lint、buildを実行する。

## Test Plan

- PC / SPとも、ボタン押下で4リンクを表示し、`aria-expanded` が `true` になることを確認する。
- 再押下、Esc、外側クリック、リンククリックで `aria-expanded` が `false` になり、退出アニメーション完了後にパネルがDOMから除去されることを確認する。
- 各リンクの遷移先と現在地を表す `aria-current` が従来どおりであることを確認する。
- 非管理者にはボタン・パネルを表示しないことを確認する。
- 退出中はリンクがTabフォーカスおよび支援技術の対象外となることを確認する。
- PC / SP のブラウザ表示で、透明度が変わらないこと、パネルがヘッダー下から出入りすること、各リンクの開始が約50msずつずれること、閉じる時はリンクごとの遅延なしにパネル全体がヘッダー下へ隠れることを確認する。
- 実行コマンド:
  - `cd frontend && npm test -- AdminMenuPopover SpAdminMenuPopover`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

## Risks

- 出口アニメーション中にもDOMが残るため、従来の即時アンマウントを前提としたテストは失敗する。完了を待つ検証に変更する。
- 親パネルの退出中にリンクがクリック・フォーカス・支援技術の対象になると状態の不整合や意図しない遷移があり得るため、ポインターイベント・フォーカス・アクセシビリティツリーの対象から外す。
- `AdminPageLinkList` は他の表示箇所でも利用されているため、アニメーションはこのポップオーバー利用時だけ有効になるAPIにする。
