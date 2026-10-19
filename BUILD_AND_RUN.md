# ビルドと実行方法

## ローカルで動かす

ビルドツールは不要です。静的ファイルだけで動きます。

### 方法 1：ローカルサーバ（推奨）

```bash
cd workflowC_prototype
python -m http.server 8765
# ブラウザで http://localhost:8765/index.html を開く
```

### 方法 2：直接開く

`game.html` をブラウザで直接開いても動作します（file:// でも可）。

## テスト実行

```bash
node tests/test_core.js
# 期待結果: 33 / 33 通過
```

Node.js が必要です（ブラウザ実行には不要）。

## デバッグ

- ブラウザの DevTools Console でエラーを確認
- セーブデータは localStorage のキー `plinko_idle_prototype_save_v2` に格納。クリアすると初期化される。
