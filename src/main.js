// ============================================================
// main.js — 入口：初始化、UI 绑定、槽位升级面板、buff 指示
// ============================================================

/* global CONFIG, Game, UpgradeManager, render, saveGame, SOUND */

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas, CONFIG, new UpgradeManager(CONFIG));
window.game = game;

const pauseBtn = document.getElementById('pauseBtn');
const dropBtn = document.getElementById('dropBtn');
const soundBtn = document.getElementById('soundBtn');
const autoSlots = document.getElementById('autoSlots');
const pegSlots = document.getElementById('pegSlots');
const generalList = document.getElementById('generalList');
const autoInfo = document.getElementById('autoInfo');
const pegInfo = document.getElementById('pegInfo');
const buffBadge = document.getElementById('buffBadge');
const buffTime = document.getElementById('buffTime');

pauseBtn.addEventListener('click', () => {
  game.running = !game.running;
  pauseBtn.textContent = game.running ? '⏸' : '▶';
});
dropBtn.addEventListener('click', () => { SOUND.ensureBGM(); game.manualDrop(performance.now()); });
let muted = false;
soundBtn.addEventListener('click', () => { muted = !muted; SOUND.mute(muted); soundBtn.textContent = muted ? '🔇' : '🔊'; });

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); SOUND.ensureBGM(); game.manualDrop(performance.now()); }
});

// 长摁连续购买（音效节流，避免急促）
function bindLongPress(btn, action) {
  let timer = null, lastSnd = 0;
  const doAction = () => {
    action();
    const now = performance.now();
    if (now - lastSnd > 250) { lastSnd = now; SOUND.buy(); }
  };
  const start = (e) => {
    e.preventDefault();
    doAction();
    timer = setInterval(doAction, 80);
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  btn.addEventListener('mousedown', start);
  btn.addEventListener('touchstart', start, { passive: false });
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => btn.addEventListener(ev, stop));
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const gc = game.goldenCookie;
  if (gc.active && Math.hypot(x - gc.x, y - gc.y) < 25) game.clickGoldenCookie(performance.now());
});

function fmt(n) { return formatNumber(n); }

// ---- 自动球槽位（3 格：中央/左/右） ----
function renderAutoSlots() {
  autoSlots.innerHTML = '';
  const ids = ['auto_center', 'auto_left', 'auto_right'];
  for (const id of ids) {
    const up = CONFIG.upgrades.list.find(u => u.id === id);
    const lv = game.upgrades.getLevel(id);
    const unlocked = game.upgrades.isUnlocked(id);
    const cost = game.upgrades.getCost(id);
    const div = document.createElement('div');
    div.className = 'slot' + (!unlocked ? ' locked' : (lv > 0 ? ' active' : ''));
    div.innerHTML = `<span class="lvl">${lv > 0 ? 'Lv'+lv : '🔒'}</span>`;
    if (unlocked) {
      div.innerHTML += `<span class="arrow">▲</span><span class="cost">🔵${Math.floor(cost)}</span>`;
      if (game.upgrades.canBuy(id, game.state)) {
        div.style.cursor = 'pointer';
        bindLongPress(div, () => { game.upgrades.buy(id, game.state); game.syncPegTypes(); });
      }
    }
    autoSlots.appendChild(div);
  }
  const interval = game.upgrades.getAutoInterval() / 1000;
  autoInfo.textContent = game.upgrades.isAutoUnlocked() ? (60/interval).toFixed(1) + '/min' : '未解锁';
}

// ---- 钉子槽位（白/绿/蓝/分裂/紫 + 空） ----
function renderPegSlots() {
  pegSlots.innerHTML = '';
  const ids = ['peg_white', 'peg_green', 'peg_blue', 'peg_split', 'peg_purple'];
  for (const id of ids) {
    const up = CONFIG.upgrades.list.find(u => u.id === id);
    const lv = game.upgrades.getLevel(id);
    const unlocked = game.upgrades.isUnlocked(id);
    const cost = game.upgrades.getCost(id);
    const div = document.createElement('div');
    div.className = 'slot' + (!unlocked ? ' locked' : (lv > 0 ? ' active' : ''));
    div.innerHTML = `<span class="lvl">${lv > 0 ? 'Lv'+lv : '🔒'}</span>`;
    if (unlocked) {
      div.innerHTML += `<span class="arrow">▲</span><span class="cost">${up.currency === 0 ? '🪙' : '🔵'}${Math.floor(cost)}</span>`;
      if (game.upgrades.canBuy(id, game.state)) {
        div.style.cursor = 'pointer';
        bindLongPress(div, () => { game.upgrades.buy(id, game.state); game.syncPegTypes(); });
      }
    }
    pegSlots.appendChild(div);
  }
  pegInfo.textContent = '白/绿钉を強化';
}

// ---- 全体升级列表 ----
function renderGeneral() {
  generalList.innerHTML = '';
  const items = CONFIG.upgrades.list.filter(u => u.group === 'general' && !game.upgrades.isSkill(u.id));
  for (const up of items) {
    const lv = game.upgrades.getLevel(up.id);
    const unlocked = game.upgrades.isUnlocked(up.id);
    const cost = game.upgrades.getCost(up.id);
    const div = document.createElement('div');
    div.className = 'gen-item' + (!unlocked ? ' locked' : '');
    div.innerHTML = `<div class="info"><div class="name">${up.name}</div>
      <div class="speed">${up.desc}</div></div>
      <div class="cost">${up.currency === 0 ? '🪙' : '🔵'}${Math.floor(cost)}</div>`;
    if (unlocked && game.upgrades.canBuy(up.id, game.state)) {
      const b = document.createElement('button');
      b.className = 'buy'; b.textContent = '▲';
      bindLongPress(b, () => { game.upgrades.buy(up.id, game.state); game.syncPegTypes(); });
      div.appendChild(b);
    }
    generalList.appendChild(div);
  }
  // 技能
  for (const id of ['skill_multiball', 'skill_goldrain', 'skill_disco']) {
    const up = CONFIG.upgrades.list.find(u => u.id === id);
    if (!game.upgrades.isUnlocked(id)) continue;
    const short = id.replace('skill_', '');
    const div = document.createElement('div');
    div.className = 'gen-item';
    const cd = (game.skillCd[short] || 0) - performance.now();
    div.innerHTML = `<div class="info"><div class="name">${up.name}</div>
      <div class="speed">${up.desc}</div></div><div class="cost">${cd > 0 ? Math.ceil(cd/1000)+'s' : '🪙'+Math.floor(game.upgrades.getCost(id))}</div>`;
    if (cd <= 0) {
      const b = document.createElement('button');
      b.className = 'buy'; b.textContent = '▶';
      b.addEventListener('click', () => game.useSkill(id, performance.now()));
      div.appendChild(b);
    }
    generalList.appendChild(div);
  }
}

function resize() {
  const wrap = document.getElementById('gameWrap');
  canvas.style.width = wrap.clientWidth + 'px';
  canvas.style.height = wrap.clientHeight + 'px';
}
window.addEventListener('resize', resize);
resize();

let _lastUi = 0;
function loop(now) {
  game.update(now);
  render(canvas.getContext('2d'), game, now);
  if (now - _lastUi > 250) {
    _lastUi = now;
    document.getElementById('curCoins').textContent = fmt(game.state.coins);
    document.getElementById('curBalls').textContent = fmt(game.state.balls);
    document.getElementById('rankLabel').textContent = 'ランク' + game.state.star;
    const target = CONFIG.stage1.stars[Math.min(game.state.star, 2)];
    document.getElementById('ballRatio').textContent = fmt(game.state.totalBalls) + ' / ' + fmt(target);
    document.getElementById('topFill').style.width = Math.min(100, game.state.totalBalls/target*100) + '%';
    document.getElementById('bottomBalls').textContent = fmt(game.state.totalBalls) + ' / ' + fmt(target);
    document.getElementById('stars').textContent = '★'.repeat(game.state.star) + '☆'.repeat(3-game.state.star);
    // buff
    const gr = game.buffs.goldRainUntil - now;
    const dc = game.buffs.discoUntil - now;
    if (gr > 0) { buffBadge.style.display = 'block'; buffTime.textContent = Math.ceil(gr/1000)+'s'; }
    else if (dc > 0) { buffBadge.style.display = 'block'; buffTime.textContent = Math.ceil(dc/1000)+'s'; buffBadge.querySelector('.mult').textContent = '10x'; }
    else buffBadge.style.display = 'none';
    renderAutoSlots(); renderPegSlots(); renderGeneral();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener('beforeunload', () => saveGame(game.state, game.upgrades, game.board));
