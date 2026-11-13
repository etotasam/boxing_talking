# 計画文書一覧

## 現在の計画・保留事項

- [依存・実行環境更新](2026-10-22-dependency-runtime-update.md)
  - 進捗：P0〜P3・P5完了。P4は一部保留。P6は承認範囲の検証・レビュー・後片付け完了。
  - 残課題：Composer Mimeの指摘、本番環境の確認、定期DBバックアップ。Node暫定版は24.22.2への更新・検証・通常環境への反映まで完了。
- [フロントエンドの残存advisory](2026-11-02-frontend-moderate-advisories.md)
  - 保留：2026-11-02確認時点で通常更新による解消経路なし。上流の修正版公開後に再調査。
- [最終統合検証](2026-11-02-security-runtime-final-check.md)
  - 進捗：承認範囲の検証・最終レビュー・専用環境の整理完了。archiveへの移動は未実施。
  - 対象外：本番公開、全画面・メール全体の検証。
- [最終監査報告](2026-11-02-final-audit-review.md)
  - 状態：再監査結果と修正候補を記録済み。Node候補は上記の全体計画に更新結果を記録。依存パッケージの修正候補は未適用。

## 履歴一覧

- [Laravel / PHP](archive/laravel-php/)：段階的アップグレード・検証・統合の記録。
- [依存・実行環境更新](archive/dependency-runtime/)：依存パッケージ・Node・MySQL更新と統合の記録。
- [画面改善・Query移行](archive/frontend-features/)：予想受付バッジ・ユーザーメニュー・TanStack Query移行の記録。
- [文書整理](archive/documentation/)：Plan Documentの配置・参照整理の記録。
