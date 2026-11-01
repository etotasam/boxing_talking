<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Environment Variables

| Name | Description | Default |
| --- | --- | --- |
| `CUSTOM_ERROR_CODES_FRONTEND_OUTPUT_PATH` | `custom-error-codes:generate`で生成するフロントエンド定数ファイルの出力先 | `../frontend/src/constants/customErrorCodes.ts` |

## Laravel / PHPの段階更新中の制約

現在のLaravel 13.38.0 / PHP 8.5.12は、段階更新の最終構成です。S9で隔離環境の再構築・総合検証を完了しました。依存監査残件とNode/MySQLのサポート終了があるため、本番公開可能とは判定していません。検証ではloopback・合成データ・ローカルSMTPのみを使用します。

DockerのPHPは8.5.12（Debian 13/trixie）、Composerは2.9.4に固定しています。取得元digestは `docker/php/dockerfile` を参照してください。Nodeは既存の16.13.2を維持しています。
S7でPHP 8.4.27へ更新しました。S6までのPHP 8.3.35に残っていた重大な2件（CVE-2026-109618 / CVE-2026-109619）は、この更新版で修正されています。依存パッケージの監査残件は引き続き実行結果を参照してください。

Laravel 12.69.0以上への更新に伴い、中間版を通過するための4件の `config.audit.ignore` 例外をS5で削除しました。Composerの監査と更新ブロックは有効です。残る依存監査は実行結果を参照してください。グローバル設定や `block-insecure` は変更していません。

Laravel 11では未使用の `rorecek/laravel-ulid` と、native schema移行に伴い未使用となった `doctrine/dbal` の直接依存を除去しました。ID生成は既存の `Str::uuid()` を維持します。Sanctum 4の設定キーへ移行し、既存のCookie認証方式と公開済みのトークン表・期限列マイグレーションを維持しています。
SQLiteで全履歴を新規構築できるよう、スナップショット表の主キー切替はSQLite限定で再構築してから `id` を削除します。MySQLの処理と既存DBの適用済み履歴は維持します。

詳細な承認範囲・検証・復旧方法は [アップグレード計画](../docs/plans/archive/laravel-php/2026-10-19-laravel-php-upgrade.md) を参照してください。

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 1500 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the Laravel [Patreon page](https://patreon.com/taylorotwell).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Cubet Techno Labs](https://cubettech.com)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[Many](https://www.many.co.uk)**
- **[Webdock, Fast VPS Hosting](https://www.webdock.io/en)**
- **[DevSquad](https://devsquad.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[OP.GG](https://op.gg)**
- **[CMS Max](https://www.cmsmax.com/)**
- **[WebReinvent](https://webreinvent.com/?utm_source=laravel&utm_medium=github&utm_campaign=patreon-sponsors)**
- **[Lendio](https://lendio.com)**
- **[Romega Software](https://romegasoftware.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Laravel 13への移行設定（S6）

- PHP 8.3以上が必要です。S6の検証イメージはPHP 8.3.35です。
- `App\Http\Middleware\VerifyCsrfToken`はLaravel 13の`PreventRequestForgery`を継承します。webとSanctumのstateful APIに同じ方針を適用し、`Sec-Fetch-Site: same-origin`の要求はトークン検証を省略、それ以外は従来のCSRFトークン検証を行います。認証・権限の確認は引き続き必要です。
- `config/session.php`の`serialization`は`php`を維持し、既存セッションを引き継ぎます。`json`への切替はセッション失効を伴うため別途判断します。
- `config/cache.php`の`serializable_classes`は`false`です。キャッシュはスカラー・配列を使用し、PHPオブジェクトの保存が必要になった場合は必要なクラスの許可リストを検討してください。
- `SESSION_COOKIE`、`CACHE_PREFIX`、`REDIS_PREFIX`の既定値は既存設定を維持しています。新ひな型の接頭辞へ一括変更しないでください。
- HTTPSでの送信元検証は、信頼できる証明書を使って別途検証します。詳細・残課題はリポジトリルートの`docs/plans/archive/laravel-php/2026-10-22-laravel-php-s6-plan.md`を参照してください。

## PHP 8.4への移行（S7）

- S7時点のPHP要件は8.4以上でした。Laravelは13.38.0を維持し、PHPイメージを8.4.27へ更新しています。
- 暗黙nullable引数を明示し、省略/null時の意味を維持します。CSVのescapeは従来のバックスラッシュを明示し、出力形式を維持します。
- PHP8.4で非推奨となるnative session設定は指定せず既定値を使用します。native PHPのID設定は32桁/16進数になり、Laravel側のID生成、Cookie名、保存形式は維持します。

## PHP 8.5への移行（S8）

- 現在のPHP要件は8.5以上です。Laravel 13.38.0を維持し、PHPイメージを8.5.12へ更新します。
- PHP 8.4上でnette/schemaを1.3.3、nette/utilsを4.0.8へ先に更新し、その他の依存版を維持します。
- PHP 8.5で削除されたdisable_classes、非推奨のreport_memleaksは指定しません。register_argc_argv=Offを維持します。
- MySQLのSSL CAオプションにはPdo\Mysql::ATTR_SSL_CAを使用し、MYSQL_ATTR_SSL_CA環境変数の意味と証明書検証の条件を維持します。
- PHP 8.5ではOPcacheが組み込まれるため、外部opcache.soの追加ロードは行いません。

## 最終統合検証・公開前の残課題（S9）

最終lockから空vendorへComposer installし、frontendもlockからnpm ciして全テスト・build・lintを確認しました。専用MySQLの空DB構築と旧データ移行、実HTTP/ブラウザ、実worker/SMTP登録を含みます。詳細と復旧手順は[最終検証結果](../docs/plans/archive/laravel-php/2026-10-22-laravel-php-s9-result.md)を参照してください。

既存の依存脆弱性、PHPイメージ内Node16・frontend用DockerのNode21・MySQL8.0のサポート終了は別途対応が必要です。今回のfrontend検証はホストNode22.10.0で行い、既存DockerのNode21で成功したとは扱いません。本番デプロイ、外部SMTP/S3、本番TLS/DB、worker/cron運用と永続backup/restoreは別タスクで確認します。


## JWT 7系の鍵要件（P2）

- firebase/php-jwtは7.2.1を使用します。登録確認メールのJWTは従来どおりHS256・30分期限です。
- `storage/app/private/jwt-private.key`の内容をHS256の共通鍵として読み込みます。7系は32バイト未満の鍵を拒否します。長さだけでなく、十分な暗号学的乱数から生成された鍵を使用してください。
- JWT鍵とAPP_KEYを更新作業で一括変更しないでください。同じ要件適合鍵で署名された、有効期限内の6系tokenを引き継ぐ方針です。鍵を変更すると既存メールリンクに影響するため、再送・未処理queue・切替時点を含む移行を別途計画してください。
- 開発用鍵の最低長は値を表示せず確認しました。本番鍵の長さ・生成方法・メール/queue運用は未確認です。本番反映前に別途確認が必要です。

## Nodeとfrontendのビルド

PHP image内のNode 16/npmはP3で削除しました。現在のReact/Viteの開発・ビルドは
Composeのnodeサービスで行います。導入・起動手順は[frontend README](../frontend/README.md#dockerでの開発)を参照してください。
backend/package.jsonとwebpack.mix.jsの旧Laravel Mix設定は今回変更していませんが、
PHP container内では旧Mixのnpmコマンドを実行できません。
リポジトリルートの`npm run backend:generate-error-codes`等はホストnpmからDocker内PHPを呼ぶ手順であり、
PHP image内Nodeの削除による変更はありません。
