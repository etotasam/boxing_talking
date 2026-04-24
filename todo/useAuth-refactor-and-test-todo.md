# useAuth Test And Refactor TODO

## 方針

`useAuth.ts` は将来的に `1hook 1file` へ分割する。
ただし、先に `todo/frontend-apiHooks-test-plan.md` の方針に従って、`useAuth.ts` に含まれる各 hook のテストを整備する。
テストで現状挙動を固定した後に、`1hook 1file` への分割を実施する。

## 対象 hook

- `useGuest`
- `useGuestLogin`
- `useGuestLogout`
- `useAuth`
- `usePreSignUp`
- `useSignUpIdentification`
- `useLogin`
- `useLogout`
- `useAdmin`

## TODO

- [ ] `todo/frontend-apiHooks-test-plan.md` を基準に `useAuth.ts` 内 hook の優先度を確認する
- [ ] 高優先度 hook のテストを先に作成する
- [x] `usePreSignUp`
- [x] `useGuestLogin`
- [x] `useSignUpIdentification`
- [ ] 中優先度 hook のテストを作成する
- [x] `useLogin`
- [x] `useLogout`
- [x] `useGuestLogout`
- [x] 低優先度 hook の契約テストを作成する
- [x] `useGuest`
- [x] `useAuth`
- [x] `useAdmin`
- [ ] `useAuth.ts` 内 hook の主要分岐と副作用がテストで固定されていることを確認する
- [ ] `useAuth.ts` を `1hook 1file` へ分割する
- [ ] `auth/index.ts` などの再 export 用ファイルを用意して公開 interface を維持する
- [ ] import 側を必要に応じて整理する
- [ ] 分割後に auth 系 hook テストを再実行して挙動差分がないことを確認する

## 補足

- テストは `1hook 1file` を原則に追加する
- 実装分割前に挙動をテストで固定することを優先する
- `index.ts` は実装本体ではなく再 export 用に使う
