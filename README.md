# AI開発チーム スターターキット

Claude Codeで動く「AI開発チーム」の初期構成一式です。
要件定義から実装・テストまでをカバーする5ロール構成で、
実務レベルの開発プロセスをAIエージェントで再現します。

---

## このスターターキットの目的

- Claude Codeに複数の専門ロールを持たせ、開発プロセスを効率化する
- ドキュメント・仕様・テストを一貫して管理できる構造を提供する
- チームに新しい開発フローとして導入できるテンプレートを提供する

---

## フォルダー構成

```
ai-dev-team-starter/
├── CLAUDE.md                          # 共通ルール（Claude Codeが自動読込）
├── README.md                          # このファイル
├── agents/                            # エージェント定義
│   ├── knowledge-researcher.md
│   ├── business-analyst.md
│   ├── engineer.md
│   ├── tester.md
│   └── project-manager.md
├── skills/                            # 定型作業テンプレート
│   ├── write-spec/SKILL.md
│   ├── implement-feature/SKILL.md
│   ├── create-playwright-test/SKILL.md
│   ├── exploratory-test-antigravity/SKILL.md
│   └── summarize-changes/SKILL.md
└── docs/                              # 知識ベース
    ├── product/
    │   ├── vision.md
    │   └── target-user.md
    ├── requirements/
    │   ├── mvp.md
    │   └── acceptance-criteria.md
    ├── architecture/
    │   └── overview.md
    ├── runbooks/
    │   ├── deploy.md
    │   └── test.md
    ├── decisions/
    │   └── 0001-initial-setup.md
    └── examples/                      # エージェント動作例
        ├── pm-example.md
        ├── ba-example.md
        ├── engineer-example.md
        └── tester-example.md
```

---

## 各エージェントの役割

| エージェント | ファイル | 担当 |
|---|---|---|
| Project Manager | `agents/project-manager.md` | タスク分解・優先順位・完了条件の管理 |
| Business Analyst | `agents/business-analyst.md` | 要望の仕様化・MVP整理・受け入れ条件 |
| Knowledge Researcher | `agents/knowledge-researcher.md` | 情報収集・不明点整理・関連ファイル提示 |
| Engineer | `agents/engineer.md` | 最小差分での実装・影響範囲の整理・検証 |
| Tester | `agents/tester.md` | Playwright + Antigravityによる検証・バグ報告 |

---

## 初期運用フロー

```
PM → BA → Knowledge Researcher → Engineer → Tester → (バグあり) → Engineer → Tester
```

1. **PM** がタスクを分解し、優先順位と完了条件を定義する
2. **BA** が要望を仕様化し、受け入れ条件を作成する
3. **Knowledge Researcher** が既存ドキュメント・コードを調査し、実装に必要な情報を整理する
4. **Engineer** が最小差分で実装し、動作確認する
5. **Tester** がPlaywrightとAntigravityで検証し、バグを報告する
6. バグがある場合は **Engineer** に差し戻し、修正後に再テストする

### エージェント間連携フロー（詳細）

```
┌─────────────────────────────────────────────────────┐
│  Project Manager                                     │
│  └─ タスク定義・優先順位・依存関係・完了条件        │
└────────────────────┬────────────────────────────────┘
                     ↓ 仕様化依頼
┌─────────────────────────────────────────────────────┐
│  Business Analyst                                    │
│  └─ 要件定義・受け入れ条件・スコープ整理            │
└────────────────────┬────────────────────────────────┘
                     ↓ 調査依頼
┌─────────────────────────────────────────────────────┐
│  Knowledge Researcher                               │
│  └─ 既存コード・ドキュメント調査・不明点整理        │
└────────────────────┬────────────────────────────────┘
                     ↓ 実装依頼（仕様書＋調査結果を渡す）
┌─────────────────────────────────────────────────────┐
│  Engineer                                           │
│  └─ 最小差分実装・影響範囲整理・動作確認            │
└────────────────────┬────────────────────────────────┘
                     ↓ テスト依頼（実装内容を渡す）
┌─────────────────────────────────────────────────────┐
│  Tester                                             │
│  ├─ Playwright: 正常系・異常系・境界値              │
│  └─ Antigravity: 探索的テスト・UI崩れ・想定外操作  │
└────────────┬───────────────────────────────────────┘
             │ バグあり → Engineerへ差し戻し
             │ バグなし → PMへ完了報告
             ↓
┌─────────────────────────────────────────────────────┐
│  Engineer（バグ修正）                               │
│  └─ バグ修正 → Testerへ再テスト依頼               │
└─────────────────────────────────────────────────────┘
```

---

## Claude Codeでの使い方

### 基本的な呼び出し方

```
agents/project-manager.md を読んで、以下のタスクを分解してください：
「ユーザー登録機能を追加したい」
```

```
agents/business-analyst.md を読んで、以下の要望を仕様化してください：
「ユーザーがメールアドレスとパスワードで登録できるようにしたい」
```

```
agents/knowledge-researcher.md を読んで、
現在の認証周りのコードとドキュメントを調査してください。
```

```
agents/engineer.md を読んで、
docs/requirements/mvp.md の仕様に従いユーザー登録機能を実装してください。
```

```
agents/tester.md を読んで、
ユーザー登録機能のテストを Playwright と Antigravity の両モードで実施してください。
```

### エージェント呼び出し例（詳細）

各エージェントの具体的な呼び出し例は `docs/examples/` を参照してください。

---

## 最初の1週間の運用例

### Day 1（月曜）— プロジェクト定義
- CLAUDE.md / README.md をチームの実情に合わせて編集する
- `docs/product/vision.md` と `docs/product/target-user.md` を更新する
- PMエージェントを呼び出してマイルストーンとタスクリストを作成する

### Day 2（火曜）— 要件定義
- BAエージェントを呼び出して最初の機能の仕様書を作成する
- `docs/requirements/mvp.md` を更新する
- Knowledge Researcherで既存コードの状況を把握する

### Day 3（水曜）— 実装
- Engineerエージェントを呼び出して機能を実装する
- 実装は最小差分を意識し、テストが書けるレベルで止める

### Day 4（木曜）— テスト
- Testerエージェントを呼び出してPlaywrightテストを作成・実行する
- Antigravityで探索的テストを実施し、バグを洗い出す
- バグがあればEngineerに差し戻す

### Day 5（金曜）— 振り返りと整理
- `docs/decisions/` に今週の意思決定を記録する
- `skills/summarize-changes/SKILL.md` を使って変更内容を整理する
- 次週のタスクをPMエージェントで整理する

---

## 次にやること

1. `docs/product/vision.md` を実際のプロジェクト内容で上書きする
2. `docs/requirements/mvp.md` に最初に作るものを記載する
3. `agents/project-manager.md` を呼び出して最初のタスク分解を行う
4. 開発が進んだら `tests/` フォルダーを作成しPlaywrightを追加する
5. CI/CDが整ったら `docs/runbooks/deploy.md` を更新する

---

## 完全セットアップ手順（初回のみ）

VS Codeでこのフォルダーを開いたら、以下を上から順に実行するだけです。

### Step 1 — Node.js の確認

```bash
node -v    # v18 以上であること
npm -v     # v9 以上であること
```

インストールされていない場合は https://nodejs.org から LTS版をインストールしてください。

### Step 2 — 依存パッケージのインストール

```bash
# ai-dev-team-starter フォルダーで実行
npm install
```

### Step 3 — 開発サーバーの起動確認

```bash
npm run dev
# → http://localhost:3000 が開けば OK
# Ctrl+C で停止
```

または `start-dev.bat` をダブルクリック（以降はこちらを使う）。

### Step 4 — Playwright のインストール

```bash
npx playwright install
# ブラウザ（Chromium / Firefox / WebKit）が自動でインストールされます
```

### Step 5 — Claude Code の起動

VS Code のターミナルで `ai-dev-team-starter` フォルダーに移動し：

```bash
claude
```

または VS Code 拡張機能（Claude Code）を使う場合はサイドバーのアイコンをクリック。

### Step 6 — `/day-run` で今日の開発を開始

Claude Code のプロンプトに入力：

```
/day-run Day1 シンプルなカウンターアプリ
```

PM → BA → Engineer → Tester → X投稿 が自動で流れます。

---

## 毎日の最短運用フロー

毎朝このフローを上から順に進めるだけで、開発〜テスト〜発信まで完結します。

```
① start-dev.bat をダブルクリック
   → http://localhost:3000 が起動

② Claude Code で /day-run DayXX [今日作るもの]
   → PM → BA → Engineer → Tester → X投稿 が自動出力

③ run-e2e.bat をダブルクリック（テスト実行）
   → playwright-report/index.html で結果確認

④ バグがあれば /bug-loop [テストレポートを貼り付け]
   → 修正依頼カードが生成される

⑤ /eng [bug-loop のコピペ用テキスト]
   → 修正コードが出る → ③ に戻って再テスト

⑥ run-check.bat をダブルクリック（push 前の最終確認）
   → lint + build + e2e が順番に走る
   → "ALL PASSED" が出たら push OK

⑦ /xpost [今日の内容]
   → X（Twitter）投稿文3パターンが生成される
```

> **ポイント**: ①〜⑦ のうち、ターミナルに触るのは ①③⑥ のダブルクリックだけ。
> ②④⑤⑦ はすべて Claude Code の入力のみで完結します。

---

## ターミナル最小化セット（Windows）

毎日の開発で使うターミナル操作を **ダブルクリック3本** に絞ります。
Claude Code のコマンドと組み合わせて、実装以外の手間をゼロに近づけます。

### .bat ファイル一覧

| ファイル | 役割 | 使うタイミング |
|---|---|---|
| `start-dev.bat` | 開発サーバー起動（`npm run dev`） | 朝一番・開発開始時 |
| `run-e2e.bat` | Playwright E2E テスト実行 | `/test` の後・バグ修正後 |
| `run-check.bat` | lint → build → e2e を順番に実行 | push / PR 前の最終確認 |

> **使い方**: ファイルをダブルクリックするだけ。
> 実行後はウィンドウが残るので結果を確認できます。
> `run-check.bat` はどこかで失敗するとそこで止まり、理由を表示します。

---

### npm scripts（`package.json`）

```json
"scripts": {
  "dev":          "next dev",
  "build":        "next build",
  "start":        "next start",
  "lint":         "next lint",
  "test:e2e":     "playwright test",
  "test:e2e:ui":  "playwright test --ui",
  "check":        "npm run lint && npm run build && npm run test:e2e"
}
```

| スクリプト | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動（= `start-dev.bat`）|
| `npm run test:e2e` | ヘッドレステスト（= `run-e2e.bat`）|
| `npm run test:e2e:ui` | Playwright UI モード（テスト選択・デバッグ用）|
| `npm run check` | lint + build + e2e 一括（= `run-check.bat`）|

---

### 毎日のおすすめ運用手順

```
【朝】開発開始
  1. start-dev.bat をダブルクリック → http://localhost:3000 が開く
  2. Claude Code で /day-run DayXX アプリ名
     → PM → BA → Eng → Test → X投稿 が自動で流れる

【実装中】バグが出たら
  3. run-e2e.bat で現状確認
  4. Claude Code で /bug-loop [テストレポートを貼り付け]
     → 修正依頼カードが生成される
  5. Claude Code で /eng [bug-loopのコピペ用テキスト]
     → 修正コードが出る
  6. run-e2e.bat で再テスト → グリーンになるまで繰り返す

【夕方】push 前の最終確認
  7. run-check.bat をダブルクリック
     → lint + build + e2e が順番に走る
     → ALL PASSED が出たら push OK
     → FAILED が出たら Claude Code で原因確認

【発信】
  8. Claude Code で /xpost 今日の内容
     → 投稿文3パターンが生成される → X（Twitter）に投稿
```

---

### Claude Code コマンドとの使い分け

| やること | 使うもの |
|---|---|
| 開発サーバー起動 | `start-dev.bat` |
| 今日の全工程実行 | `/day-run DayXX アプリ名` |
| テスト実行 | `run-e2e.bat` |
| テストをデバッグしたい | `npm run test:e2e:ui` |
| バグ修正依頼を作る | `/bug-loop` → `/eng` |
| push前の最終確認 | `run-check.bat` |
| X投稿文を作る | `/xpost` |

---

## アイデア〜収益化 フルフロー（最強構成）

100日チャレンジを「SaaS収益化」まで繋げるフルフローです。
朝の5分でアイデアを評価し、GO なら `/day-run` で今日の開発へ直行します。

### フロー全体図

```
┌─────────────────────────────────────────────────────────────────┐
│  DISCOVERY フェーズ（アイデア → 投資判断）                        │
│                                                                   │
│  /idea-sprint → /market-check → /monetize → /invest-check        │
│       ↓               ↓              ↓            ↓              │
│  アイデア評価    市場性評価      課金設計      GO/NO-GO判断        │
│  (25点満点)     (25点満点)    (収益モデル)    (50点満点)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ GO のとき
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  BUILD フェーズ（設計 → 実装 → テスト → 投稿）                   │
│                                                                   │
│  /day-run DayXX [アプリ名]                                       │
│       ↓                                                           │
│  PM → BA → Engineer → Tester → X投稿                             │
│                  ↑         ↓                                      │
│              /bug-loop ←← バグ報告                               │
└─────────────────────────────────────────────────────────────────┘
```

### 最短コマンド（朝一番）

```
# ① アイデアがある場合 → すぐ開発開始
/day-run Day12 習慣トラッカーアプリ

# ② アイデアから決めたい場合 → 5分で評価してから開発
/idea-sprint 生産性・タスク管理系
→ スコア1位のアイデアを確認
→ /invest-check [アプリ名と概要]
→ GO なら /day-run DayXX [アプリ名]
```

---

### DISCOVERY フェーズの使い方

#### `/idea-sprint` — アイデアを複数出して厳選する

```
# テーマを渡す
/idea-sprint 健康・フィットネス系で1日で作れるもの

# テーマなしで汎用的に
/idea-sprint
```

**出力**: アイデア3〜5件（25点満点スコア）/ サマリーテーブル / おすすめTOP1 + 次アクション

---

#### `/market-check` — 市場性を検証する

```
# idea-sprint の出力を引き継いで使う
/market-check ポモドーロタイマーアプリ: 作業集中と休憩を25分サイクルで管理。継続利用フックあり。

# 自分のアイデアを直接評価
/market-check 毎朝の天気をSlackに自動投稿するBot
```

**出力**: ターゲット分析 / 競合比較テーブル / 差別化分析 / 市場規模試算 / 市場性スコア（25点満点）

---

#### `/monetize` — 課金・収益モデルを設計する

```
/monetize ポモドーロタイマーアプリ
引き継ぎ: 一次ターゲット=会社員/フリーランス / 市場性スコア=18/25 / 推奨単価=¥300〜¥500
```

**出力**: 収益モデル選定 / 無料/有料プラン設計 / 価格根拠 / 保守的収益試算 / 100日後目標

---

#### `/invest-check` — 投資価値を最終判定する（必須）

```
# 前フェーズの情報を渡す
/invest-check ポモドーロタイマーアプリ
アイデアスコア: 19/25
市場性スコア: 18/25
収益モデル: フリーミアム / 月額¥490 / MRR目標¥5万（Day100）
```

**出力**: 🟢 STRONG GO / 🟡 GO / 🟠 CONDITIONAL / 🔴 NO-GO + スコア（50点満点）+ 撤退条件

---

### エージェント直接呼び出し

より詳細な分析が必要な場合は `.claude/agents/` のエージェントを直接呼び出します。

```
# アイデアを詳しく分析
@idea-strategist を読んで、教育系SaaSのアイデアを5件評価してください。

# 競合を詳しく調べる
@market-researcher を読んで、ポモドーロタイマー市場の競合を詳細分析してください。

# 収益モデルを詳しく設計する
@monetization-architect を読んで、月額¥490のフリーミアム設計を詳細に作ってください。

# 投資判断を詳しく得る
@product-investor を読んで、以下のアプリを投資家視点で評価してください。[詳細]
```

---

### 3パターンの使用例

#### パターン1: 朝5分でアイデア評価 → すぐ開発

```
08:00  /idea-sprint 生産性ツール系
       → スコア1位「集中時間記録アプリ」22/25 ✅ 推奨

08:03  /invest-check 集中時間記録アプリ
       アイデアスコア: 22/25
       → 🟡 GO（35/50）

08:05  /day-run Day15 集中時間記録アプリ
       → 全フェーズが自動的に流れる（PM→BA→Eng→Test→X投稿）
```

#### パターン2: 市場性を確認してから開発

```
/idea-sprint タスク管理系
↓（おすすめTOP1を選ぶ）
/market-check [アプリ名と概要]
↓（市場性スコア 20/25以上なら）
/invest-check [全情報を引き継ぎ]
↓（🟢 STRONG GO なら）
/day-run DayXX [アプリ名]
```

#### パターン3: バグが出た → 修正ループ

```
/test 電卓アプリ（http://localhost:3000）
↓（バグ2件発見）
/bug-loop [テストレポートを貼り付け]
↓（修正依頼カードが生成される）
/eng [bug-loopのコピペ用テキストを貼り付け]
↓（修正完了）
/test 電卓アプリ（再テスト）
↓（バグ0件）
/xpost Day11 電卓アプリ完成。バグ修正も完了。
```

---

### 1日の運用フロー

```
【朝 8:00〜8:10】DISCOVERY（10分）
  /idea-sprint または /invest-check
  → GO なら /day-run へ / NO-GO なら別アイデアへ

【午前 8:10〜12:00】BUILD（約4時間）
  /day-run DayXX [アプリ名]
  → PM → BA → Engineer → Tester が自動的に流れる

【バグが出た場合】BUG LOOP
  /bug-loop → /eng → /test（繰り返し）

【夕方】SHIP & POST
  /xpost → X（Twitter）に投稿
  （将来）/ship → /create-pr でGitHub PR作成

【毎週末】REVIEW
  今週のアプリで一番反応がよかったものを振り返り
  → SaaS化候補にストックする
```

---

## 100日チャレンジ用スキル・スラッシュコマンド

スキルの実体は `.claude/skills/<name>/SKILL.md` にあります。
`.claude/commands/<name>.md` はスキルを呼ぶ薄いラッパーで、`/コマンド名` で実行できます。

### スキル一覧

#### DISCOVERY スキル（アイデア → 投資判断）

| コマンド | スキルファイル | 用途 |
|---|---|---|
| `/idea-sprint` | `.claude/skills/idea-sprint/SKILL.md` | **アイデア高速生成・厳選（25点満点）** |
| `/market-check` | `.claude/skills/market-check/SKILL.md` | 市場性評価（競合・ターゲット・規模）|
| `/monetize` | `.claude/skills/monetize/SKILL.md` | 課金・収益モデル設計 |
| `/invest-check` | `.claude/skills/invest-check/SKILL.md` | **投資家評価 GO/NO-GO（50点満点）** |

#### BUILD スキル（設計 → 実装 → テスト → 投稿）

| コマンド | スキルファイル | 用途 |
|---|---|---|
| `/day-run` | `.claude/skills/day-run/SKILL.md` | **全工程一括（朝一番に使う）** |
| `/pm` | `.claude/skills/pm/SKILL.md` | 今日のMVP計画・タスク分解 |
| `/ba` | `.claude/skills/ba/SKILL.md` | ミニ仕様書・受け入れ条件作成 |
| `/eng` | `.claude/skills/eng/SKILL.md` | 最小差分で実装 |
| `/test` | `.claude/skills/test/SKILL.md` | Playwright（コード）+ Antigravity（操作ログ）|
| `/bug-loop` | `.claude/skills/bug-loop/SKILL.md` | テスト結果 → Engineer修正依頼に変換 |
| `/xpost` | `.claude/skills/xpost/SKILL.md` | X投稿文3パターン（150〜220文字）|

---

### `/day-run` — 一番のおすすめ（朝一番に使う）

朝一番に今日作るものを渡すだけで、**PM→BA→Engineer→Tester→X投稿の全工程を順番通りに出力** します。
各フェーズは前フェーズの出力を引き継ぎ、並列出力しません。

```
/day-run シンプルなパスワード生成ツール（文字数・記号有無を選べる）
```

**フェーズ構成と引き継ぎの流れ**:
```
PHASE 1: PM
  └─ 入力「今日作るもの」→ ゴール・MVPスコープ・実行順序を定義
         ↓ ゴール・Mustタスク・スコープ外を引き継ぐ
PHASE 2: BA
  └─ PMのスコープ → 機能要件・受け入れ条件・スコープ外を仕様書に
         ↓ 機能要件・受け入れ条件を引き継ぐ
PHASE 3: Engineer
  └─ BAの仕様書 → 実装コード（data-testid付き）・変更ファイル一覧
         ↓ data-testid一覧・受け入れ条件を引き継ぐ
PHASE 4: Tester
  └─ Engineerの実装 → Playwrightコード + Antigravity操作ログ + バグ報告
     ├─ Highバグ → PHASE 3に差し戻し → 修正 → PHASE 4再実行
         ↓ 今日の成果・学び・バグ情報を引き継ぐ
PHASE 5: X投稿
  └─ 全工程の成果 → 投稿文3パターン（成果・学び・リアル）
```

---

### `/pm` — 計画だけ先に立てたいとき

```
/pm 習慣トラッカーのストリーク表示機能
```

**出力**: 今日のゴール / MVPスコープ（やること・やらないこと）/ 実行順序 / 完了判定チェックリスト / リスク

---

### `/ba` — 仕様書だけ欲しいとき

```
/ba ユーザーが毎日の習慣を記録し、連続達成日数（ストリーク）を表示したい
```

**出力**: ミニ仕様書（目的・機能要件・受け入れ条件・スコープ外・未確認事項）

---

### `/eng` — 実装だけしたいとき

```
/eng ストリーク表示コンポーネントを実装する。仕様: 連続ログイン日数を画面上部に表示
```

**出力**: 着手前確認 / 実装コード（data-testid付き）/ 変更ファイル一覧 / 検証結果 / 残課題

---

### `/test` — テストだけ実施したいとき

**1回の呼び出しで Playwright（コード）と Antigravity（操作ログ）の両方を必ず出力します。**

```
/test ストリーク表示機能（http://localhost:3000）
仕様書: 連続ログイン日数を画面上部に表示する。データなしの場合は「0日」を表示する。
```

**出力①（Playwright）**: 実行可能な `tests/e2e/xxx.spec.ts` コード（正常系・異常系・境界値）

**出力②（Antigravity）**: 操作ログ（時系列）/ バグ報告（発生条件・再現手順・重大度）/ 総合判定

特定の観点を重点確認したい場合は引数に追記できます:
```
/test ストリーク表示機能（http://localhost:3000）
重点確認: 日付を跨いだタイミングのリロード・375pxモバイル表示崩れ
```

---

### `/xpost` — 投稿文だけ作りたいとき

```
/xpost Day42: 習慣トラッカーにストリーク表示を追加。タイムゾーン処理で詰まったが解決した
```

**出力**: 3パターン（成果・学び・リアル）+ 各文字数 + おすすめ

**出力形式イメージ**:
```
【パターン A — 成果フォーカス】
━━━━━━━━━━━━━━━━━━━━
Day42 習慣トラッカーにストリーク🔥機能を追加。
連続日数がリアルタイムで見えると、やらなきゃという気持ちが強くなる。
タイムゾーン処理でかなり詰まったが、UTC→JSTの変換漏れが原因だった。
地味なバグほど解決に時間かかる。明日は通知機能に挑戦。#100日チャレンジ
━━━━━━━━━━━━━━━━━━━━
文字数: 163文字 ✅（150〜220）
```

---

### コマンドの使い分け

| シーン | 使うコマンド |
|---|---|
| 朝一番・今日何を作るか決まっている | `/day-run [今日作るもの]` |
| 計画と仕様だけ先に確認したい | `/pm` → `/ba` |
| 既存の仕様書をもとに実装したい | `/eng [実装内容]` |
| 実装済みの機能をテストしたい | `/test [機能名・URL]` |
| 今日の作業を投稿文にまとめたい | `/xpost [今日の内容]` |

---

_最終更新: 2026-03-28_
