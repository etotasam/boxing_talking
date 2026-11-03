# P6-5 最終セキュリティ・runtime 再評価

## 目的と範囲

P6 作業前の `frontend/package-lock.json` と `backend/composer.lock` を、依存更新なしで再監査し、残存 advisory、現在確認できる公式修正経路、各 runtime の公式サポート情報を整理する。監査は lock ファイルの専用コピーだけを使った一時 Docker 実行で行った。DB、アプリコンテナ、実環境設定、秘密情報には接続・アクセスしていない。

## 再監査結果

| 領域 | 全依存 | omit-dev | 根拠となる advisory | 結果 |
| --- | --- | --- | --- | --- |
| npm frontend | moderate 14 packages / 2 advisory ID | 0 | `GHSA-g3hv-75wg-m249`, `GHSA-3g3m-2fjr-6pw4` | 依存更新なし。両 ID は全依存にのみ現れ、omit-dev には現れない |
| Composer backend | 1 advisory | 対象外（Composer の実行時区分監査は今回の範囲外） | `PKSA-wtxr-p26d-nn42` / `GHSA-vqc8-7275-q272` / `CVE-2026-45070` | `symfony/mime` 7.4.19 が影響範囲内。lock 現状に残る |

npm の「14」は影響を受けるパッケージ数であり、根本 advisory は2件。重大度はいずれも moderate。PHP の advisory は Composer の最新データで再取得し、severity medium、影響範囲 `>=7.4.0,<7.4.22` を確認した。Symfony の公式 CVE 訂正では、以前誤って修正済みとされた 7.4.12 には修正が含まれず、正しい修正版は 7.4.22 と明記されている。

## 修正経路と候補

- minimatch: 現行 `minimatch` 10.2.6 は影響範囲 `<11.0.1`。公式修正版は 11.0.1 以降。現 lock の ESLint 10 系、`@eslint/config-array`、`@typescript-eslint/typescript-estree` はそれぞれ minimatch `^10` 系を要求するため、現行宣言の通常解決では修正版の major へ上がらない。公開 advisory は [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)。
- glob: 現 lock の脆弱経路は `@storybook/react-vite` → `@joshwooding/vite-plugin-react-docgen-typescript` → glob 13 系。advisory の影響範囲は `>=9.0.0 <=14.0.1`、修正版は 14.0.2 以降。現在の docgen plugin の glob 範囲は 13 系であり、現行 Storybook 依存宣言のままでは glob 14 を通常解決できない。公開 advisory は [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)。
- Composer: root は Laravel `^13.0@stable`、PHP `^8.5` を許容し、lock の `symfony/mime` は 7.4.19。公式修正版 7.4.22 は同じ 7.4 系にあり、提示された root Symfony 個別 pin は確認されていない。具体的な更新可否・副作用は別途 lock-only 解決と回帰確認を伴う backend 依存修正提案で決める。
- npm が示す Storybook 8 / eslint-plugin-storybook 0.1.1 への downgrade は major downgrade を伴うため、機能と互換性を維持する修正経路として採用しない。override、patch、依存削除も今回適用していない。

### 現在公開されている上流 manifest による再評価

2026-11-02 02:54:31–02:54:32 UTC に npm Registry の `/latest` metadata を改めて取得した。取得 JSON は `docker/db/p6-archive/20261103/audit/latest-parent-metadata.json` と package 別 JSON 5点に保存してある。参照した一次 metadata URL は [eslint/latest](https://registry.npmjs.org/eslint/latest)、[@eslint/config-array/latest](https://registry.npmjs.org/%40eslint%2Fconfig-array/latest)、[@typescript-eslint/typescript-estree/latest](https://registry.npmjs.org/%40typescript-eslint%2Ftypescript-estree/latest)、[@storybook/react-vite/latest](https://registry.npmjs.org/%40storybook%2Freact-vite/latest)、[@joshwooding/vite-plugin-react-docgen-typescript/latest](https://registry.npmjs.org/%40joshwooding%2Fvite-plugin-react-docgen-typescript/latest)。Storybook `^0.7.0` の解決可能版を確認するため、2026-11-02 03:01:12.056Z に同じ package の全 registry metadata と semver compatible 版一覧も取得し、`docgen-packument.json` と `docgen-compatible-range.json` に保存した。

| 公開 latest | 公開 manifest の該当依存 | 影響 |
| --- | --- | --- |
| ESLint 10.14.0 | minimatch `^10.2.6`; `@eslint/config-array ^0.23.5` | minimatch 11 は通常範囲外 |
| `@eslint/config-array` 0.23.5 | minimatch `^10.2.4` | minimatch 11 は通常範囲外 |
| `@typescript-eslint/typescript-estree` 8.72.1 | minimatch `^10.2.2` | minimatch 11 は通常範囲外 |
| `@storybook/react-vite` 10.6.5 | docgen plugin `^0.7.0` | semver 範囲は `>=0.7.0 <0.8.0`。registry の全 versions metadata で互換安定版は 0.7.0 のみ |
| docgen plugin 0.7.0（現 lock、範囲内の公開安定版） | glob `^13.0.1` | glob 14 は通常範囲外 |
| docgen plugin 0.9.0（公開 latest） | glob `^13.0.6` | 0.9.0 は Storybook の `^0.7.0` 範囲外。依存宣言も glob 14 を許容しない |

したがって上流最新 stable の更新を考慮しても、現行の宣言範囲だけから minimatch 11 または glob 14 へ進む通常更新経路は確認できない。registry の全 versions metadata と `^0.7.0` に対する compatible 版一覧で、解決可能な安定版は 0.7.0 のみと確認した。その 0.7.0 metadata（現 lock とも一致）は glob `^13.0.1` を宣言する。公開 latest 0.9.0 の manifest は glob `^13.0.6` だが、Storybook の `^0.7.0` には含まれず通常解決候補ではない。該当する 0.7.0 / 0.9.0 の glob 範囲はいずれも glob 14 を許容しない。これは調査した5 package の最新 `latest` metadata、全 versions metadata、現 lock に基づく判断であり、将来版や別の修正 backport の不存在までは主張しない。取得 URL と各取得日時、依存宣言は Git 除外 evidence JSON に記録されている。

## runtime / support 照合

| 項目 | 現状として確認した版 | 公式情報・候補 | 判断 |
| --- | --- | --- | --- |
| Node.js | 24.22.1（監査 image） | Node 24 LTS の EOL は 2028-04-30。公式 Node リリース一覧には 24.22.2（2026-10-28）が掲載され、Docker Official Images に `24.22.2-alpine3.24` がある | 24.22.2 は更新候補として公式公開済み。ただし digest の確認、pull、実 image/runtime での検証は未実施 |
| PHP | 8.5.12（Composer 監査 image） | PHP 8.5 は active support 2027-12-31 まで、security support 2029-12-31 まで。Laravel 13 は PHP 8.3–8.5 を対象とし、bug fixes は Q3 2027、security fixes は 2028-03-17 まで | 現行の PHP/Laravel major 組合せは公式サポート範囲内。依存更新は別判断 |
| Symfony | 7.4.19 (`symfony/mime`) | Symfony 7.4 最新 patch は 7.4.22。公式 CVE 修正も 7.4.22 | セキュリティ修正候補は存在する。lock 未更新のため CVE は解消していない |
| MySQL | 8.4.13（P6 runtime plan に記録された現状） | MySQL 8.4 は LTS 系列。Oracle の release policy は LTS に Premier Support 5年、Extended Support 3年を示す | サポートモデルを確認。今回、特定の EOL 日付や image digest は検証していない |

公式根拠: [Node releases](https://github.com/nodejs/node/releases), [Node release schedule](https://github.com/nodejs/Release/blob/main/schedule.json), [Node Official Images](https://github.com/docker-library/official-images/blob/master/library/node), [PHP supported versions](https://www.php.net/supported-versions.php), [Laravel release support](https://laravel.com/framework/docs/releases), [Symfony 7.4 support](https://symfony.com/releases/7.4), [Symfony CVE-2026-45070 correction](https://symfony.com/blog/cve-2026-45070-email-header-injection-via-non-token-characters-in-mime-parameter-names), [MySQL 8.4 release policy](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html).

## 関連ファイル・依存関係・影響範囲

- 関連ファイル: `frontend/package.json`, `frontend/package-lock.json`, `backend/composer.json`, `backend/composer.lock`; runtime 参照は `docs/plans/2026-11-02-security-runtime-final-check.md` と Docker image 定義。
- npm の影響は frontend の開発依存に限定されるという P4 の依存経路調査と、今回の omit-dev 監査 0 件が整合する。ただし omit-dev 0 件だけで全ビルド環境の到達可能性を否定しない。
- Composer は Laravel framework の依存経路を通じた Symfony MIME 7.4.19。利用時の到達性は別途アプリケーションコードとデータ経路の確認が必要。
- 想定リスク: 現 lock の moderate 2 advisory と medium 1 advisory は未解消。Node 24.22.2 image の置換検証、Symfony patch 更新時の回帰確認も未実施。support 情報と修正版の公開は、実環境が更新済みであることを意味しない。

## 提案

監査結果だけを理由に自動更新せず、npm の現 lock に残る指摘を明示して frontend P4 を完了扱いしない。Symfony MIME 7.4.22 は frontend P4 の範囲外であり、別の backend 依存修正提案として更新可能性と回帰範囲を扱う。npm 側は依存元の修正版または利用元の安全な更新経路が出たかを再調査する。Node 24.22.2 の採用も、正確な official image digest、アーキテクチャ、Docker build/runtime、CI を検証する独立の更新案として扱う。依存/runtime の更新はこの報告では実施していない。

## 証跡

生の監査出力、終了コード、audit 前後の依存 lock コピー、現在公開版の npm Registry metadata は Git 除外領域 `docker/db/p6-archive/20261103/audit/` に保存した。npm 全依存・omit-dev 監査と Composer 監査は現行 lock の未変更コピーを使い、npm audit の全依存と omit-dev の advisory ID 集合も照合した。証跡一覧、SHA-256、入力ファイルのモード照合は同ディレクトリの `evidence-summary.txt` を参照。

2026-11-03の後片付けで証跡を上記archiveへ保全・hash照合後、元の`docker/db/p6-audit-20261102/`はユーザー承認によりゴミ箱へ移動した。監査の取得日時・入力・結果は変更せず、再監査は行っていない。
