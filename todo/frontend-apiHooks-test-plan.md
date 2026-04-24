# Frontend `apiHooks` Test Plan

## Summary
`frontend/src/hooks/apiHooks` は全部を同じ深さでテストするべきではない。
優先順位は `API結果そのもの` ではなく、`hookが持つ分岐・副作用・状態変換の多さ` で決める。

テスト方針は次の3段階に分ける。

- `高優先度`: `正常・異常・境界` を明確に分けて hook 単体テストする
- `中優先度`: `正常 + 主要異常1件 + 代表境界1件` に絞る
- `低優先度`: 薄い契約テストだけにする
  - 成功時に `data` が入る
  - 失敗時に `isError` か想定デフォルト値になる

想定実装は `renderHook + QueryClientProvider + RecoilRoot + msw` を基本にする。
toast / loading / query invalidation は依存 hook を `vi.mock` して観測する。

## Key Changes
### 1. 高優先度で先に押さえる hook
対象:
- `usePreSignUp`
- `useGuestLogin`
- `useSignUpIdentification`
- `usePostComment`
- `useDeleteBoxer`
- `useVoteMatchPrediction`

理由:
- HTTP status や `errorCode` / `message` によって結果が分岐する
- toast、Recoil、react-query cache 更新など副作用が多い
- UI テストだけでは分岐の取りこぼしが出やすい

各 hook の最低限ケース:
- `usePreSignUp`
  - 正常: 成功時に loading を閉じる
  - 異常: `422 + email duplicate`
  - 異常: `422 + name duplicate`
  - 境界: `422 + name length over`
  - 異常: `422 + その他入力不正`
  - 異常: `422以外`
- `useGuestLogin`
  - 正常: login 成功で modal close, prediction refetch, guest cache 更新, success toast
  - 異常: `UNABLE_TO_GENERATE_GUEST_TODAY`
  - 異常: その他失敗
- `useSignUpIdentification`
  - 正常: `authCheckingState = success`
  - 異常: `EXPIRED_TOKEN`
  - 異常: `INVALID_TOKEN`
  - 境界: 想定外 errorCode でも `authCheckingState = error`
- `usePostComment`
  - 正常: 投稿成功で success toast と query invalidate
  - 異常: `419`
  - 異常: `401`
  - 境界: `422 + comment too long`
  - 境界: `422 + empty comment`
  - 異常: `422 + matchId error`
  - 異常: その他失敗
  - 境界: 改行4連続以上が3連続に sanitize される
- `useDeleteBoxer`
  - 正常: success toast と boxer refetch
  - 異常: `BOXER_ALREADY_HAS_MATCH`
  - 異常: `BOXER_NOT_FOUND`
  - 異常: `BOXER_DELETE_FAILED`
  - 異常: その他失敗
- `useVoteMatchPrediction`
  - 正常: success toast と prediction refetch
  - 異常: 試合後投票不可
  - 異常: 既投票
  - 異常: その他失敗
  - 状態: `userPredictionPostState` の `loading/success/error/idle`

### 2. 中優先度で次に追加する hook
対象:
- `useRegisterBoxer`
- `useUpdateBoxerData`
- `useDeleteComment`
- `useLogin`
- `useLogout`
- `useGuestLogout`
- `useFetchUsersPrediction`
- `useMatchPredictions`
- `useFetchComments`
- `useFetchNewComments`

最低限ケース:
- `useRegisterBoxer`
  - 正常
  - 異常: `422 + BOXER_ALREADY_EXISTS`
  - 異常: その他失敗
- `useUpdateBoxerData`
  - 正常
  - 異常: 特定 `errorCode`
  - 異常: その他失敗
- `useDeleteComment`
  - 正常
  - 異常: `419`
  - 異常: その他失敗
- `useLogin`
  - 正常: auth cache 更新, modal close, admin refetch
  - 異常: 失敗 toast
- `useLogout`
  - 正常: auth cache clear, admin invalidate
  - 異常: 失敗 toast
  - `onSettled` で loading close
- `useGuestLogout`
  - 正常: guest cache false, modal close
  - 異常: 失敗 toast
  - `onSettled` で loading close
- `useFetchUsersPrediction`
  - 正常: auth/guest ありで fetch 実行
  - 境界: `res.data === null` のとき `undefined`
  - 境界: auth/guest なしで fetch しない
- `useMatchPredictions`
  - 正常: data 取得
  - 状態: `loading/refetching/idle`
  - 境界: timer による `refetch`
- `useFetchComments`
  - 正常: refetch で data 取得
  - 異常: error 時に fetch state が `error`
- `useFetchNewComments`
  - 正常
  - 境界: `createdAt=null` で fallback 時刻を使う
  - 異常: error state

### 3. 低優先度で薄く押さえる hook
対象:
- `useFetchMatches`
- `useFetchAllMatches`
- `useFetchPastMatches`
- `useFetchMatchById`
- `useAuth`
- `useGuest`
- `useAdmin`
- `useFetchCommentsState`
- `useQueryState`

最低限ケース:
- `useFetchMatches` / `useFetchAllMatches` / `useFetchMatchById`
  - 正常: data が返る
  - 異常: `isError`
- `useFetchPastMatches`
  - 正常: data が返る
  - `onSettled` で loading が閉じる
- `useAuth`
  - 正常: user data 取得
  - 境界: `null` を返したら query cache が `null`
- `useGuest`
  - 正常: truthy response -> `true`
  - 異常: 例外 -> `false`
- `useAdmin`
  - 正常: boolean
  - 異常: 例外 -> `null`
- `useFetchCommentsState`
  - 正常: `maxPage` と `resentPostTime`
- `useQueryState`
  - 初期値あり
  - setter に値を渡す
  - setter に updater 関数を渡す

## Test Plan
- 共通テスト基盤を `frontend/src/hooks/apiHooks/__test__` か `frontend/src/test` 配下にまとめる
- `createWrapper`
  - `QueryClientProvider`
  - `RecoilRoot`
  - react-query retry 無効
- 通信は `msw` を基本にする
- 依存 hook は必要に応じて `vi.mock`
  - `useToastModal`
  - `useFullScreenLoading`
  - `useReactQuery`
  - `useMenuModal`
  - `useLoginModal`
- 検証対象は返り値ではなく次を優先する
  - 公開関数が正しい payload で呼ばれる
  - success/error で toast が切り替わる
  - loading の開始/終了
  - query cache の更新 or invalidation
  - Recoil state の変化
- 受け入れ基準
  - 高優先度 hook は主要分岐をすべてテストで固定する
  - 中優先度 hook は代表ケースのみで副作用を固定する
  - 低優先度 hook は fetch 契約が壊れていないことを確認する
  - 認証・投稿・投票・削除系は失敗ケースを必ず含める

## Assumptions
- hook テストは `component 経由` ではなく `renderHook` 中心で進める
- 分岐の根拠は現状コードの `status`, `errorCode`, `message` に合わせる
- まずは `高優先度 -> 中優先度 -> 低優先度` の順で段階的に追加する
- `result` の全パターン網羅はしない
  - 分岐しない取得系 hook は薄く
  - 分岐する更新系 hook は `正常・異常・境界` を厚く
