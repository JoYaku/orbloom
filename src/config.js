// ============================================================
// config.js — Stage 1 全部配置
// 标注：[V]=逆向验证自 Plinko.*.dll；[O]=原作观察自实机截图；[P]=原型占位
// 独立学习作品，不冒充官方。
// ============================================================

const CONFIG = {
  // ---- 棋盘（[V] 15×9 隔行、14 桶；[O] 雨滴钉子、雨天背景） ----
  board: {
    pegColsMax: 15,
    pegRows: 9,
    altRowsOneLess: true,
    pegSpacingX: 44,
    pegSpacingY: 56,
    pegRadius: 5,
    buckets: 14,
    topMargin: 50,
    ballRadius: 7,
  },

  // ---- 物理（手感调参） ----
  physics: {
    gravity: 0.18,
    pegBounce: 0.58,
    wallBounce: 0.72,
    maxBallSpeed: 10,
    horizontalRandomness: 0.5,
  },

  // ---- 稀有度（[V] 价值 1/2/5/10/100，自然概率 80/11/8/1，期望 4.95） ----
  rarity: {
    expectedMultiplier: 4.95,
    tiers: [
      { id: 'common',    value: 1,   color: '#9fb4cc' },
      { id: 'uncommon',  value: 2,   color: '#7ee08a' },
      { id: 'rare',      value: 5,   color: '#6ec6ff' },
      { id: 'epic',      value: 10,  color: '#ce93d8' },
      { id: 'legendary', value: 100, color: '#ffd54f' },
    ],
  },

  // ---- 桶（MaxBalls=Round(20×1.12^(L-1))；从 Lv1 累计，最高 Lv10） ----
  bucket: {
    ballTargetBase: 20,
    ballTargetScalar: 1.12,
    baseMaxLevel: 10,
  },

  drop: {
    startCoins: 0,
    startBalls: 0,
    autoBaseInterval: 3500, // [V] GetAutoDropBaseInterval ≈ 3.5s 区间
  },

  // ---- Stage 1（[V] maxBucketLevel=5；三星球数 20/60/1900） ----
  stage1: {
    name: 'Stage 1-1',
    stars: [20, 60, 1900],
    theme: { skyTop: '#2b3a55', skyBottom: '#4a6b8a', grass: '#5a8a4a', rainbow: true, rain: true },
  },

  // ---- 升级（[V] 全部 VCF 系数；分组 [O] 自动球/钉子/全体） ----
  upgrades: {
    maxLevel: 999,
    // 分组：auto=自动球, peg=钉子, general=全体
    // fn=效果曲线(V)；costFormula=成本曲线(V)
    list: [
      // —— 全体 general ——
      { id: 'manual_drop', group: 'general', name: '手動ドロップ強化', desc: '手動連射の間隔を短縮',
        type: 20, currency: 0, clampMin: 0.25, clampMax: 4,
        fn: { a: -0.5525337, b: 2.5, c: 1, d: 0, e: 4, f: 0 },                       // 3558 价值
        costFormula: { a: 20, b: 1, c: 0, d: 1.9, e: -28, f: 0.2815 }, unlockStar: 0 }, // 3557 成本
      { id: 'rarity_chance', group: 'general', name: 'レア度アップ', desc: '高レア玉の出現率を上昇',
        type: 0, currency: 0, start: 0.01, perUp: 0.0025, clampMax: 0.30,
        costFormula: { a: 60, b: 1, c: 0, d: 2, e: 2380, f: 0.3 }, unlockStar: 0 },       // 3566 成本
      { id: 'max_bucket', group: 'general', name: 'バケツ上限解放', desc: '全バケツの最大レベルを上昇',
        type: 0, currency: 10, start: 0, perUp: 1, maxLevel: 15,
        costFormula: { a: 1, b: 1, c: 0, d: 2.5, e: 50000, f: 0.2 }, unlockStar: 3 },      // 3559
      { id: 'legendary_tap', group: 'general', name: '伝説タップ', desc: 'タップ時に確率で金の玉',
        type: 10, currency: 0, start: 0, perUp: 0.01, clampMax: 0.10, maxLevel: 10,
        costFormula: { type: 10, start: 250, perUp: 2 }, unlockStar: 2 },

      // —— 自动球 auto（3 口） ——
      { id: 'auto_center', group: 'auto', name: '自動ドロップ・中央', desc: '中央から自動で玉を落下',
        type: 20, currency: 10, clampMin: 1, clampMax: 4, maxLevel: 120,
        fn: { a: 60, b: -1, c: 0.37815, d: 14.62185, e: 0, f: 0 },                        // 3556
        costFormula: { a: 0.8, b: 1, c: 0, d: 2, e: 4, f: 0.1626 }, unlockStar: 0 },      // 3553
      { id: 'auto_left', group: 'auto', name: '自動ドロップ・左', desc: '左口の自動落下を高速化',
        type: 20, currency: 10, clampMin: 1, clampMax: 6, maxLevel: 132, requires: 'auto_center',
        fn: { a: 60, b: -1, c: 0.3816794, d: 9.6183206, e: 0, f: 0 },                     // 3555
        costFormula: { a: 1, b: 1, c: 0, d: 2.1, e: 13, f: 0.1416 }, unlockStar: 1 },     // 3554
      { id: 'auto_right', group: 'auto', name: '自動ドロップ・右', desc: '右口の自動落下を高速化',
        type: 20, currency: 10, clampMin: 1, clampMax: 6, maxLevel: 132, requires: 'auto_center',
        fn: { a: 60, b: -1, c: 0.3816794, d: 9.6183206, e: 0, f: 0 },
        costFormula: { a: 1, b: 1, c: 0, d: 2.1, e: 13, f: 0.1416 }, unlockStar: 1 },

      // —— 钉子 peg（5 种，效果=每级+1 钉） ——
      { id: 'peg_white', group: 'peg', name: '白い釘', desc: '盤面に白釘を追加',
        type: 0, currency: 10, start: 0, perUp: 1, maxLevel: 131,
        costFormula: { a: 0.0127249, b: 1, c: 0, d: 1.25446, e: 5, f: 1 }, unlockStar: 1 }, // 3562
      { id: 'peg_green', group: 'peg', name: '緑の釘', desc: '盤面に緑釘を追加',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 42,
        costFormula: { a: 0.752394, b: 1, c: 0, d: 1.37083, e: 2000, f: 1 }, unlockStar: 2 }, // 3563
      { id: 'peg_blue', group: 'peg', name: '青い釘', desc: '青釘（Stage2 解放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 21, locked: true,
        costFormula: { a: 353.3689, b: 1, c: 0, d: 1.396938, e: 10000, f: 1 }, unlockStar: 99 },
      { id: 'peg_split', group: 'peg', name: '分裂釘', desc: '分裂釘（Stage2 解放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 10, locked: true,
        costFormula: { a: 1, b: 1, c: 0, d: 4, e: 24996, f: 1 }, unlockStar: 99 },
      { id: 'peg_purple', group: 'peg', name: '紫の釘', desc: '紫釘（Stage2 解放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 11, locked: true,
        costFormula: { a: 4704.04, b: 1, c: 0, d: 1.42954, e: 48000, f: 1 }, unlockStar: 99 },

      // —— 技能（冷却型，一次性） ——
      { id: 'skill_multiball', group: 'general', name: 'マルチボール', desc: '玉を30個一気に射出',
        type: 0, currency: 0, start: 30, perUp: 0, maxLevel: 0, cooldown: 120,
        costFormula: { type: 0, start: 50, perUp: 0 }, unlockStar: 0 },
      { id: 'skill_goldrain', group: 'general', name: 'コイン雨', desc: '15秒間コイン取得×5',
        type: 0, currency: 0, start: 5, perUp: 0, maxLevel: 0, cooldown: 270,
        costFormula: { type: 0, start: 1000, perUp: 0 }, unlockStar: 1 },
      { id: 'skill_disco', group: 'general', name: 'ディスコタイム', desc: '30秒間バケツ報酬×10',
        type: 0, currency: 0, start: 10, perUp: 0, maxLevel: 0, cooldown: 300,
        costFormula: { type: 0, start: 5000, perUp: 0 }, unlockStar: 2 },
    ],
  },

  // ---- 随机事件（[V] 金饼干 180-360s 刷新/持续15s/30球/转化1） ----
  events: {
    goldenCookie: { minGapMs: 180000, maxGapMs: 360000, durationMs: 15000, balls: 30 },
  },

  offline: { efficiency: 0.40, coinShare: 0.20, capMinutes: 60 }, // [V] 档位
};

if (typeof module !== 'undefined') module.exports = { CONFIG };
