# S6: Laravel 12→13 実行記録

## 状態

**S6完了。実装・自動/実HTTP・実ブラウザHTTPS・CA解除・最終Reviewer確認済み。S7以降は未着手。**

2026-10-22、ユーザーの「S6 を開始してくれ」により推奨計画を承認済みとして開始した。OS信頼ストア変更は別承認を取得し、ユーザーのOS認証後に一時CAを登録、実ブラウザ検証後に信頼設定と証明書項目を解除済み。

## Git / 対象

- worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。
- S5基点 `c1dae83ee5c30f9da637acd9d15becfed160210c` から新規 `codex/laravel-php-s6` を作成。HEADは基点のまま、今回分は未コミット。
- S5ブランチ `codex/laravel-php-s4-s5` と主checkoutは保持。
- 開始時の未コミット引き継ぎ文書・計画書を保持。push、本番反映、秘密情報参照なし。

## 依存と実装

| 対象 | S5 | S6 |
| --- | --- | --- |
| PHP | 8.3.35 | 8.3.35（固定） |
| Laravel | 12.70.1 | 13.38.0 |
| Tinker | 2.11.1 | 3.0.2 |
| PHPUnit | 11.5.57 | 12.5.40 |
| Ignition | 2.9.1 | 2.12.1 |
| Sanctum | 4.3.3 | 維持 |
| Collision | 8.9.5 | 維持 |
| Carbon | 3.15.0 | 維持 |

- PHP下限を^8.3、framework ^13.0@stable、Tinker ^3.0、PHPUnit ^12.0へ変更。
- 初回dry-runはIgnition2.9.1のLaravel12までの制約で停止。必須互換対応としてIgnitionだけ明示追加し、`-W --minimal-changes`で部分更新。1追加/26更新/2削除。
- 既存App VerifyCsrfTokenの親をLaravel13 PreventRequestForgeryへ置換。Appクラス名は維持し、既存web KernelとSanctum validate_csrf_tokenの両参照に同じ標準方針を適用。Kernel/Provider構造を置換していない。
- same-originはトークン検証省略、その他はfallback。originOnly/allowSameSite拡張は有効にしていない。
- session.serialization=phpを明示して継続。既存Cookie名・cache/Redis接頭辞を保持。
- cache.serializable_classes=falseを明示。検証用保存データ40件はint38/array1/bool1、object0。アプリの直接Cache利用は見つからず、throttleと互換markerを含め読み書きを確認。PHPオブジェクトの無制限復元を許可しない。
- backend READMEへ設定と方針を記載。新しい環境変数は追加していない。

## 検証済み

- S5dumpをS6専用MySQLへ実復元。35履歴、users10、boxing_matches2、jobs0/failed_jobs0を初期確認。履歴はNothing to migrate。更新前backend102成功/既存1skip/320assertions。
- PHPUnit12で旧103識別子すべて残存、追加61。最終全テストは **163成功/既存1skip/392assertions**。`--display-all-issues`で新規の未説明診断なし。
- 追加テストは通常省略されるCSRF判定を明示的に有効化し、web/Sanctum・HTTP/HTTPS・送信元/トークン・更新/読み取りメソッドの契約を確認する。
- frontend **52ファイル204成功**。host Node22.10.0/npm10.9.0。frontendコード変更なし、build/lintはS6では未再実行。
- MySQL fresh全35履歴成功、引継ぎ履歴維持。型/NULL/default/index/FK等を含む更新前後のschema構造差0（合成操作によるAUTO_INCREMENTカウンタは比較対象外）。
- MySQL専用rollback DBの既存回帰5件/41assertions成功。SQLiteの主キー往復・NULL/重複/FKとTokyo日次境界は全backendでも通過。
- Laravel12の同HTTPS hostname/APP_KEYで保存したログインsession/cacheを13で読み取り、Cookie名/接頭辞/serialization/marker/user_idを比較して一致。更新後書き込みも確認。
- Laravel12で投入した登録jobをLaravel13の実queue workerで処理。ローカルSMTP受信メールのJWTで実HTTP本登録→新規loginを確認。jobs/failed_jobs0。これは実ブラウザの登録確認の代替完了とは扱わない。
- 実HTTPS/HTTPのCSRFマトリクス135件成功。web更新4メソッドとSanctum stateful APIを確認。HTTP側はクライアントで明示的にCookieを再送した人工HTTP検証として記録。
- 採用版13.38.0もSec-Fetch-Siteを直接判定する実装。人工same-originヘッダーがあるHTTPでも通過する。ブラウザ自動ヘッダーの結果とは区別する。
- FPM HTTPSとartisan HTTPの主要23項目ずつ成功。CSRF cookie、欠落/不正419、匿名/一般権限拒否、通常/admin login/session/logout、投稿/一覧/管理者削除、CORSを確認。
- PHP238ファイル構文成功、Composer validate/check-platform-reqs/install dry-run成功。CLI実拡張/ini/SQLite往復、FPM設定、schedule:list、旧token hash/abilities/期限NULLと日時cast、実日次削除境界、3ログ出力成功。
- 実HTTPSプローブで **sapi=fpm-fcgi / PHP8.3.35 / secure=true / 必要拡張 / ini / SQLite往復** を確認。FPMコンテナ内CLIの記録とは区別する。
- FPM用一時プローブの初回はLaravelがerror_reporting=-1を設定することによるE_ALLとの厳密比較で失敗。E_ALL包含比較へ補正して成功した。診断を抑制したものではなく、ログに残る当該エラーは検証プローブ由来。
- audit **4件/3packages、Laravel0件**。既知残件はaws/aws-sdk-php2、firebase/php-jwt1、mtdowling/jmespath.php1。新規例外追加・監査無効化なし。

## 実ブラウザHTTPSの最終確認

- ユーザー承認とOS認証後、通常の証明書検証でHTTPSページを表示。警告クリック・ignoreHTTPSErrors・curl -k・検証無効化は使用していない。
- Nginx TLS18443→FPM、別送信元TLS18444、HTTP18084、内部Vite13003。すべてホストの127.0.0.1待受を維持。
- ブラウザUIのボタンで実fetchを発生させ、サーバー側で自動Sec-Fetch-Site/Origin/HTTPメソッド/ステータス/Cookie有無/secureを記録。人工ヘッダーの135件とは別の13要求。

| ブラウザ送信元→API | Sec-Fetch-Site | Cookie | 欠落/不正/正tokenの結果 |
| --- | --- | --- | --- |
| HTTPS localhost18443→同origin | same-origin | あり | 200/200/200 |
| HTTPS localhost18444→localhost18443 | same-site | あり | 419/419/200 |
| HTTPS 127.0.0.1:18444→localhost18443 | cross-site | なし | 欠落/不正とも419、CORSで応答本文は非公開 |
| HTTP localhost18084→HTTPS localhost18443 | cross-site（scheme差） | なし | 欠落/不正とも419、CORSで応答本文は非公開 |
| HTTP localhost18084→同HTTP origin | same-origin | あり | 200/200/200、アプリsecure=false |

- 最終行はloopbackをブラウザが信頼できる文脈と扱いSec-Fetch-Siteを送信する実動作。標準実装はisSecureを条件にしないためHTTPでもsame-originヘッダーで通過する。HTTP一律fallbackとは判定しない。ヘッダーなしのHTTP fallbackは別の実HTTP135件と追加テストで確認済み。
- cross-siteの正トークン単独検証は実HTTP表で補完。ブラウザ側はSameSiteによりCookie自体が抑止されることと、CORSの応答不可・サーバー419を分離して記録した。
- 実HTTPSのSet-CookieはSecure/SameSite=Lax、sessionはHttpOnlyを確認。値は証跡へ転記していない。
- 通常ユーザーのlogin/logout、一覧/試合詳細、コメント投稿とreload後保持（1件）を確認。新規一般ユーザーで管理者URL→homeへ戻り管理フォーム非表示も再確認。管理者login・管理メニュー/選手登録フォーム・logoutを確認。
- guest login→投稿→投票→logout成功。match2の投票は4票50/50→5票60/40へ更新。
- 過去試合一覧はS5同様、合成データに該当0件の空表示を確認。
- 未提供の削除UIは追加せず、ブラウザで投稿したguestコメントを実HTTPSで一般DELETE401→管理者DELETE200→APIから消失まで確認。通常コメントは1件保持。
- ブラウザ仮登録→database queue実worker→ローカルSMTP→受信HTMLの「アカウント作成」リンク→本登録成功表示→新規loginまで完了。対象user1/pre_user0/jobs0/failed_jobs0。
- S5で観測した一時重複表示は今回の投稿直後/reload/APIで各1件。更新前の同一手順との厳密対比は行っておらず、既存残課題の原因や解消を断定しない。frontendコード変更なし。
- 一時Vite設定にreact-refreshの解決先とサイトタイトル/説明の設定が不足しており、最初の描画で検証環境由来のエラーを観測。一時設定と参照先だけを補い再起動して解消。アプリコードは変更していない。
- 狭い検証viewportでは開発ツールの浮動ボタンが投稿欄に重なったため、PC幅1440で投稿を確認し、検証後にviewport overrideを解除。検証タブも閉じた。

### 一時CAの後片付け

- CA名: Boxing S6 Local Validation CA、SHA-256 `68:D8:42:30:A2:40:F9:28:78:19:3D:49:49:79:7E:A9:66:F2:78:73:9B:F8:22:77:54:61:81:6D:94:D7:86:FB`。
- `security remove-trusted-cert`でユーザー信頼設定を解除。指紋を照合して今回追加したlogin keychainの証明書項目だけ削除。
- `security find-certificate`で対象項目不在、OSの`verify-cert`でCSSMERR_TP_NOT_TRUSTEDを確認。CA信頼は残していない。証跡ca-cleanup.json。
- 証明書/秘密鍵ファイルは一時領域のみ、Git対象外。後日ブラウザ検証を再開する場合は必要な信頼設定を改めて扱う。

## 環境・証跡・復旧

- Compose project `boxing-upgrade-s6`、`/private/tmp/boxing-upgrade-s6/compose.yml`。
- S5 php/fpm/nginx/Viteは停止。S5と旧段階DB、SMTP11033/preview11034を保持。
- S6 DB `boxing_upgrade_s6`、fresh/rollback DBはS6専用tmpfs。S5を初期化していない。
- S6 vendor/storage/bootstrap-cache/.envは一時コピーを個別mount。S5の元vendor/storage/cacheを更新していない。
- `/private/tmp/boxing-upgrade-s6/laravel12-before.sql`はS6隔離環境に互換session/cache/queueを準備した更新直前DB。`laravel12-storage/`に保存内容コピー、`composer-s5.json`/`composer-s5.lock`に更新前依存定義。
- 元S5最終dumpは `/private/tmp/boxing-upgrade-s5/laravel12-verified.sql`。ブラウザ前のS6 DBを `laravel13-verified-partial.sql`、ブラウザ完了後を `laravel13-verified.sql`へ保存。tmpfsと一時ファイルは永続バックアップ保証ではない。
- 復旧はc1dae83eの別作業場所＋旧lockのDocker install＋`boxing-talking-php:s3-8.3.35`（image ID eea1a60ec115c7cc26283ac5cdcaf4d03543cf0e257b0d52de6bad7ea4b00cbd）＋dumpの新規専用DB復元。ユーザー差分のreset/再帰的強制削除/既存DB削除はしない。
- ログ: baseline-tests、backend-tests-final、frontend-tests、mysql-existing/fresh/regression、composer-checks、install-dry-run、audit.json、test-detection.json、csrf-http-matrix.json、http-results.json、http-cli-results.json、compat-result.json、fpm-http-runtime.json、php-lint.log、token-log-probes、daily-check、laravel12-job-worker等。
- JWT/メール/資格情報/dump/証明書private keyはGitへ含めない。

## Reviewer / 残リスク

- 実装差分に必須コード指摘なし。CSRFの両経路、61追加case、lock範囲、保存互換設定と検証を確認済み。
- FPM実HTTP SAPI証跡不足の指摘は、fpm-http-runtime.json追加で解消・Reviewer再確認済み。
- 前回Reviewerの確認待ち指摘を解消。最終Reviewerが実ブラウザ/メール/CA解除・最終テスト・差分を確認し、必須実装指摘・未実施ゲートなし、S6完了と判断。
- PHP8.3.35の重大2件は未修正。公式8.3.36修正掲載あり、今回確認時のDockerタグはnot found。既知監査4件も残る。本番公開可能とは判断しない。

### CA登録承認後の再開記録

2026-10-22、ユーザーが専用CAの一時信頼登録と検証後の解除を承認。登録時のOS認証はSecurityAgentのツール安全制限によりユーザーが実施。その後OS証明書検証成功を確認して実ブラウザ検証を再開した。完了後に信頼/証明書項目を解除した。S7未着手。

### ブラウザ証跡

/private/tmp/boxing-upgrade-s6/browser-origin-summary.json、browser-network.jsonl、browser-same-origin.json、browser-same-site.json、browser-cross-site.json、browser-scheme-cross-site.json、browser-http-same-origin.json、https-cookie-attributes.json、browser-normal-comment.txt/png、browser-guest-vote-comment.txt/png、browser-admin-form.txt、browser-preregistration.txt、browser-mail-worker.log、browser-registration-success.txt/png、browser-signup-login.txt/png、browser-comment-delete-result.json、ca-cleanup.json。受信HTML/JWTは一時領域のみでリンク先・本文をGitへ転記していない。

### 最終状態

最終backend163成功/既存1skip/392assertions、frontend204成功、MySQL回帰5成功/41assertions、実HTTP/HTTPS CSRF135件＋実ブラウザ13要求を確認。S6完了・S7前で停止。変更は未コミット、push/本番反映なし。スクリーンショットはIABの表示領域により一部が切れており、登録成功の厳密な証拠はbrowser-registration-success.txtと実DB/通信結果、ログインはbrowser-signup-login.txtおよび画像を参照する。
