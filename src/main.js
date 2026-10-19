// ============================================================
// main.js — 入口：初始化、主循环、分组升级面板、技能、自适应
// ============================================================

/* global CONFIG, Game, UpgradeManager, render, saveGame, SOUND */

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas, CONFIG, new UpgradeManager(CONFIG));
window.game = game;

const dropBtn = document.getElementById('dropBtn');
const pauseBtn = document.getElementById('pauseBtn');
const upgradeListEl = document.getElementById('upgradeList');
const skillBarEl = document.getElementById('skillBar');
const saveStatusEl = document.getElementById('saveStatus');

dropBtn.addEventListener('click', () => game.manualDrop(performance.now()));
pauseBtn.addEventListener('click', () => {
  game.running = !game.running;
  pauseBtn.textContent = game.running ? '⏸ 暂停' : '▶ 继续';
});

// 键盘
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); game.manualDrop(performance.now()); }
});

// 金饼干点击（canvas 坐标→逻辑坐标）
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const gc = game.goldenCookie;
  if (gc.active && Math.hypot(x - gc.x, y - gc.y) < 25) game.clickGoldenCookie(performance.now());
});

const GROUP_TITLE = { auto: '⚙ 自动球升级', peg: '🪣 钉子升级', general: '⚡ 全体升级' };

function renderUpgrades() {
  upgradeListEl.innerHTML = '';
  const groups = ['auto', 'peg', 'general'];
  for (const g of groups) {
    const items = CONFIG.upgrades.list.filter((u) => u.group === g && !game.upgrades.isSkill(u.id));
    if (!items.length) continue;
    const h = document.createElement('div');
    h.className = 'groupTitle';
    h.textContent = GROUP_TITLE[g];
    upgradeListEl.appendChild(h);
    for (const up of items) {
      const lv = game.upgrades.getLevel(up.id);
      const maxed = game.upgrades.isMaxed(up.id);
      const unlocked = game.upgrades.isUnlocked(up.id);
      const cost = game.upgrades.getCost(up.id);
      const can = game.upgrades.canBuy(up.id, game.state);
      const cur = up.currency === 0 ? '💰' : '🔵';
      const div = document.createElement('div');
      div.className = 'upgrade' + (!unlocked ? ' locked' : '') + (maxed ? ' maxed' : '');
      div.innerHTML = `
        <div class="name">${up.name} <span class="lvl">${maxed ? 'MAX' : 'Lv' + lv}</span></div>
        <div class="desc">${up.desc}</div>
        <div class="meta">${unlocked ? (maxed ? '—' : cur + ' ' + Math.floor(cost)) : '🔒 待解锁'}</div>
        <button ${!can ? 'disabled' : ''}>購入</button>`;
      if (can) div.querySelector('button').addEventListener('click', () => {
        game.upgrades.buy(up.id, game.state);
        SOUND.buy();
        renderUpgrades();
      });
      upgradeListEl.appendChild(div);
    }
  }
}

function renderSkills(now) {
  skillBarEl.innerHTML = '';
  for (const id of ['skill_multiball', 'skill_goldrain', 'skill_disco']) {
    const up = CONFIG.upgrades.list.find((u) => u.id === id);
    if (!game.upgrades.isUnlocked(id)) continue;
    const left = Math.max(0, game.skillCd[id] - now);
    const div = document.createElement('div');
    div.className = 'skill' + (left > 0 ? ' cd' : '');
    div.innerHTML = `<div>${up.name}</div><div class="cd">${left > 0 ? Math.ceil(left / 1000) + 's' : '使用可'}</div>`;
    if (left <= 0) div.addEventListener('click', () => { game.useSkill(id, now); renderUpgrades(); });
    skillBarEl.appendChild(div);
  }
}

function resize() {
  const area = document.getElementById('gameArea');
  const availH = area.clientHeight - 20;
  const availW = area.clientWidth - 20;
  const scale = Math.min(availW / canvas.width, availH / canvas.height);
  canvas.style.width = canvas.width * scale + 'px';
  canvas.style.height = canvas.height * scale + 'px';
}
window.addEventListener('resize', resize);
resize();

let _lastUi = 0;
function loop(now) {
  game.update(now);
  render(game.ctx || game.canvas.getContext('2d'), game, now);
  if (now - _lastUi > 300) {
    _lastUi = now;
    renderUpgrades();
    renderSkills(now);
    saveStatusEl.textContent = '自動保存中… ' + new Date().toLocaleTimeString();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener('beforeunload', () => saveGame(game.state, game.upgrades, game.board));
