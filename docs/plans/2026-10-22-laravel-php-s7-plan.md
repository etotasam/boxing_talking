# S7: PHP 8.3→8.4 実行提案

## Goal

PHP 8.3.35から8.4.27へ更新し、Laravel 13.38.0のまま既存動作を検証する。S7のみを実行し、S8を開始しない。本書の具体案は2026-10-22にユーザーの「go ahead」で承認済み。S7完了。

## Background / Context

2026-10-22 JST確認。

- 対象worktree: `/Users/terashimamasato/.codex/worktrees/laravel-php-s0/boxing_talking`。
- branch: `codex/laravel-php-s7`。HEAD: `6b62b109bb0333c2245eb2b17c9aeebb972ea55d`（S6完了コミット）。開始時の作業ツリーはclean。
- S6のDocker実版を再確認: PHP8.3.35 / Laravel13.38.0 / Composer2.9.4、platform要件成功。
- S6の記録: backend164識別子=163成功/既存1skip/392assertions、frontend52ファイル204成功。今回はまだ全件を再実行していない。
- S6の専用Compose、dump `/private/tmp/boxing-upgrade-s6/laravel13-verified.sql`（32,074 bytes）、復旧用8.3.35イメージを保持。一時領域は永続バックアップとは扱わない。実装前に復元・対応を再確認する。
- PHP公式は8.4.27を2026-10-22に公開し、前段階の重大2件に対応する修正を掲載。公式Dockerイメージのmanifest配布を確認済み。
- 採用候補: `php:8.4.27-fpm-trixie@sha256:070c5a1dac19c108905c09093e3f5cf228ece8feaea84e33135b3da99de32946`。実アーキテクチャと実行PHP版もビルド後に記録する。
- 手書きコードの暗黙nullableは4例外の`Throwable $previous = null`、TitleRepositoryとそのinterfaceの`int $organizationId = null`の計6宣言。
- 追加の実利用: DbDataToCsvControllerにescape未指定のfputcsvが2か所。php.iniにはPHP8.4で非推奨となるsession設定の明示値がある。
- Composer監査はS6時点で4件/3packages、Laravel0件。今回の監査結果と分けて扱う。

## Scope

### In Scope

- DockerfileのPHPだけを8.4.27/trixie/digest固定へ変更。Composer2.9.4、Node16.13.2、MySQL8.0.21を維持する。
- 暗黙nullable6宣言を`?Throwable` / `?int`へ変更し、省略・明示null・値ありの意味を維持する。
- CSV出力のescapeを従来のバックスラッシュで明示し、既存出力のバイト列を維持する。空文字escapeへの形式変更はしない。
- php.iniの非推奨session設定を点検し、PHP8.4既定値で成立する設定をコメント化する。非既定のsid_length=26 / sid_bits_per_character=5も見直すため、native PHPとLaravelのID生成・保存の利用箇所、更新前保存セッションの読取りを確認してから採用する。Laravelのcookie名・guard・保存先・ID生成・serializationは変更しない。非既定値へのアプリ依存が見つかった場合は停止・再提案する。
- `composer.json`のPHP下限を`^8.4`へ更新し、lockのplatformメタデータを整合させる。Laravel13.38.0と全パッケージのlock版をまず維持する。
- 必須のPHP8.4互換性修正・振る舞いテスト・README・実行記録の更新。
- 全体計画の共通確認を省略せず、S7でブラウザ主要フローも実施する。

### Out of Scope

- PHP8.5/S8以降、Laravel版の変更、依存の一括更新、新機能、API・DBスキーマ・エラーコード・認証仕様の変更。
- 本番アクセス・デプロイ・外部SMTP/S3、OS信頼ストア変更、新しいツールの導入。
- 既存CSVルートや業務仕様の整理、frontendコードの改修、Node/React/Vite/MySQLの更新。
- commit/pushは本計画に含めない。必要時はgit-commit手順で別途扱う。

## Impact Area

| 対象 | 内容 |
| --- | --- |
| docker/php/dockerfile | PHP base imageのみ8.4.27へ更新 |
| docker/php/env/php.ini | PHP8.4で非推奨となるsession指定の整理 |
| backend/composer.json / composer.lock | PHP要件とplatform整合。まずパッケージ版を変更しない |
| backend/app/Exceptionsの4ファイル | nullable宣言の明示、例外message/code/previousを維持 |
| TitleRepository / TitleRepositoryInterface | organizationId省略/null/値ありの既存意味を維持 |
| DbDataToCsvController | fputcsvのescape明示、CSV形式を維持 |
| backend/tests | 既存テストで保証されないCSV出力・nullable引数の分岐に限って補完 |
| README・docs/plans | 実行版、結果、診断、残リスク、復旧情報 |

## Options

1. PHPイメージだけ更新する。差分は小さいが、手書きコード・CSV・iniの非推奨を残す。
2. PHP8.4.27と必要な互換修正のみ実施する。原因を絞れ、Laravel固定で検証できる。依存由来の非推奨が出た場合は個別に対応版を調べる。
3. PHP8.5まで連続更新、又は依存を一括更新する。検証の重複は減るが、S7だけという依頼と段階ごとの切り分け方針に反する。

## Decision

案2を提案する。Reviewerは設計に問題なし・必須指摘なしと確認済み。2026-10-22に具体計画を承認済み。調査・設計・承認後の実装とテストはメインエージェントが行い、AGENTS.mdに従ってReviewerだけをsubagentとして利用する。

ブラウザ確認はloopbackのHTTP経路で共通業務フローを確認し、HTTPSのFPM実認識・Cookie属性・送信元/CSRFはCA検証付き実HTTPクライアントで別途確認する。S7の実ブラウザHTTPS確認と混同しない。全体計画で実ブラウザHTTPSを必須とするS6は既に完了しており、S7でそのOS信頼登録を再実行しない。S7でHTTPS実ブラウザが追加で必要と判明した場合は理由と方法を再提案する。

## Rationale

PHPの主更新を1段階に限定し、既存データ・権限・出力形式を保つ。公式修正済み8.4.27が取得可能なため、8.4.26以前へ下げる案は採用しない。ブラウザ共通項目をS8へ先送りせず、S7の基準を確立する。

## Tasks

- [x] S6完了コミット、S7 branch、cleanな開始点、実版、公式PHP8.4移行情報、候補イメージ配布を確認する。
- [x] Reviewerが設計・影響範囲・テスト・復旧方針を確認。新規の必須指摘なし、具体案の承認依頼へ進めると判断（2026-10-22）。
- [x] 具体的な変更対象・完了条件をユーザーへ提示し、「go ahead」で実装承認を取得。
- [x] S6のコード/lock/image/dump/storageを復旧点として記録する。稼働ワーカーを確認し、旧サービスは必要なものだけ停止する。旧DB・dumpは保持する。
- [x] S7専用Compose project、tmpfs MySQL、vendor/storage/bootstrap-cache、loopbackの検証ポートを一時領域に用意する。接続先を確認し、S6dumpを専用DBへ復元する。
- [x] 更新前のテスト検出・全backend・主要CSV出力・ini/拡張・セッション/キャッシュ/ジョブを保存する。旧PHPで用意したHTTP/HTTPSのデータをそれぞれ同じorigin/configで更新後に検証できるよう記録する。
- [x] Dockerfile、最小の互換修正、PHP要件/lockメタデータ、必要なREADMEを更新する。新しいイメージを別タグでビルドし、8.3.35イメージを保持する。
- [x] パッケージ版を変えずにlock整合とinstall再現を確認する。互換性のための依存更新が必要なら対象・理由・最小案を提示する。Laravelを更新せず、未承認の例外・監査無効化・ignore-platform-reqsで通過させない。
- [x] 下記の自動・実HTTP・MySQL・ブラウザ確認を行う。
- [x] Reviewerの最終差分確認後、必要な修正と関連再テストを実施する。
- [x] S7の結果と復旧情報を保存し、S8前で停止する。

## Test Plan

### 実行環境と依存

- PHP/artisan/PHPUnit/ComposerはDocker経由のみ。CLIと実FPMリクエストそれぞれでPHP8.4.27、拡張、読み込まれたini、timezone、E_ALLを確認する。起動時のstderrも確認する。
- pdo_mysql/pdo_sqlite/SQLite3/mbstring等、S6の実拡張との増減、SQLite読み書きを比較する。PCRE/libxml/OpenSSL等の周辺版も記録し、単にpackage platformチェック成功で実拡張ありとは断定しない。
- Composer validate / check-platform-reqs / lockからのinstall dry-runと実導入、Laravel13.38.0固定・全lock差分を確認する。auditの4既知残件と新規分を分離する。
- PHP8.4移行ガイドの非互換・非推奨一覧を実利用と照合し、手書きコード、起動、実worker、vendor由来の診断を区別する。警告を一括抑制しない。

### 自動テスト

- 更新前後に全backendを実行し、旧164識別子の残存・成功/skip/assertions・警告を比較する。既存1skipの理由を維持する。
- nullableは型の反映だけのテストを増やさず、例外チェーン/message/code、タイトル削除のorganizationId省略/null/指定ありで対象・対象外のDB状態が保たれることを既存テストと必要な補完で確認する。
- CSVはcomma/quote/backslash/newline/null/空値を含む合成データで公開outputから保存結果を確認し、8.3の出力バイト列と比較する。非推奨警告やエラー本文の混入がないことも確認する。
- S6のCSRF61ケースとDB/日時境界テストを含める。新規テストは実装の行数に合わせて増やさず、変更で影響する既存仕様に限定する。
- frontendコード/API契約は維持する。中間段階のbuild/lintは省略可とする全体計画に従い未実施理由を記録し、認証等への追加影響が出た場合は関連Vitestを実行する。

### DB・実HTTP・業務フロー

- S6dump復元のS7専用MySQLで35履歴と既存データ保持、主要read/write・制約・回帰テストを確認する。PHP段階なのでfresh全履歴の再確認は必須としない。既存開発DBへRefreshDatabase/freshを向けない。
- CLI/FPM双方、実HTTP/HTTPSのCSRF・Cookie・CORS・認証継続・通常/guest/admin・一般権限拒否・コメント投稿/管理者削除を確認する。S6のsame-originでトークンを省略する標準動作を維持し、HTTP一律419とは判定しない。
- 8.3で保存したセッション/キャッシュを同じorigin/APP_KEY/設定の8.4で読み書きし、旧ジョブを8.4の実workerで処理する。Cookie名・保存形式・cache接頭辞を維持する。
- 実ブラウザで通常/guest/admin login/logout、権限、一覧/詳細、コメント投稿とreload、投票を確認する。削除UIは既存どおり未提供のため、ブラウザ投稿を一般DELETE拒否/管理者成功の実HTTPと再表示で補完する。
- 実ブラウザの仮登録→ローカルSMTP受信→登録リンク→本登録→新規loginを確認する。合成宛先のみを使い、database queueの実workerで処理する。
- 日次処理・ログは専用ダミーデータとTokyo境界の既存テストで確認する。未実施必須項目は保留し、完了扱いにしない。

## Risks

- iniのnative PHP session ID既定値とLaravel保存sessionの混同。利用確認と保存データの移行前後比較を必須とする。
- CSV escapeを推奨の空文字へ変更すると既存バイト列が変わり得るため、従来値を明示する。既存CSV業務仕様の改善は含めない。
- vendor/iniの非推奨がテスト成功に隠れ得る。CLI/FPM起動・実workerのstderrとログも確認する。
- Dockerfileの既存Node16導入が新base imageで失敗する可能性がある。Node更新は混在させず、必要なら具体案を再提案する。
- パッケージ監査の既知4件はPHP更新だけでは解消しない。新規の例外を追加しない。PHP8.4.27の修正掲載だけで環境全体に脆弱性なしとは判断しない。
- temp領域のdumpや依存データ消失。S6復旧点を保持し、S7用領域を分離する。復旧はS6コード/lock/8.3.35イメージとdump/storageの組で行い、reset --hardや旧DB初期化は使わない。

## References

- 全体計画: [Laravel/PHP段階更新](2026-10-19-laravel-php-upgrade.md)
- [PHP8.4非互換](https://www.php.net/manual/en/migration84.incompatible.php)
- [PHP8.4非推奨](https://www.php.net/manual/en/migration84.deprecated.php)
- [PHP8.4その他変更](https://www.php.net/manual/en/migration84.other-changes.php)
- [PHP8.4.27 changelog](https://www.php.net/ChangeLog-8.php#8.4.27)
- [Docker公式PHP](https://hub.docker.com/_/php)
