# 計画文書一覧

確認日: **2026-11-02 JST**。現在の判断は全体計画、作業の理由・検証・復旧情報は各履歴文書を参照してください。監査情報は各文書の確認時点の記録であり、文書整理時の再監査は行っていません。

## 現在の計画・保留事項

保存状況の追記（2026-11-02）: ユーザー依頼によりP5を本コミットへ保存する。下表のP5「未コミット」は保存依頼前の記録。元branchへのコミット統合は別途行う。定期DBバックアップの仕組みは後日検討する。

| 文書 | 状態 |
| --- | --- |
| [2026-10-22-dependency-runtime-update.md](2026-10-22-dependency-runtime-update.md) | P0〜P6の入口。P0〜P3完了、P4個別実装・元統合済み/P4全体未完了、P5は隔離A/元適用Bまで技術完了・未コミット、P6未着手 |
| [2026-11-02-frontend-moderate-advisories.md](2026-11-02-frontend-moderate-advisories.md) | P4j。11月2日確認時点のmoderate14/devのみ・2advisory、上流待ちと再評価条件 |
| [2026-11-02-plan-documents-organization.md](2026-11-02-plan-documents-organization.md) | 承認済みの文書整理計画・実施結果 |
| [2026-11-02-mysql-lts-update.md](2026-11-02-mysql-lts-update.md) | P5。隔離A/元適用Bまで技術完了。main8.4.13で20table/53履歴/jobs3を保持し通常利用再開、旧保存先/image/backup保持。未コミット |

Composer Mimeの残存指摘、Node暫定版、本番HTTPS/SMTP/S3/queue等の未確認事項も全体計画の[残課題](2026-10-22-dependency-runtime-update.md#残課題)に保持しています。P4統合前のDB内容hashを復旧できない確認限界は[統合記録](archive/dependency-runtime/2026-11-02-frontend-main-integration.md)を参照してください。

## 履歴の読み方

archiveは過去の計画・実行記録です。移動は全課題の解決・全確認の実施・本番公開可を意味しません。版・監査値・branch名・未コミット/次に行うこと等の説明は記録当時のものです。未確認範囲と復旧条件は各原本に残しています。branchを整理しても、保存コミットと文書の記録は残します。

元の日付・ファイル名を維持しています。過去のチャットなどの旧パスは自動更新できませんが、以下の同名リンクから移動先を確認できます。Git管理外の証跡・SQL・バックアップは今回の整理対象外で、worktree削除前には別途保全が必要です。

## Laravel / PHP：18文書

S0〜S9と元統合の計画・結果。現在の構成は全体計画、最終検証の範囲はS9結果と統合結果を参照してください。

| 文書（旧ファイル名） | 対象・記録 |
| --- | --- |
| [2026-10-19-laravel-php-upgrade.md](archive/laravel-php/2026-10-19-laravel-php-upgrade.md) | Laravel / PHP の段階的アップグレード計画 |
| [2026-10-20-laravel-php-s0-baseline.md](archive/laravel-php/2026-10-20-laravel-php-s0-baseline.md) | S0: Laravel / PHP 更新前の基準結果 |
| [2026-10-21-laravel-php-s1-result.md](archive/laravel-php/2026-10-21-laravel-php-s1-result.md) | S1: Laravel 8→9 実行結果（2026-10-21） |
| [2026-10-21-laravel-php-s2-result.md](archive/laravel-php/2026-10-21-laravel-php-s2-result.md) | S2: Laravel 9→10 実行結果（2026-10-21） |
| [2026-10-21-laravel-php-s3-result.md](archive/laravel-php/2026-10-21-laravel-php-s3-result.md) | S3: Laravel 10のPHP 8.2→8.3 実行結果（2026-10-21） |
| [2026-10-21-laravel-php-s4-result.md](archive/laravel-php/2026-10-21-laravel-php-s4-result.md) | S4: Laravel 10→11 中間検証結果 |
| [2026-10-21-laravel-php-s5-result.md](archive/laravel-php/2026-10-21-laravel-php-s5-result.md) | S5: Laravel 11→12 実行結果 |
| [2026-10-22-laravel-php-integration-result.md](archive/laravel-php/2026-10-22-laravel-php-integration-result.md) | Laravel13/PHP8.5 元worktree統合結果 |
| [2026-10-22-laravel-php-integration.md](archive/laravel-php/2026-10-22-laravel-php-integration.md) | Laravel13/PHP8.5成果の元worktree統合・確認・引き継ぎ |
| [2026-10-22-laravel-php-s6-handoff.md](archive/laravel-php/2026-10-22-laravel-php-s6-handoff.md) | S6引き継ぎ：Laravel 12→13 |
| [2026-10-22-laravel-php-s6-plan.md](archive/laravel-php/2026-10-22-laravel-php-s6-plan.md) | S6: Laravel 12→13 実行提案 |
| [2026-10-22-laravel-php-s6-result.md](archive/laravel-php/2026-10-22-laravel-php-s6-result.md) | S6: Laravel 12→13 実行記録 |
| [2026-10-22-laravel-php-s7-plan.md](archive/laravel-php/2026-10-22-laravel-php-s7-plan.md) | S7: PHP 8.3→8.4 実行提案 |
| [2026-10-22-laravel-php-s7-result.md](archive/laravel-php/2026-10-22-laravel-php-s7-result.md) | S7: PHP 8.3→8.4 実行記録 |
| [2026-10-22-laravel-php-s8-plan.md](archive/laravel-php/2026-10-22-laravel-php-s8-plan.md) | S8: PHP 8.4→8.5 実行提案 |
| [2026-10-22-laravel-php-s8-result.md](archive/laravel-php/2026-10-22-laravel-php-s8-result.md) | S8実行結果: PHP 8.4→8.5 |
| [2026-10-22-laravel-php-s9-plan.md](archive/laravel-php/2026-10-22-laravel-php-s9-plan.md) | S9 最終統合検証・引き継ぎ計画 |
| [2026-10-22-laravel-php-s9-result.md](archive/laravel-php/2026-10-22-laravel-php-s9-result.md) | S9 最終統合検証・引き継ぎ結果 |

## 依存・実行環境更新：15文書

P1〜P4個別段階と元統合の記録。MSW3更新後に2.15.0へ調整した経緯など、版の変遷も保持しています。P4全体の保留は直下のP4j調査を参照してください。

| 文書（旧ファイル名） | 対象・記録 |
| --- | --- |
| [2026-10-22-backend-sdk-security.md](archive/dependency-runtime/2026-10-22-backend-sdk-security.md) | P1 AWS SDK / JMESPath セキュリティ更新提案 |
| [2026-10-29-backend-jwt-security.md](archive/dependency-runtime/2026-10-29-backend-jwt-security.md) | P2 JWT 7系への更新 |
| [2026-10-29-frontend-build-update.md](archive/dependency-runtime/2026-10-29-frontend-build-update.md) | P4b: frontend build・テスト基盤とStorybookの更新計画・結果 |
| [2026-10-29-frontend-dependency-security.md](archive/dependency-runtime/2026-10-29-frontend-dependency-security.md) | P4a: frontend通信・ユーティリティ・CSS依存の脆弱性対応 |
| [2026-10-29-node-lts-update.md](archive/dependency-runtime/2026-10-29-node-lts-update.md) | P3: Node LTS・依存導入経路の更新 |
| [2026-10-29-p1-p3-integration.md](archive/dependency-runtime/2026-10-29-p1-p3-integration.md) | P1〜P3の元worktree統合・実起動確認 |
| [2026-10-30-frontend-cypress-removal.md](archive/dependency-runtime/2026-10-30-frontend-cypress-removal.md) | P4d-1: 未使用Cypressの削除 |
| [2026-10-30-frontend-eslint-babel-css.md](archive/dependency-runtime/2026-10-30-frontend-eslint-babel-css.md) | P4i: ESLint・Babel・CSS関連の調査と段階的更新案 |
| [2026-10-30-frontend-eslint10-migration.md](archive/dependency-runtime/2026-10-30-frontend-eslint10-migration.md) | P4i-2: ESLint 10への設定移行案 |
| [2026-10-30-frontend-msw-update.md](archive/dependency-runtime/2026-10-30-frontend-msw-update.md) | P4f: MSW更新の調査・実装提案 |
| [2026-10-30-frontend-msw-vitest-peer.md](archive/dependency-runtime/2026-10-30-frontend-msw-vitest-peer.md) | P4h: MSW / Vitest peer整合の調査・提案 |
| [2026-10-30-frontend-router-uuid.md](archive/dependency-runtime/2026-10-30-frontend-router-uuid.md) | P4c: React Router・未使用uuid直接依存の整理 |
| [2026-10-30-frontend-router-v7.md](archive/dependency-runtime/2026-10-30-frontend-router-v7.md) | P4e: React Router 7系への移行 |
| [2026-10-30-frontend-unused-test-dependencies.md](archive/dependency-runtime/2026-10-30-frontend-unused-test-dependencies.md) | P4g: 未使用のテスト関連直接依存の整理 |
| [2026-11-02-frontend-main-integration.md](archive/dependency-runtime/2026-11-02-frontend-main-integration.md) | P4のmain-worktree統合・起動確認 |

## 画面改善・Query移行：3文書

バッジ・メニュー変更とQuery移行の記録。Query移行のブラウザー確認は実施範囲が限定されており、未チェックを一括で完了扱いしていません。

| 文書（旧ファイル名） | 対象・記録 |
| --- | --- |
| [2026-10-08-prediction-vote-badge.md](archive/frontend-features/2026-10-08-prediction-vote-badge.md) | 勝敗予想受付バッジの配置・表示変更 |
| [2026-10-16-header-user-menu.md](archive/frontend-features/2026-10-16-header-user-menu.md) | ヘッダーの名前付きユーザーメニュー（A案） |
| [2026-10-16-migrate-tanstack-query.md](archive/frontend-features/2026-10-16-migrate-tanstack-query.md) | TanStack Query v5 への移行 |

## 更新時の方針

- 新しい計画は従来どおり`docs/plans/YYYY-MM-DD-<task-name>.md`に作成し、進行中は直下に置きます。
- 履歴化する場合は、未解決事項・再評価条件を現在の入口へ引き継ぎ、相対リンクと見出し参照を確認します。
- 実績・確認日・未実施範囲を区別し、古いチェック項目を機械的に完了へ変更しません。
