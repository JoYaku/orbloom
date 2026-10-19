# PlinkIdle風 クリッカー / 放置ゲーム（Stage 1）

HTML5 + Canvas 2D + 原生 JavaScript で自作したインクリメンタルゲーム。
Steam の Plinko 系放置ゲーム（Demo）の仕組みを学習解析したうえで、**オリジナルコード・オリジナル素材で再実装**した個人学習プロジェクトです。

## ディレクトリ構成

```
workflowC_prototype/
├── index.html          # ポートフォリオ紹介ページ（入口）
├── game.html           # ゲーム本体
├── src/
│   ├── config.js       # Stage1 全パラメータ（出典付き）
│   ├── curves.js       # 汎用数曲線エンジン（VCF）
│   ├── physics.js      # ボール物理・レアリティ
│   ├── board.js        # 盤面・バケツ生成
│   ├── economy.js      # 入金計算・フォーマット
│   ├── upgrades.js     # 強化マネージャ
│   ├── save.js         # localStorage セーブ
│   ├── audio.js        # Web Audio 合成効果音
│   ├── game.js         # メインループ・スキル・イベント
│   ├── ui.js           # Canvas 描画
│   └── main.js         # UI バインド・適応
├── tests/test_core.js  # 自動テスト（Node）
├── docs/               # スクリーンショット
├── README.md
├── BUILD_AND_RUN.md
└── DEPLOY_GITHUB_PAGES.md
```

## 遊び方

1. `game.html` を開く（または公開 URL にアクセス）
2. 「ボールを落とす」をクリック / Space キーでボールを落下
3. バケツに入るとコインとボールを獲得
4. 右パネルで強化を購入：自動ボール・釘・全体
5. ☆を集めると新しい強化が解放される
6. スキル（マルチボール / コイン雨 / ディスコ）とランダムイベントを活用
7. データは自動保存され、リロードで復元される

## ブラウザ対応

- デスクトップ Chrome で動作確認済み
- 画面リサイズ対応
- モバイルはレイアウトが縦積みになるが、タッチ操作の最適化は今後の課題

## テスト

```bash
node tests/test_core.js
# → 33 / 33 通過
```

## 出典と免責

- ゲームデザインと数値の参考にした原作は Steam の Demo 版で、DLL 解析により学習的に仕組みを理解
- コード・画像・音声はすべて自作（Web Audio 合成を含む）。公式アセットは未使用
- 本作品は個人の学習および就職活動ポートフォリオであり、公式作品ではありません
