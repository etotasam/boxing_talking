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

現在のLaravel 12は、未公開アプリの段階更新を検証するための中間版です。外部公開せず、loopbackに公開先を限定した隔離環境・合成データ・ローカルSMTPのみで使用します。

DockerのPHPは8.3.35（Debian 13/trixie）、Composerは2.9.4に固定しています。取得元digestは `docker/php/dockerfile` を参照してください。Nodeは既存の16.13.2を維持しています。
PHP 8.3.35は重大な2件（CVE-2026-109618 / CVE-2026-109619）が未修正です。S3実行時には修正版8.3.36の公式Dockerタグが未配信でした。今回PHPは固定し、修正イメージ取得後の更新・再検証は別途必要です。

Laravel 12.69.0以上への更新に伴い、中間版を通過するための4件の `config.audit.ignore` 例外をS5で削除しました。Composerの監査と更新ブロックは有効です。残る依存監査は実行結果を参照してください。グローバル設定や `block-insecure` は変更していません。

Laravel 11では未使用の `rorecek/laravel-ulid` と、native schema移行に伴い未使用となった `doctrine/dbal` の直接依存を除去しました。ID生成は既存の `Str::uuid()` を維持します。Sanctum 4の設定キーへ移行し、既存のCookie認証方式と公開済みのトークン表・期限列マイグレーションを維持しています。
SQLiteで全履歴を新規構築できるよう、スナップショット表の主キー切替はSQLite限定で再構築してから `id` を削除します。MySQLの処理と既存DBの適用済み履歴は維持します。

詳細な承認範囲・検証・復旧方法は [アップグレード計画](../docs/plans/2026-10-19-laravel-php-upgrade.md) を参照してください。

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
