// ============================================================
// upgrades.js — 升级管理器：真实曲线成本、双货币、分组、技能冷却
// ============================================================

if (typeof require === 'function' && typeof module !== 'undefined') {
  const _c = require('./curves.js');
  var upgradeCostAt = _c.upgradeCostAt;
  var upgradeValueAt = _c.upgradeValueAt;
}

class UpgradeManager {
  constructor(config) {
    this.config = config;
    this.levels = {};
    for (const up of config.upgrades.list) this.levels[up.id] = 0;
    this.star = 0;
  }
  setStar(n) { this.star = n; }

  getDef(id) { return this.config.upgrades.list.find((u) => u.id === id); }
  getLevel(id) { return this.levels[id] || 0; }
  isSkill(id) { const d = this.getDef(id); return !!d && !!d.cooldown; }
  isLocked(id) { const d = this.getDef(id); return !!d && !!d.locked; }

  isUnlocked(id) {
    const d = this.getDef(id);
    if (!d || d.locked) return false;
    if ((d.unlockStar || 0) > this.star) return false;
    if (d.requires && this.getLevel(d.requires) === 0) return false;
    return true;
  }
  isMaxed(id) {
    const d = this.getDef(id);
    if (this.isSkill(id)) return this.getLevel(id) > 0; // 技能一次性
    const max = d.maxLevel || this.config.upgrades.maxLevel;
    return this.getLevel(id) >= max;
  }
  getCost(id) { return upgradeCostAt(this.getDef(id), this.getLevel(id)); }
  getValue(id) { return upgradeValueAt(this.getDef(id), this.getLevel(id)); }
  currencyKey(id) { return this.getDef(id).currency === 0 ? 'coins' : 'balls'; }

  canBuy(id, state) {
    if (!this.isUnlocked(id) || this.isMaxed(id)) return false;
    return state[this.currencyKey(id)] >= this.getCost(id);
  }
  buy(id, state) {
    if (!this.canBuy(id, state)) return false;
    state[this.currencyKey(id)] -= this.getCost(id);
    this.levels[id]++;
    return true;
  }

  // ---- 派生玩法数值 ----
  getManualIntervalSec() { return upgradeValueAt(this.getDef('manual_drop'), this.getLevel('manual_drop')); }
  isAutoUnlocked() { return this.getLevel('auto_center') > 0; }
  getAutoInterval() {
    if (!this.isAutoUnlocked()) return 1e9;
    let rate = 0;
    const c = this.getLevel('auto_center');
    if (c > 0) rate += 1 / upgradeValueAt(this.getDef('auto_center'), c);
    for (const s of ['auto_left', 'auto_right']) {
      const lv = this.getLevel(s);
      if (lv > 0) rate += 1 / upgradeValueAt(this.getDef(s), lv);
    }
    return Math.round(1000 / rate);
  }
  getRarityChance() { return upgradeValueAt(this.getDef('rarity_chance'), this.getLevel('rarity_chance')); }
  getMaxBucketLevel() { return this.config.bucket.baseMaxLevel + this.getLevel('max_bucket'); }
  getPegCount(prefix) {
    let n = 0;
    for (const up of this.config.upgrades.list) {
      if (up.group === 'peg' && up.id.startsWith(prefix)) n += this.getLevel(up.id);
    }
    return n;
  }
  skillCooldown(id) { return this.getDef(id).cooldown || 0; }
  skillValue(id) { return upgradeValueAt(this.getDef(id), 0); }

  serialize() { return { levels: this.levels }; }
  deserialize(data) { if (data && data.levels) this.levels = { ...this.levels, ...data.levels }; }
}

if (typeof module !== 'undefined') module.exports = { UpgradeManager };
