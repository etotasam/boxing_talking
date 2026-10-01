# Agent model refresh

## Goal

GPT-6.1 Sol の公開を踏まえ、各エージェントのモデルと推論強度を役割に合わせて見直す。2026-10-01 にユーザーが案Bの実装を承認した。

## Background / Context

現在は Explorer が GPT-5.6 Luna / medium、Planner が GPT-6 Astra / low、Worker と Tester が GPT-5.6 Luna / high、Reviewer が GPT-5.6 Sol / medium。

公式資料では GPT-6.1 Sol は複雑な作業で品質とコストを両立するモデル、Luna は範囲の定まった作業向けとされる。以下の役割別割り当ては、この説明を踏まえた提案であり、本リポジトリで性能比較した結果ではない。

- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/models/gpt-6-luna
- https://developers.openai.com/api/docs/guides/model-selection

このチャットの利用可能モデル一覧には `gpt-6.1-sol` と `gpt-6-luna` が含まれる。新設定での起動と性能は未検証。

## Scope

### In Scope

`.codex/agents/` の5つの TOML の `model` と `model_reasoning_effort` を更新する。

### Out of Scope

`.codex/config.toml`、権限、役割指示、SKILL.md、AGENTS.md、アプリ実装、依存関係、既存の無関係な差分の変更。

## Impact Area

今後起動する各役割のエージェントのモデル選択、処理時間、利用量、出力品質に影響する。画面、API、DB の振る舞いは変更しない。

## Options

- 案A: 5役すべて GPT-6.1 Sol に統一。設定は単純だが、調査や限定的なテスト作業でも Sol の利用量が発生する。
- 案B: Explorer / Tester は GPT-6 Luna、Planner / Worker / Reviewer は GPT-6.1 Sol。役割に応じて品質と利用量を配分する。Tester に複雑な仕様判断を任せる場合は品質を個別に確認する必要がある。
- 案C: Planner の Astra と Explorer / Tester の GPT-5.6 Luna を維持し、Worker / Reviewer のみ GPT-6.1 Sol。移行範囲は小さいが、Planner の高コストなモデルを常用し続ける。

## Decision

案Bを暫定設定として採用する。ユーザー承認済み。Reviewer の設計レビューでは、実装承認を妨げる重大な問題はないと評価された。運用での品質確認と起動確認の成功条件に関する指摘を Test Plan に反映した。

| Role | 現在 | 提案 | 理由 |
| --- | --- | --- | --- |
| Explorer | gpt-5.6-luna / medium | gpt-6-luna / medium | 根拠収集を中心とする役割に効率重視のモデルを使う |
| Planner | gpt-6-astra / low | gpt-6.1-sol / high | 複数案と影響範囲を検討するため、Sol と高い推論強度を試す |
| Worker | gpt-5.6-luna / high | gpt-6.1-sol / medium | 実装を担うモデルを強化し、通常作業では推論強度を抑える |
| Tester | gpt-5.6-luna / high | gpt-6-luna / high | 承認済みの仕様に対するテスト作成・実行を担当する |
| Reviewer | gpt-5.6-sol / medium | gpt-6.1-sol / high | 仕様漏れや回帰リスクの検討に推論を配分する |

## Rationale

設計、実装、レビューに Sol を配分し、根拠収集と仕様が明確なテスト作成に Luna を使う。全役 Sol 化より利用量を抑える狙いがある。ただし実際の時間・利用量・品質はタスク依存であり、改善を保証しない。Astra が必要な難しい設計は、そのタスクで別途判断する。

## Tasks

- [x] Reviewer subagent に提案を確認してもらう。
- [x] ユーザーの実装承認を得る。
- [x] メインエージェントが5つの TOML のモデル・推論強度を更新する。
- [x] TOML の構文、指定値、変更範囲を確認する。
- [x] Reviewer subagent に実装差分を確認してもらう。
- [x] 検証結果と未確認事項を報告する。

## Test Plan

TOML パーサーで5ファイルを読み込み、役割名、モデル名、推論強度、sandbox_mode、developer_instructions が意図した値であることを確認する。差分でモデル・推論強度以外が変わっていないことを検証する。アプリ実装を変更しないためフロント・バックエンドのテストは対象外。

新モデルでの起動確認は設定を再読み込みしたセッションで行う。Luna と Sol の役割を最低1つずつ確認し、可能なら実効モデル・推論強度も確認する。確認手段がない場合は、起動成功と実効値未確認を区別して報告する。現在のセッションで変更後の役割設定を使えない場合は起動確認を未実施と報告する。構文検証だけで、実際の読み込みや性能が確認済みとは報告しない。複数役の専用ベンチマークは追加利用量が発生するため今回の検証範囲に含めない。

通常運用の代表タスク数件で、手戻り・Reviewer 指摘・所要時間・利用量を観察する。旧設定との比較材料がなければ改善を断定せず、品質不足や利用量の増加が認められた役割は次回の見直し候補とする。これは運用上の判断基準であり、定期監視や追加エージェント起動を今回の作業で設定するものではない。

## Risks

- Worker の Luna から Sol への変更は利用量が増える可能性がある。
- Planner の Astra から Sol への変更と Worker の推論強度低下は、難しいタスクの品質を変える可能性がある。
- Tester はテスト設計も担うため、複雑な認証・DB・非同期処理では Luna の出力を Reviewer が確認する。
- 既存セッションの役割設定には変更が即時反映されない可能性がある。
- API 公開価格から ChatGPT プランの消費量や実費を断定しない。
- Planner の read-only 設定と提案書作成の役割には既存の制約がある。権限変更は今回のモデル更新と分離して扱う。

## Validation Results

- Python 3.11 の `tomllib` で5ファイルの構文・役割名・モデル名・推論強度を検証し、すべて成功。
- `model` と `model_reasoning_effort` を除く全設定が HEAD と一致することを確認。
- `git diff --check` 成功。
- Reviewer subagent の実装差分レビューは問題なし。承認済み案との一致と権限・役割指示に差分がないことを確認。
- アプリ実装を変更していないため、フロント・バックエンドのテストは対象外。
- 現セッションでは編集後 TOML の再読み込みを確認できないため、新設定での起動確認と実効モデル・推論強度の確認は未実施。性能比較も未実施。
