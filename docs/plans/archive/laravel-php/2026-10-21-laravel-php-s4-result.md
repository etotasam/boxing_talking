# S4: Laravel 10→11 中間検証結果

> 履歴文書（2026-10-21作成）。当時の計画・実績・未確認範囲を保持しています。移動は全項目の解決を意味しません。現在の状況は[計画一覧](../../README.md)と[全体計画](../../2026-10-22-dependency-runtime-update.md)を参照してください。

## 状態

- **S4中間ゲート完了**。実装・中間必須検証・Reviewer確認済み、修正必須指摘なし。合同計画に従いコミット後S5へ続ける。S4のブラウザ総合・実メールは承認済みのS5最終確認へ集約する。
- 基点81cbfc17、ブランチcodex/laravel-php-s4-s5、既存worktreeを使用。PHP8.3.35/Composer2.9.4/Node16.13.2を維持。

## 実装

- Laravel10.50.3→11.57.0、Sanctum3.3.3→4.3.3、Collision7.12.0→8.5.0、Sail1.25.0→1.69.0。Carbon2.73.0/PHPUnit10.5.66を中間時点では維持。
- 部分update対象はframework/sanctum/collision/sail、-W --minimal-changes、Carbon2.73.0を一時制約。3追加/20更新/6削除。Sailは旧版のLaravel10までの制約による必須更新。
- 未使用rorecek/laravel-ulid2.0.6とnative schema移行後の未使用doctrine/dbal3.9.3を除去。ULIDは自動生成discovery以外に参照なく、ProviderはFactory bindingのみ/boot空。モデルのStr::uuid()・ID生成方式は維持。
- Sanctumのキーverify_csrf_token→validate_csrf_token、authenticate_session追加。既存App\Http\Middleware\VerifyCsrfToken/EncryptCookiesの参照とguard/Kernel/Provider構造を維持。2019トークン表+S2期限列が存在するためmigrationの重複publishなし。
- Laravel11のSQLite native DROP COLUMNは主キーidを削除できず、旧履歴2024_12_23_234609でDBsetup92件失敗。後続migrationでは新規構築を修復できないため、この履歴のSQLite分岐のみ互換修正。再構築で自動採番/主キー解除→既存id削除/複合キー設定。downはnullable id追加→再構築で自動採番idへ復帰。旧id値は復元しない（従来仕様）。MySQL経路・適用済みDBへの履歴再実行は変更しない。
- SQLiteのnative再構築が従来失われていたboxing_matchesの外部キーを保持し、既存fixtureの不足が顕在化。IndexCommentTest/StoreCommentTestへGrade/WeightDivision seed、ResultStoreTest/BoxerTitleSnapshotUpdateTestへGrade seedを補完。DestroyBoxerTestにもGrade seedとseed済みTitle参照idを明示。Factory/既存期待値/本番制約は変更せず、0〜10のランダムTitle参照による非決定的失敗も防いだ。
- 新規BoxerTitleSnapshotMigrationTestの3件は、NULL・複合主キー・重複拒否・データ入りdown/up2回・4外部キーと各cascadeを保証する。S5でも実行する。
- 既承認4IDのapply:block例外と監査表示を維持し、理由をS4へ更新。新規例外なし。

## 検証

- Composer validate/check-platform-reqs/install dry-run成功。Laravel11.57.0実版を確認。
- backend **101件検出=100成功・既存1skip・306assertions**。S3旧98件はクラス/メソッド名で全残存、新規3件のみ追加。警告/非推奨/notice表示を有効化し新規診断なし。
- SQLite/MySQLの追加回帰3件はそれぞれ27assertions成功。MySQLは使い捨てDB boxing_upgrade_s4_rollbackで実施し、元の開発DBには接続しない。
- 最初のMySQL専用artisan呼出しは--configuration重複警告が出たため、一時コンテナへ専用XMLをphpunit.xmlとしてマウントして再実行し警告なしで通過。Git管理XMLは変更していない。
- S3合成データ入りdumpをS4専用DBへ復元。35履歴保持、migrateはNothing to migrate。空のboxing_upgrade_s4_freshへ全35履歴成功。追加migrationなし/重複トークン表なし。
- 引継ぎDBは更新前後の型/NULL/default/extra/collation/index/primary/foreign keyが一致。freshとの機能差なし。guest_users.idのDBAL由来コメント(DC2Type:guid)だけfreshにはない。データ/ID形式を変更する差ではない。
- artisan serve/FPMの実HTTP各23チェック（集約含む）成功。CSRF cookie204、欠落/不正419、匿名/通常権限拒否401、通常/admin login/session/logout、コメント投稿/一覧/管理者削除、CORS許可/不許可を確認。
- audit **9件/5パッケージ、終了コード1**（S3の13件/6から減少）。Laravel4件と既存AWS/JWT/jmespath/psyshが残存。S5でLaravel全4件を修正済みの12.69.0以上と例外削除を確認する。

- Reviewer最終照合: S4ゲート通過は妥当。実装・必須中間検証の未解決指摘なし。承認済みのS5へ進んでよい。

## 復旧・残課題

- コード/lock基点81cbfc17、image boxing-talking-php:s3-8.3.35、/private/tmp/boxing-upgrade-s4/laravel10-before.sqlを保持。S3専用DBは保持しPHP/FPM/Nginxのみ停止した。
- S4は別Compose project/DB boxing_upgrade_s4、fresh/rollback DBともtmpfsの使い捨て環境。DBdump・ログ・XML・メール・環境変数はGitへ含めない。
- PHP8.3.35の重大2件、残る依存監査、Node16、Bearer認証の既存UUID整合性、本番/HTTPS/外部SMTP/S3は未解消。公開可能とは判断しない。
- S4のブラウザ総合・メール・最終frontend検証はユーザー承認どおりS5へ集約。S5前に中間コード/lockと専用DBdumpを保存する。
