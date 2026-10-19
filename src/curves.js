// ============================================================
// curves.js — 原作通用数值曲线引擎（[VERIFIED] 1:1 还原）
//   VCF:  y = a * (c*x + d)^(1/b + f*x) + e   (ValueChangeFunction.Calculate RVA=0x4814)
//   Progression: Add(0)=start+x*perUp, Multiply(10)=start*perUp^x, Function(20)=VCF
// 20 个开发者手写锚点 19 个精确命中。
// ============================================================

function vcfCalculate(x, fn) {
  const base = fn.c * x + fn.d;
  const exponent = 1 / fn.b + fn.f * x;
  return fn.a * Math.pow(base, exponent) + fn.e;
}

function clamp(v, lo, hi) {
  if (typeof lo === 'number') v = Math.max(lo, v);
  if (typeof hi === 'number') v = Math.min(hi, v);
  return v;
}

// 成本：优先 costFormula；否则把效果曲线 fn 当成本曲线（旧升级）
function upgradeCostAt(up, level) {
  if (up.costFormula) {
    const cf = up.costFormula;
    if (typeof cf.a === 'number') return vcfCalculate(level, cf);
    if (cf.type === 10) return cf.start * Math.pow(cf.perUp, level);
    // Add / 固定成本
    return cf.start + level * (cf.perUp || 0);
  }
  return vcfCalculate(level, up.fn);
}

// 效果：按 type 求值后钳制
function upgradeValueAt(up, level) {
  let v;
  if (up.type === 20) v = vcfCalculate(level, up.fn);
  else if (up.type === 10) v = up.start * Math.pow(up.perUp, level);
  else v = up.start + level * (up.perUp || 0);
  return clamp(v, up.clampMin, up.clampMax);
}

if (typeof module !== 'undefined') {
  module.exports = { vcfCalculate, clamp, upgradeCostAt, upgradeValueAt };
}
