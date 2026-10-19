# GitHub Pages デプロイ手順

このプロジェクトは静的サイトなので、GitHub Pages で無料公開できます。

## 前提

- GitHub アカウント
- Git がローカルにインストール済み（確認済み）

## 手順

### 1. リポジトリ作成

GitHub で新しいリポジトリを作成（例: `plinkidle-portfolio`）。Public を選択。

### 2. ローカルをプッシュ

```bash
cd workflowC_prototype
git init
git add .
git commit -m "PlinkIdle-style incremental game, Stage 1"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/plinkidle-portfolio.git
git push -u origin main
```

### 3. GitHub Pages を有効化

リポジトリの Settings → Pages で、
- Source: `Deploy from a branch`
- Branch: `main` / `(root)`
を選択して Save。

### 4. 公開 URL

数分後、以下で公開されます。
```
https://<あなたのユーザー名>.github.io/plinkidle-portfolio/
```
この URL が紹介ページ（index.html）、`/game.html` がゲーム本体です。

## 確認事項

- ログインなしでアクセスできるか
- ゲーム・画像・CSS・JS が 404 なしで読み込めるか
- リロードしてもゲームが壊れないか
- Console にエラーが出ていないか

> 注: この手順は利用者が GitHub での認証・リポジトリ作成を行う必要があります。
> エージェント側で認証情報を持たないため、プッシュ以降は利用者が実行します。
