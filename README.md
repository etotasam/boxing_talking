# ボクシングについてトークするアプリです

[Boxing Talking](https://www.boxtalk.xyz/)

## 使用言語 フレームワーク ライブラリ等

### Docker

開発環境は Docker で作成し、開発しています。
本番環境では Docker は使用していません。

### React.js Typescript

vue.js と比べて使い慣れている React を使用しています。
型等でエラーを事前に察知してスムーズに開発できるように TypeScript を使用しています。

### Tailwind CSS

CSS ライブラリは自由度の高い Tailwind を採用しました。

### PHP, Laravel

backend は Laravel を api サーバーとして使用しています。

### AWS (EC2, S3, RDS, CloudFront, ALB)

frontend の静的ファイルは S3

backend は EC2
EC2 から github のコードを clone, pull でデプロイ
