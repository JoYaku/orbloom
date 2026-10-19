// ============================================================
// save.js — localStorage 存档（单槽位，原型独立格式，非原作 Protobuf）
// ============================================================

const SAVE_KEY = 'plinko_idle_prototype_save_v2';

function saveGame(state, upgrades, board) {
  const data = {
    version: 2,
    savedAt: Date.now(),
    coins: state.coins,
    balls: state.balls,
    totalBalls: state.totalBalls,
    stageIndex: state.stageIndex,
    upgrades: upgrades ? upgrades.serialize() : { levels: {} },
    buckets: board ? board.buckets.map((b) => ({
      level: b.level, progress: b.progress, hits: b.hits,
    })) : [],
    stats: state.stats || {},
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return { error: String(e) };
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

if (typeof module !== 'undefined') module.exports = { saveGame, loadGame, clearSave, SAVE_KEY };
