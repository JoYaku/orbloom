// ============================================================
// ui.js — Canvas 渲染：雨天斜光、空心雨滴钉、彩虹、草地、buff 橙光
// ============================================================

/* global formatNumber, ballsNeededForNextLevel */

let _rain = null;

function render(ctx, game, now) {
  const W = game.canvas.width, H = game.canvas.height;

  // 天空（原作晴天浅蓝灰渐变）
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#d6e2ec');
  sky.addColorStop(0.55, '#93adc1');
  sky.addColorStop(1, '#6d8ca3');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawDiagonalLight(ctx, W, H, now);
  drawRainbowArc(ctx, W, H);
  drawRainDrops(ctx, W, H, now);

  // 草地（底部起伏草坡）
  drawGrass(ctx, W, H);

  drawHudCanvas(ctx, game, W, now);

  for (const peg of game.board.pegs) drawPeg(ctx, peg);
  for (const bucket of game.board.buckets) drawBucket(ctx, bucket, game.config);

  for (const ball of game.activeBalls) drawBall(ctx, ball);

  // 粒子
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (game.goldenCookie.active) drawCookie(ctx, game, now);

  // 飘字
  for (const n of game.risingNumbers) {
    ctx.globalAlpha = Math.max(0, n.life);
    ctx.fillStyle = n.color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+' + formatNumber(n.value), n.x, n.y);
  }
  ctx.globalAlpha = 1;

  // buff 激活：边缘橙光
  if (now < game.buffs.goldRainUntil || now < game.buffs.discoUntil) {
    const g = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
    g.addColorStop(0, 'rgba(255,150,50,0)');
    g.addColorStop(1, 'rgba(255,120,30,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawDiagonalLight(ctx, W, H, now) {
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = '#eaf4ff';
  ctx.lineWidth = 36;
  for (let i = -2; i < 5; i++) {
    const x = i * 150 + (now * 0.008 % 150);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 220, H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrass(ctx, W, H) {
  const gh = 38;
  const top = H - gh;
  // 草坡底色（起伏波浪）
  ctx.fillStyle = '#4f7d3a';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, top + 6);
  for (let x = 0; x <= W; x += 20) {
    ctx.quadraticCurveTo(x + 10, top - 6, x + 20, top + 4);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  // 草尖
  ctx.strokeStyle = '#6da352';
  ctx.lineWidth = 2;
  for (let x = 6; x < W; x += 14) {
    const h = 6 + (x % 3) * 2;
    ctx.beginPath();
    ctx.moveTo(x, top + 8);
    ctx.lineTo(x, top + 8 - h);
    ctx.stroke();
  }
}

function drawRainbowArc(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  const colors = ['#e86a6a', '#f09a55', '#f2cf55', '#7fc47f', '#6fa8d8', '#9a86c8'];
  colors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(W * 1.16, H * 0.42, H * 0.78 + i * 9, Math.PI * 0.72, Math.PI * 1.28);
    ctx.stroke();
  });
  ctx.restore();
}

function drawRainDrops(ctx, W, H, now) {
  if (!_rain) {
    _rain = [];
    for (let i = 0; i < 22; i++) _rain.push({ x: Math.random()*W, y: Math.random()*H, s: 4+Math.random()*6 });
  }
  ctx.strokeStyle = 'rgba(230,245,255,0.35)';
  ctx.lineWidth = 1.5;
  for (const d of _rain) {
    d.y += d.s; d.x -= 1;
    if (d.y > H) { d.y = -10; d.x = Math.random()*W; }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 2, d.y + 11);
    ctx.stroke();
  }
}

function drawHudCanvas(ctx, game, W, H) {
  // 桶上方的 Y 形白色支架
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (const b of game.board.buckets) {
    ctx.beginPath();
    ctx.moveTo(b.x - b.width/2 + 3, b.y);
    ctx.lineTo(b.x, b.y - 14);
    ctx.moveTo(b.x + b.width/2 - 3, b.y);
    ctx.lineTo(b.x, b.y - 14);
    ctx.stroke();
  }
}

function drawPeg(ctx, peg) {
  const t = peg.type || 'plain';
  const flash = Math.max(0, peg.flash || 0);
  ctx.save();
  if (t === 'white') { ctx.fillStyle = '#e8f4ff'; ctx.shadowColor = '#b3e5fc'; ctx.shadowBlur = 8 + flash*20; }
  else if (t === 'green') { ctx.fillStyle = '#9ce89c'; ctx.shadowColor = '#81c784'; ctx.shadowBlur = 12 + flash*24; }
  ctx.strokeStyle = t === 'plain' ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.5;
  // 空心水滴形
  ctx.beginPath();
  ctx.moveTo(peg.x, peg.y - peg.radius - 3);
  ctx.quadraticCurveTo(peg.x + peg.radius + 1, peg.y, peg.x, peg.y + peg.radius + 1);
  ctx.quadraticCurveTo(peg.x - peg.radius - 1, peg.y, peg.x, peg.y - peg.radius - 3);
  if (t === 'plain') {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
  } else ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBucket(ctx, bucket, config) {
  const w = bucket.width, x = bucket.x, y = bucket.y, h = 36;
  const flash = bucket.flash > 0 ? bucket.flash : 0;
  const hot = flash > 0;
  // 桶底色（普通深紫灰；命中瞬间红色高亮）
  ctx.fillStyle = hot ? '#c9405a' : '#33244a';
  ctx.fillRect(x - w/2, y, w, h);
  // 进度填充（从底部往上一点点涨）
  const need = ballsNeededForNextLevel(bucket, config);
  const fill = Math.min(1, bucket.progress / need);
  if (fill > 0.01) {
    ctx.fillStyle = 'rgba(255,213,79,0.45)';
    ctx.fillRect(x - w/2 + 2, y + h - h*fill - 2, w - 4, h*fill);
  }
  ctx.strokeStyle = hot ? '#e0607a' : '#6a5a8a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w/2, y, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bucket.level, x, y + h/2);
  ctx.textBaseline = 'alphabetic';
}

function drawBall(ctx, ball) {
  ctx.save();
  const g = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.radius);
  g.addColorStop(0, '#fff');
  g.addColorStop(0.3, ball.rarity.color);
  g.addColorStop(1, ball.rarity.color);
  ctx.fillStyle = g;
  ctx.shadowColor = ball.rarity.color;
  ctx.shadowBlur = ball.rarity.id === 'legendary' ? 16 : 8;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawCookie(ctx, game, now) {
  const x = game.goldenCookie.x, y = game.goldenCookie.y;
  const pulse = 1 + Math.sin(now/150)*0.1;
  ctx.save();
  ctx.fillStyle = '#ffd54f'; ctx.shadowColor = '#ffd54f'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, 14*pulse, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7a4a00'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText('★', x, y+4);
  ctx.restore();
}

if (typeof module !== 'undefined') module.exports = { render };
