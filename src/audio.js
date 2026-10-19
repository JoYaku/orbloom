// ============================================================
// audio.js — 柔和雨天氛围音：Web Audio 合成（无外部音频文件）
// ============================================================

let _ctx = null;
let _master = null;
let _muted = false;
let _bgmStarted = false;

function ctx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.value = 0.5;
    _master.connect(_ctx.destination);
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// 柔和包络音（正弦波+指数衰减）
function tone(freq, dur, vol, type = 'sine') {
  if (_muted) return;
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g); g.connect(_master);
  o.start(); o.stop(c.currentTime + dur + 0.05);
}

// 碰钉：清脆水滴/木琴感（高频短音）
function peg() { tone(2200 + Math.random()*800, 0.08, 0.15); }
// 掉球：轻柔啵
function pop() { tone(500, 0.1, 0.12, 'triangle'); }
// 入桶：柔和叮
function coin() { tone(880, 0.25, 0.18); tone(1320, 0.3, 0.1); }
// 购买：柔和上行
function buy() { tone(660, 0.1, 0.1); setTimeout(() => tone(880, 0.15, 0.1), 60); }
// 星级：上行琶音
function star() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.3, 0.15), i*120)); }
// 金饼干：明亮短音
function cookie() { tone(1047, 0.2, 0.15); setTimeout(() => tone(1568, 0.25, 0.12), 80); }

// ---- BGM：雨声 + 轻柔钢琴和弦循环 ----
let _rainNode = null;
let _chordTimer = null;
const CHORDS = [
  [262, 330, 392],   // C
  [220, 262, 330],   // Am
  [175, 220, 262],   // F
  [196, 247, 294],   // G
];
let _chordIdx = 0;

function startBGM() {
  if (_bgmStarted) return;
  _bgmStarted = true;
  const c = ctx();
  // 雨声：白噪音低通
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  _rainNode = c.createBufferSource();
  _rainNode.buffer = buf;
  _rainNode.loop = true;
  const filt = c.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 800;
  const rainGain = c.createGain();
  rainGain.gain.value = 0.08;
  _rainNode.connect(filt); filt.connect(rainGain); rainGain.connect(_master);
  _rainNode.start();
  // 钢琴和弦循环
  const playChord = () => {
    if (_muted) return;
    const notes = CHORDS[_chordIdx % CHORDS.length];
    _chordIdx++;
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = f * 2; // 高八度更柔和
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.5 + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.5);
      o.connect(g); g.connect(_master);
      o.start(); o.stop(c.currentTime + 3.6);
    });
  };
  playChord();
  _chordTimer = setInterval(playChord, 4000);
}

// 首次用户交互启动 BGM
function ensureBGM() { if (!_bgmStarted) startBGM(); }

function mute(m) {
  _muted = m;
  if (_master) _master.gain.value = m ? 0 : 0.5;
}

window.SOUND = { peg, pop, coin, buy, star, cookie, startBGM, ensureBGM, mute };
