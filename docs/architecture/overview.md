# アーキテクチャ概要

---

## 全体構成

このAI開発チームは、Claude Codeの上で動作する5つの専門エージェントで構成されます。
エージェントは独立したMarkdownファイルとして定義され、必要なときに呼び出されます。

```
┌──────────────────────────────────────────────────────────────────┐
│  Claude Code（ホスト環境）                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CLAUDE.md（共通ルール・自動読込）                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  agents/    │  │   skills/    │  │       docs/         │    │
│  │  各エージェント │  │ 定型作業テンプレート│  │ 知識ベース・仕様書  │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## エージェント同士の関係

### 情報フロー

```
                    ┌──────────────────┐
                    │ Project Manager  │
                    │ タスク・優先順位  │
                    └────────┬─────────┘
                             │ タスク定義を渡す
                    ┌────────▼─────────┐
                    │ Business Analyst │
                    │ 要件・仕様書     │
                    └────────┬─────────┘
                             │ 仕様書を渡す
              ┌──────────────▼──────────────┐
              │    Knowledge Researcher      │
              │    既存コード・docs調査      │
              └──────────────┬──────────────┘
                             │ 調査結果を渡す
                    ┌────────▼─────────┐
                    │    Engineer      │
                    │    実装          │
                    └────────┬─────────┘
                             │ 実装結果を渡す
                    ┌────────▼─────────┐
                    │     Tester       │
                    │ Playwright + AGravity│
                    └────────┬─────────┘
                             │
            ┌────────────────┴───────────────────┐
            │ バグあり                            │ バグなし
            ▼                                    ▼
     Engineerへ差し戻し                   PMへ完了報告
```

### エージェント別の入出力

| エージェント | 主な入力 | 主な出力 |
|---|---|---|
| Project Manager | 目標・制約・現状 | タスクリスト・優先順位・完了条件 |
| Business Analyst | 要望・ユーザーの課題 | 仕様書・受け入れ条件 |
| Knowledge Researcher | 調査したい内容 | 確認済み事実・不明点・関連ファイル |
| Engineer | 仕様書・調査結果 | 実装コード・検証結果 |
| Tester | 実装内容・仕様書 | テスト結果・バグ報告書 |

---

## ファイル構造と役割

```
ai-dev-team-starter/
├── CLAUDE.md                   ← Claude Codeが自動読込する共通ルール
├── README.md                   ← プロジェクト全体の説明
│
├── agents/                     ← エージェント定義（役割・行動手順・出力形式）
│   ├── project-manager.md
│   ├── business-analyst.md
│   ├── knowledge-researcher.md
│   ├── engineer.md
│   └── tester.md
│
├── skills/                     ← 定型作業のテンプレート（スキル）
│   ├── write-spec/SKILL.md           ← 要件定義書を書く
│   ├── implement-feature/SKILL.md    ← 機能を実装する
│   ├── create-playwright-test/SKILL.md ← Playwrightテストを書く
│   ├── exploratory-test-antigravity/SKILL.md ← 探索テストを行う
│   └── summarize-changes/SKILL.md    ← 変更内容を要約する
│
└── docs/                       ← 知識ベース（プロジェクト全体で共有）
    ├── product/                ← プロダクト定義
    │   ├── vision.md
    │   └── target-user.md
    ├── requirements/           ← 要件・仕様書
    │   ├── mvp.md
    │   └── acceptance-criteria.md
    ├── architecture/           ← 技術的な設計情報
    │   └── overview.md
    ├── runbooks/               ← 運用手順書
    │   ├── deploy.md
    │   └── test.md
    ├── decisions/              ← 意思決定記録（ADR）
    │   └── 0001-initial-setup.md
    └── examples/               ← エージェント動作例
        ├── pm-example.md
        ├── ba-example.md
        ├── engineer-example.md
        └── tester-example.md
```

---

## 想定運用フロー

### 新機能開発の場合

```
1. [PM]    agents/project-manager.md を呼び出し、タスクを分解する
2. [BA]    agents/business-analyst.md を呼び出し、仕様書を作成する
3. [KR]    agents/knowledge-researcher.md を呼び出し、関連コードを調査する
4. [Eng]   agents/engineer.md を呼び出し、実装する
5. [Test]  agents/tester.md を呼び出し、Playwright + Antigravityでテストする
6. [Test→Eng] バグがあれば差し戻し → 修正 → 再テスト
7. [PM]    完了条件を確認し、タスクをクローズする
```

### バグ修正の場合

```
1. [KR]    バグ周辺のコードを調査する
2. [Eng]   最小差分で修正する
3. [Test]  修正箇所のテストを実施する
4. [Eng]   テスト結果を確認し、再修正または完了とする
```

---

## 技術スタック（初期設定のデフォルト想定）

このスターターキット自体はMarkdownファイルのみで構成されています。
実際のアプリケーション開発では、プロジェクトに応じて以下を追加します:

| カテゴリ | 想定技術 |
|---|---|
| フロントエンド | React / Next.js / Vue.js（プロジェクトによる） |
| バックエンド | Node.js / Python / Go（プロジェクトによる） |
| テスト（E2E） | Playwright |
| テスト（探索） | Google Antigravity |
| CI/CD | GitHub Actions（推奨） |
| バージョン管理 | Git / GitHub |

---

_最終更新: 2026-03-27_
