// ============================================================
// audio.js — WebAudio 合成音效（无外部音频文件，原创合成）
// ============================================================

class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  ensure() {
    if (this.ctx) return this.ctx;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { this.ctx = null; }
    return this.ctx;
  }
  tone(freq, dur, type = 'square', vol = 0.05, slide = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  }
  pop()   { this.tone(300, 0.08, 'triangle', 0.04, 200); }
  peg()   { this.tone(800 + Math.random() * 400, 0.03, 'square', 0.02); }
  coin()  { this.tone(660, 0.08, 'sine', 0.05, 300); setTimeout(() => this.tone(990, 0.1, 'sine', 0.04), 60); }
  buy()   { this.tone(440, 0.08, 'square', 0.05); setTimeout(() => this.tone(660, 0.1, 'square', 0.05), 80); }
  star()  { this.tone(523, 0.12, 'triangle', 0.06); setTimeout(() => this.tone(784, 0.18, 'triangle', 0.06), 120); }
  cookie(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,0.12,'sine',0.06),i*70)); }
}

const SOUND = new SoundBank();
if (typeof window !== 'undefined') window.SOUND = SOUND;
if (typeof module !== 'undefined') module.exports = { SoundBank };
