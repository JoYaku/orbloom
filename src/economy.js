// ============================================================
// economy.js — 金币 / 球数结算（[VERIFIED] 结算链）
// 原作 GameManager.OnReceiveGameEvent（RVA=0xDEE0）：
//   入桶金币 = bucketLevel × ballRarityValue × creditsMult × (1+coinBuff)
//   入桶球数 = bucketLevel × dropScale × (1+ballBuff) × combo(手动)
//              × ballsMult × ballRarityValue
// 原型第一轮：creditsMult/ballsMult/combo 暂为 1（转生/连击未实现）。
// ============================================================

// 入桶金币
function settleCoins(ball, bucket, creditsMult = 1) {
  const rarityValue = ball.rarity.value;
  const coins = bucket.level * rarityValue * creditsMult;
  return Math.max(1, Math.round(coins * 100) / 100);
}

// 入桶球数（关卡进度货币）
function settleBalls(ball, bucket, opts = {}) {
  const rarityValue = ball.rarity.value;
  const dropScale = opts.auto ? 1 : 1; // ManualDropCountScale/AutoDropCountScale（初始 1）
  const comboMult = opts.auto ? 1 : (opts.comboMult || 1); // 连击仅手动
  const ballsMult = opts.ballsMult || 1;
  const balls = bucket.level * rarityValue * dropScale * comboMult * ballsMult;
  return Math.max(1, Math.round(balls));
}

// 离线收益（[VERIFIED] 效率/上限档位，累计公式为 [PLACEHOLDER] 简化）
function calcOfflineEarnings(elapsedMs, ratePerSec, config) {
  const minutes = Math.min(elapsedMs / 60000, config.offline.capMinutes);
  const hours = minutes / 60;
  return {
    minutes: Math.round(minutes),
    hours: Math.round(hours * 100) / 100,
  };
}

// 数字格式化（K/M/B）
function formatNumber(n) {
  if (n < 1000) return n.toFixed(n < 10 ? 1 : 0).replace(/\.0$/, '');
  const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let u = -1;
  let v = n;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  return v.toFixed(2) + units[u];
}

if (typeof module !== 'undefined') {
  module.exports = { settleCoins, settleBalls, calcOfflineEarnings, formatNumber };
}
