// ============================================================
// game.js — 主循环、双货币、粒子、星级、事件、技能、存档
// ============================================================

/* global SOUND */

class Game {
  constructor(canvas, config, upgradeManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.upgrades = upgradeManager;
    this.board = this._buildBoard();

    this.state = {
      coins: 0, balls: 0, totalBalls: 0,
      star: 0, stage1Complete: false,
      stats: { drops: 0, captured: 0, coinsEarned: 0, pegHits: 0 },
    };
    this.activeBalls = [];
    this.particles = [];
    this.risingNumbers = [];
    this.lastAutoDrop = 0;
    this.lastManualDrop = -9999;
    this.lastSave = Date.now();
    this.recentCoins = [];

    // 技能 / 增益
    this.skillCd = { multiball: 0, goldrain: 0, disco: 0 };
    this.buffs = { goldRainUntil: 0, discoUntil: 0 };
    // 金饼干事件
    this.goldenCookie = { active: false, x: 0, y: 0, nextAt: Date.now() + 60000, until: 0 };
    this.running = true;
    this.load();
    this.upgrades.setStar(this.state.star);
  }

  _buildBoard() {
    return buildBoard(this.canvas.width, this.canvas.height, this.config);
  }

  dropBall(now, count = 1, auto = false) {
    for (let i = 0; i < count; i++) {
      const t = rollRarity(this.config, this.upgrades.getRarityChance());
      const x = this.canvas.width / 2 + (Math.random() - 0.5) * 40;
      const ball = new Ball(x, this.board.dropY, t, this.config.board.ballRadius);
      ball.auto = auto;
      this.activeBalls.push(ball);
      this.state.stats.drops++;
    }
  }

  manualDrop(now) {
    const ms = this.upgrades.getManualIntervalSec() * 1000;
    if (now - this.lastManualDrop < ms) return false;
    this.lastManualDrop = now;
    this.dropBall(now, 1, false);
    SOUND.pop();
    return true;
  }

  // 触发技能
  useSkill(id, now) {
    if (this.skillCd[id] > now || !this.upgrades.isUnlocked(id)) return false;
    this.skillCd[id] = now + this.upgrades.skillCooldown(id) * 1000;
    if (id === 'multiball') {
      const n = this.upgrades.skillValue('multiball');
      this.dropBall(now, n, false);
    } else if (id === 'goldrain') {
      this.buffs.goldRainUntil = now + 15000;
    } else if (id === 'disco') {
      this.buffs.discoUntil = now + 30000;
    }
    SOUND.buy();
    return true;
  }

  // 粒子爆发
  burst(x, y, color, n = 6, speed = 2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (0.5 + Math.random()) * speed;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, color, life: 1, size: 2 + Math.random() * 2 });
    }
  }

  update(now) {
    if (!this.running) return;

    // 自动掉落
    if (this.upgrades.isAutoUnlocked() && now - this.lastAutoDrop >= this.upgrades.getAutoInterval()) {
      this.lastAutoDrop = now;
      this.dropBall(now, 1, true);
    }

    const goldMult = now < this.buffs.goldRainUntil ? 5 : 1;
    const discoMult = now < this.buffs.discoUntil ? 10 : 1;

    for (const ball of this.activeBalls) {
      if (ball.dead) continue;
      const r = stepPhysics(ball, this.board, this.config);
      // 碰钉粒子 + 音效
      if (r.hits && r.hits.length) {
        this.state.stats.pegHits += r.hits.length;
        for (const h of r.hits) this.burst(h.x, h.y, '#cfe6ff', 3, 1.5);
        SOUND.peg();
      }
      if (r.captured) {
        const b = r.bucket;
        const coins = Math.round(b.level * ball.rarity.value * goldMult * discoMult * 100) / 100;
        const balls = b.level * ball.rarity.value;
        this.state.coins += coins;
        this.state.balls += balls;
        this.state.totalBalls++;
        this.state.stats.captured++;
        this.state.stats.coinsEarned += coins;
        b.flash = 1;
        addBucketBalls(b, 1, this.config, this.upgrades.getMaxBucketLevel());
        this.burst(b.x, b.y, '#ffd54f', 8, 3); // 金币粒子
        this.burst(b.x, b.y - 8, ball.rarity.color, 6, 2.5); // 球币粒子
        this.risingNumbers.push({ x: b.x, y: b.y, value: coins, color: ball.rarity.color, life: 1 });
        this.recentCoins.push({ t: now, v: coins });
        SOUND.coin();
        ball.dead = true;
      } else if (r.lost) ball.dead = true;
    }
    this.activeBalls = this.activeBalls.filter((b) => !b.dead);

    // 星级
    const stars = this.config.stage1.stars;
    if (this.state.star < 3 && this.state.totalBalls >= stars[this.state.star]) {
      this.state.star++;
      this.upgrades.setStar(this.state.star);
      if (this.state.star >= 3) this.state.stage1Complete = true;
      SOUND.star();
    }

    // 金饼干
    if (!this.goldenCookie.active && now >= this.goldenCookie.nextAt) {
      this.goldenCookie.active = true;
      this.goldenCookie.x = 60 + Math.random() * (this.canvas.width - 120);
      this.goldenCookie.y = 120 + Math.random() * 200;
      this.goldenCookie.until = now + this.config.events.goldenCookie.durationMs;
    }
    if (this.goldenCookie.active && now > this.goldenCookie.until) {
      this.goldenCookie.active = false;
      this.goldenCookie.nextAt = now + (this.config.events.goldenCookie.minGapMs +
        Math.random() * (this.config.events.goldenCookie.maxGapMs - this.config.events.goldenCookie.minGapMs));
    }

    // 粒子 / 飘字
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.02;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const n of this.risingNumbers) { n.y -= 0.8; n.life -= 0.015; }
    this.risingNumbers = this.risingNumbers.filter((n) => n.life > 0);
    for (const b of this.board.buckets) if (b.flash > 0) b.flash -= 0.05;
    this.recentCoins = this.recentCoins.filter((r) => r.t > now - 5000);

    if (now - this.lastSave > 5000) { this.lastSave = now; this.save(); }
  }

  clickGoldenCookie(now) {
    if (!this.goldenCookie.active) return false;
    this.state.balls += this.config.events.goldenCookie.balls;
    this.goldenCookie.active = false;
    this.goldenCookie.nextAt = now + (this.config.events.goldenCookie.minGapMs +
      Math.random() * (this.config.events.goldenCookie.maxGapMs - this.config.events.goldenCookie.minGapMs));
    this.burst(this.goldenCookie.x, this.goldenCookie.y, '#ffd54f', 20, 4);
    SOUND.cookie();
    return true;
  }

  getCoinsPerSec() {
    if (!this.recentCoins.length) return 0;
    return this.recentCoins.reduce((a, r) => a + r.v, 0) / 5;
  }
  save() { return saveGame(this.state, this.upgrades, this.board); }
  load() {
    if (typeof loadGame !== 'function') return;
    const d = loadGame();
    if (!d || d.error) return;
    this.state.coins = d.coins ?? 0;
    this.state.balls = d.balls ?? 0;
    this.state.totalBalls = d.totalBalls ?? 0;
    this.state.star = d.star ?? 0;
    this.state.stats = d.stats || this.state.stats;
    this.upgrades.deserialize(d.upgrades);
    if (d.buckets) d.buckets.forEach((b, i) => {
      if (this.board.buckets[i]) {
        this.board.buckets[i].level = b.level;
        this.board.buckets[i].progress = b.progress;
      }
    });
  }
}

if (typeof module !== 'undefined') module.exports = { Game };
