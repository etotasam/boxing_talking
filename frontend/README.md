# React + TypeScript + Vite

## Dockerでの開発

Node 24.22.1 / npm 11.19.1を固定したDocker imageを使用します。
24系の最新配布版24.22.2に対応する公式Alpine imageが調査時点では取得できなかったため、
確認済み24.22.1を暫定採用しています。詳細は[P3計画](../docs/plans/2026-10-29-node-lts-update.md)を参照してください。

以下はリポジトリルートで実行します。元の環境と別worktreeを同時起動する場合は、
既存の固定container名・port・DB mountが衝突するため、そのまま同時起動しないでください。

初回はimageをbuildして依存を導入した後、全サービスを起動します。

```sh
docker compose build node
docker compose run --rm --no-deps node npm ci
docker compose up -d
```

nodeサービスの起動コマンドは`npm run dev`です。通常の起動・再起動では依存を再導入しません。

```sh
docker compose up -d
# 起動済みの開発サーバーを再起動する場合
docker compose restart node
```

`package-lock.json`を更新・取得した場合やNode imageを更新した場合は、開発サーバーを止めて再導入します。
Node image更新時は`build node`も実行してください。

```sh
docker compose stop node
docker compose build node
docker compose run --rm --no-deps node npm ci
docker compose up -d node
```

依存はCompose projectごとの`frontend_node_modules` named volumeへ導入します。
ホストの`frontend/node_modules`はcontainer内では使用しません。
空volumeで`up`だけを実行すると依存不足で起動に失敗するため、初回の`npm ci`が必要です。
lock更新後の再導入忘れは自動検出しないため、更新を取り込んだ際も上記手順を実行してください。
稼働中のnodeサービスと`npm ci`を同時に実行しないでください。

依存を意図的に追加・更新する場合だけ、停止後に同じサービスで`npm install <package>@<version>`を使い、
`package.json`と`package-lock.json`の差分を確認して一緒に保存します。
通常の再現導入には、既存lockを変更しない`npm ci`を使用します。

検証も同じNode環境で実行できます。

```sh
docker compose run --rm --no-deps -e VITE_APP_API_URL=http://localhost:3000 node npm test -- --run
docker compose run --rm --no-deps node npm run lint
docker compose run --rm --no-deps node npm run build
```

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
