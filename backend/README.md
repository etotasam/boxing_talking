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

現在のLaravel 9は、未公開アプリの段階更新を検証するための中間版です。
外部公開せず、loopbackに公開先を限定した隔離環境・合成データ・ローカルSMTPのみで使用します。

Composer 2.9.2以降で利用できる `config.audit.ignore` の `apply: block` により、以下のIDだけ更新時のブロックを一時的に例外とします。`composer audit`での報告・失敗判定は維持します。グローバル設定と `block-insecure` は変更しません。

| ID | 理由 / 解除する修正版の目安 |
| --- | --- |
| `PKSA-d5tc-s1qs-h781` | デバッグ画面XSS。12.69.0 / 13.30.0以上 |
| `PKSA-m5cs-t1y6-qpcs` | 一時署名URL。12.61.1 / 13.12.0以上 |
| `PKSA-3r5d-mb8f-1qw9` | メールCRLF。12.60.0 / 13.10.0以上 |
| `PKSA-mdq4-51ck-6kdq` | 同じメールCRLFの別登録。上記と同時に解除 |
| `PKSA-8qx3-n5y5-vvnd` | ファイル検証回避。10.48.29以上 |

例外IDはバージョンに自動限定されません。各ステージで監査と照合して不要になったものから削除し、最終公開の前に例外なしで監査を確認します。現在のメール処理が無影響と確認されたという意味ではありません。
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
