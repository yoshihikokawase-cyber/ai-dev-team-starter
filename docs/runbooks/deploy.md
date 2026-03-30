# デプロイ・展開手順

このランブックは、このスターターキットを新しいプロジェクトへ展開するときの
基本手順とGit運用のガイドラインをまとめたものです。

---

## 新規プロジェクトへの展開手順

### STEP 1: リポジトリの準備

```bash
# 新しいプロジェクトフォルダーを作成
mkdir my-new-project
cd my-new-project

# Gitリポジトリを初期化
git init

# スターターキットをコピー
cp -r /path/to/ai-dev-team-starter/* .

# .gitignore を作成
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
playwright-report/
test-results/
EOF
```

### STEP 2: プロジェクト情報を更新する

以下のファイルをプロジェクト固有の内容に書き換えてください:

```bash
# 必ず更新するファイル
docs/product/vision.md          ← プロジェクトの目的・解決する課題
docs/product/target-user.md     ← 実際のターゲットユーザー
docs/requirements/mvp.md        ← このプロジェクトのMVP要件
README.md                       ← プロジェクト名・説明を更新
```

### STEP 3: 初回コミット

```bash
git add .
git commit -m "chore: AI開発チームスターターキットを初期設定"
```

### STEP 4: リモートリポジトリへプッシュ

```bash
# GitHubでリポジトリを作成後
git remote add origin https://github.com/[username]/[repo-name].git
git branch -M main
git push -u origin main
```

---

## Git運用の基本

### ブランチ戦略

```
main            ← 本番相当。直接pushしない
  └── develop   ← 開発中の統合ブランチ（任意）
        └── feature/[機能名]  ← 機能開発用
        └── fix/[バグ名]      ← バグ修正用
        └── docs/[内容]       ← ドキュメント更新用
```

### コミットメッセージの規約

```
[種別]: [概要（日本語または英語）]

種別:
  feat     - 新機能
  fix      - バグ修正
  docs     - ドキュメントのみの変更
  style    - コードの意味に影響しない変更（フォーマット等）
  refactor - バグ修正でも機能追加でもないコードの変更
  test     - テストコードの追加・変更
  chore    - ビルドプロセスや補助ツールの変更

例:
  feat: ユーザー登録機能を追加
  fix: ログイン時にリダイレクトされない問題を修正
  docs: README に使い方セクションを追加
  test: ユーザー登録のPlaywrightテストを追加
```

### PRの基本ルール

1. **1PR = 1機能（または1バグ修正）**: 複数の目的を混ぜない
2. **差分は小さく**: レビューしやすいサイズに保つ（目安: 変更行数300行以内）
3. **テストを含める**: 機能追加にはテストを一緒にコミットする
4. **説明を書く**: `skills/summarize-changes/SKILL.md` を使ってPR説明文を作成する

---

## バージョン管理の注意点

### セマンティックバージョニング（SemVer）

```
v[MAJOR].[MINOR].[PATCH]

MAJOR: 互換性のない変更（既存機能の削除・大幅変更）
MINOR: 後方互換性のある機能追加
PATCH: 後方互換性のあるバグ修正
```

### リリースタグの作成

```bash
# タグを作成
git tag -a v1.0.0 -m "v1.0.0: 初回リリース"

# タグをリモートへプッシュ
git push origin v1.0.0
```

### .env ファイルの管理

```bash
# .env は絶対にコミットしない
# .env.example のみコミットし、実際の値は各自で設定する

# .env.example の例
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=your-api-key-here
NODE_ENV=development
```

---

## トラブルシューティング

### 間違えてコミットしたファイルを取り消す

```bash
# 直前のコミットから特定のファイルを取り消す（pushする前）
git reset HEAD~ -- path/to/file
git commit --amend --no-edit
```

### コミット履歴を整理したい

```bash
# 最新3コミットを1つにまとめる（pushする前のみ）
git rebase -i HEAD~3
```

### マージコンフリクトの解決

```bash
# コンフリクトが発生したら
git status                    # コンフリクトファイルを確認
# ファイルを手動で編集して解決
git add path/to/resolved-file
git commit                    # マージコミットを作成
```

---

_最終更新: 2026-03-27_
