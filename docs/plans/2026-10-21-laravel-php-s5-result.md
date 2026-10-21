# S5: Laravel 11→12 実行結果

## 状態と範囲

- **S5完了**。実装・自動テスト・MySQL/HTTP・ブラウザ/メール・最終Reviewer確認完了。S6前で停止。
- S4中間コミット664033daを基点に、承認済み合同計画で続行。ブランチcodex/laravel-php-s4-s5。S4の結果は2026-10-21-laravel-php-s4-result.mdを参照。
- PHP8.3.35/Composer2.9.4/Node16.13.2固定。S5の実装・検証結果はGit履歴で管理。push・本番反映なし。

## Tasks

- [x] S4中間ゲート・Reviewer確認・コミット・DBdumpを保存。
- [x] Laravel12/Carbon3/PHPUnit11と必須周辺依存へ部分更新。
- [x] Laravelの4例外を撤去し、監査Laravel0件を確認。
- [x] 日次処理のTokyo境界テスト追加、全自動テスト/検出比較。
- [x] MySQL fresh/引継ぎ/主キー・日次回帰/スキーマ/両HTTP/ログを確認。
- [x] ブラウザ主要操作・登録メール/ワーカー/本登録・最終Reviewer確認。
- [x] 結果記録を完了しS6前で停止。

## 依存・実装

| 対象 | S4 | S5 |
| --- | --- | --- |
| Laravel | 11.57.0 | 12.70.1 |
| Sanctum | 4.3.3 | 4.3.3 |
| Carbon | 2.73.0 | 3.15.0 |
| PHPUnit | 10.5.66 | 11.5.57 |
| Collision | 8.5.0 | 8.9.5 |
| Tinker | 2.10.0 | 2.11.1 |
| PsySH | 0.12.7 | 0.12.24 |

- frameworkの下限を^12.69.0@stable、PHPUnitを^11.5、Carbonを^3.0に指定。composer update対象はframework/phpunit/carbon/collision/tinker、-W --minimal-changes。4追加/29更新/削除0。
- Tinkerは初回dry-runでLaravel11までの制約により停止したため必須更新対象に追加。無差別な全依存更新はしていない。
- config.auditは既承認4件のignoreだけだったため全除去。更新ブロック/監査は有効、グローバル設定やblock-insecureは変更しない。
- 新規DeleteGuestUserTestの2件はTokyoの00:00:01/23:59:59に時計を固定し、2日前末尾のみ除去、前日始端/末尾・当日・activeの保持を検証。既存コマンドや日付仕様は変更していない。
- 既存Kernel/Provider/guard/ID生成を維持。HasUuidsのUUIDv7変更は独自Str::uuid()に適用しない。local diskのstorage/app明示を維持。既存PHPUnit XML/テスト期待値は変更不要。

## 検証結果

- backend **103件検出=102成功・既存1skip・320assertions、失敗0**。S4旧101件はクラス/メソッド名で全残存、追加は日次境界2件。警告/非推奨/notice表示を有効にし新規診断なし。
- frontend **52ファイル/204件成功**（host Node22.10.0/npm10.9.0）。PHPイメージ内Node16は変更していない。frontend実装/API契約変更なし、build/lintは今回再実行していない。
- PHP217ファイル構文成功。Composer validate/check-platform-reqs/install dry-run成功。PHP8.3.35の拡張/ini/SQLite/FPM設定成功。Laravel実版12.70.1。
- S4合成データ入りdumpをS5専用DBへ復元。引継ぎ35履歴保持・Nothing to migrate、空DBも35件全履歴成功。追加migration・トークン表再作成なし。
- 既存スキーマの型/NULL/default/extra/collation/primary/index/foreign keyはS4→S5の前後で一致。freshとの差はguest UUIDのDBAL由来DC2Type:guidコメントのみ。
- MySQL使い捨てDBで、主キー切替のデータ入りdown/up2回・NULL/重複拒否/4FK cascadeとTokyo日次境界の計5テスト/41assertions成功。
- artisan serve18081/Nginx→FPM18082のHTTP各23項目（集約含む）成功。CSRF cookie204/欠落・不正419、匿名・一般権限拒否401、通常/admin login/session/logout、コメント投稿/一覧/管理者削除、CORS許可・不許可を確認。
- 既存トークンの期限NULL・hash/abilities保持、期限日時の保存/cast/NULL復元、MySQLの実日次コマンド境界、Monologのlaravel.log/error.log/task.log実出力、schedule:list成功。
- audit **4件/3パッケージ、終了コード1**。Laravel0件。残りはaws/aws-sdk-php2件、firebase/php-jwt1件、mtdowling/jmespath.php1件。PsySHの既存1件も必須更新に伴い解消。未承認の例外追加なし。

## ブラウザ・メールの最終確認

- 専用Vite13002→Nginx/FPM18082で実操作。引継ぎセッション、通常/guest/adminのlogin/logout、試合一覧/詳細、通常ユーザーの管理者URL拒否、管理者フォーム表示を確認。試合結果一覧は合成データの過去試合0件に対応する空表示も確認。
- 通常ユーザーの投稿とreload後保持、guest投稿/投票を確認。合成match2の3票67/33が4票50/50へ更新。
- 既存コメントUIには削除操作が未接続（CommentsExistは表示/続きを読むのみ、useDeleteCommentは画面から未参照）。ブラウザ削除成功とは扱わない。実HTTPで管理者削除成功/一般拒否を確認し、ブラウザで投稿した合成guestコメントもAPI上1件→DELETE200→一覧から消失を追加確認。Reviewerがこの代替を妥当と判断。
- S5 Browser Userをブラウザ仮登録→database queue実worker→ローカルSMTP受信→受信メールのアカウント作成リンク→「アカウントが作成されました」→新規loginまで完了。最終DBは対象user1/pre_user0/jobs0/failed_jobs0。外部SMTPへは接続しない。
- コメント画面の遷移後に一時的な同一投稿の重複表示を観測。API上は1件、reload後は1件表示。管理者による検証用guest削除後のDBはguest投稿0/通常投稿1。既存newCommentsとcommentsを重複排除せず個別表示する構造があるが、更新前の再現確認はなく原因は断定しない。frontend変更なし、残課題として記録する。
- 証跡: /private/tmp/boxing-upgrade-s5/browser-results.json、delete-browser-comment.json、browser-comment-counts-final.log、browser-registration-before.log/after.log、browser-mail-worker.log、s5-browser-signup-login.png。受信メールとJWTは一時領域のみでGitに含めない。

## 環境・復旧・残課題

- S5は別Compose project boxing-upgrade-s5、DB boxing_upgrade_s5と使い捨てfresh/rollback DB。S4 DBは保持し、PHP/FPM/Nginxのみ停止。
- ブラウザ検証はloopback13002の専用Vite→18082のFPM API。Sanctum stateful/CORS/APP_URLはこの合成検証環境のみ整合させ、Git管理のfrontend設定は変更しない。
- SMTP11033と受信メールHTML preview11034はloopback限定。実利用者メール・外部SMTP・本番データへ接続しない。
- 復旧は中間コミット664033daのコード/lockと同じPHPイメージ、/private/tmp/boxing-upgrade-s5/laravel11-before.sql。S4/S3の専用DB・前段階dumpも保持。tmpfs/一時ファイルは永続バックアップ保証ではない。
- /private/tmp/boxing-upgrade-s5/に依存更新、各テスト、audit、DB/schema、HTTP、ログ等を保存。最終検証DBをlaravel12-verified.sql、PHP/FPM/Nginxログをruntime-final.logへ保存。環境変数・受信JWT・dump・生成物はGitへ含めない。
- PHP8.3.35の重大2件は未修正、残監査4件・Node16・Bearer認証の既存UUID整合性・HTTPS/本番構成・外部SMTP/S3は今回の解消対象外。公開可能とは判断しない。

## 最終Reviewer判断

- 実装/依存差分/テスト検出の継続/DB・HTTP・ブラウザ・メール証跡を確認し、修正必須の指摘・未実施の必須確認なし。削除UI未提供のHTTP代替、一時重複表示の未確定記録は妥当。S5完了・S6前停止を確認。
- S4は664033daで保存済み。S5も実装・検証結果をコミット保存。push・本番反映なし。次段階はユーザーの指示後に開始する。
