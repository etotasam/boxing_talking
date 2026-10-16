# React + TypeScript + Vite

## Server state

サーバーデータは TanStack Query v5 (`@tanstack/react-query`) で管理します。
開発用 Devtools は `@tanstack/react-query-devtools` を使用します。

共通設定は `src/queryClient.ts` の `createQueryClient` に集約しています。
query / mutation の `networkMode: 'offlineFirst'` は、React Query v3 と同様に
オフラインでも初回の通信を実行し、失敗時の通知・ローディング終了へ進むための互換設定です。
query の自動リトライとウィンドウフォーカス時の再取得は従来どおり無効です。

テスト用 API URL が未設定の場合は、外部 API に接続せず MSW で処理できるよう
`VITE_APP_API_URL=http://localhost:3000 npm test -- --run` でテストを実行できます。

## Vite template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
