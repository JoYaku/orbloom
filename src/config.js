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
    pegSpacingX: 34,
    pegSpacingY: 52,
    pegRadius: 4,
    buckets: 14,
    topMargin: 96,
    ballRadius: 7,
  },

  // ---- 物理（[P] 手感调参，原作常量未提取） ----
  physics: {
    gravity: 0.32,
    pegBounce: 0.62,
    wallBounce: 0.75,
    maxBallSpeed: 15,
    horizontalRandomness: 0.6,
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

  // ---- 桶（[V] MaxBalls=Round(20×1.12^(L-1))；Stage1 上限 5 级 [V]） ----
  bucket: {
    ballTargetBase: 20,
    ballTargetScalar: 1.12,
    baseMaxLevel: 5,
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
      { id: 'manual_drop', group: 'general', name: '手动掉落强化', desc: '缩短手动连续掉落间隔',
        type: 20, currency: 0, clampMin: 0.25, clampMax: 4,
        fn: { a: -0.5525337, b: 2.5, c: 1, d: 0, e: 4, f: 0 },                       // 3558 价值
        costFormula: { a: 20, b: 1, c: 0, d: 1.9, e: -28, f: 0.2815 }, unlockStar: 0 }, // 3557 成本
      { id: 'rarity_chance', group: 'general', name: '稀有度提升', desc: '提升出现高稀有度球的概率',
        type: 0, currency: 0, start: 0.01, perUp: 0.0025, clampMax: 0.30,
        costFormula: { a: 60, b: 1, c: 0, d: 2, e: 2380, f: 0.3 }, unlockStar: 0 },       // 3566 成本
      { id: 'max_bucket', group: 'general', name: '桶等级上限', desc: '提升所有桶可达到的最高等级',
        type: 0, currency: 10, start: 0, perUp: 1, maxLevel: 15,
        costFormula: { a: 1, b: 1, c: 0, d: 2.5, e: 50000, f: 0.2 }, unlockStar: 3 },      // 3559
      { id: 'legendary_tap', group: 'general', name: '传说点击', desc: '点击掉落时概率掉落金球',
        type: 10, currency: 0, start: 0, perUp: 0.01, clampMax: 0.10, maxLevel: 10,
        costFormula: { type: 10, start: 250, perUp: 2 }, unlockStar: 2 },

      // —— 自动球 auto（3 口） ——
      { id: 'auto_center', group: 'auto', name: '自动掉落·中央', desc: '中央口自动掉球',
        type: 20, currency: 10, clampMin: 1, clampMax: 4, maxLevel: 120,
        fn: { a: 60, b: -1, c: 0.37815, d: 14.62185, e: 0, f: 0 },                        // 3556
        costFormula: { a: 0.8, b: 1, c: 0, d: 2, e: 4, f: 0.1626 }, unlockStar: 0 },      // 3553
      { id: 'auto_left', group: 'auto', name: '自动掉落·左侧', desc: '左口加速自动掉球',
        type: 20, currency: 10, clampMin: 1, clampMax: 6, maxLevel: 132, requires: 'auto_center',
        fn: { a: 60, b: -1, c: 0.3816794, d: 9.6183206, e: 0, f: 0 },                     // 3555
        costFormula: { a: 1, b: 1, c: 0, d: 2.1, e: 13, f: 0.1416 }, unlockStar: 1 },     // 3554
      { id: 'auto_right', group: 'auto', name: '自动掉落·右侧', desc: '右口加速自动掉球',
        type: 20, currency: 10, clampMin: 1, clampMax: 6, maxLevel: 132, requires: 'auto_center',
        fn: { a: 60, b: -1, c: 0.3816794, d: 9.6183206, e: 0, f: 0 },
        costFormula: { a: 1, b: 1, c: 0, d: 2.1, e: 13, f: 0.1416 }, unlockStar: 1 },

      // —— 钉子 peg（5 种，效果=每级+1 钉） ——
      { id: 'peg_white', group: 'peg', name: '白色钉子', desc: '棋盘增加白钉',
        type: 0, currency: 10, start: 0, perUp: 1, maxLevel: 78,
        costFormula: { a: 0.0127249, b: 1, c: 0, d: 1.25446, e: 5, f: 1 }, unlockStar: 1 }, // 3562
      { id: 'peg_green', group: 'peg', name: '绿色钉子', desc: '棋盘增加绿钉',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 42,
        costFormula: { a: 0.752394, b: 1, c: 0, d: 1.37083, e: 2000, f: 1 }, unlockStar: 2 }, // 3563
      { id: 'peg_blue', group: 'peg', name: '蓝色钉子', desc: '蓝钉（Stage2 开放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 21, locked: true,
        costFormula: { a: 353.3689, b: 1, c: 0, d: 1.396938, e: 10000, f: 1 }, unlockStar: 99 },
      { id: 'peg_split', group: 'peg', name: '分裂钉子', desc: '分裂钉（Stage2 开放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 10, locked: true,
        costFormula: { a: 1, b: 1, c: 0, d: 4, e: 24996, f: 1 }, unlockStar: 99 },
      { id: 'peg_purple', group: 'peg', name: '紫色钉子', desc: '紫钉（Stage2 开放）',
        type: 0, currency: 0, start: 0, perUp: 1, maxLevel: 11, locked: true,
        costFormula: { a: 4704.04, b: 1, c: 0, d: 1.42954, e: 48000, f: 1 }, unlockStar: 99 },

      // —— 技能（冷却型，一次性） ——
      { id: 'skill_multiball', group: 'general', name: '多球爆发', desc: '瞬间喷出 30 个球',
        type: 0, currency: 0, start: 30, perUp: 0, maxLevel: 0, cooldown: 120,
        costFormula: { type: 0, start: 50, perUp: 0 }, unlockStar: 0 },
      { id: 'skill_goldrain', group: 'general', name: '金币雨', desc: '15 秒内金币收益 ×5',
        type: 0, currency: 0, start: 5, perUp: 0, maxLevel: 0, cooldown: 270,
        costFormula: { type: 0, start: 1000, perUp: 0 }, unlockStar: 1 },
      { id: 'skill_disco', group: 'general', name: '迪斯科时间', desc: '桶收益 10 倍 30 秒',
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
