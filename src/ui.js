// ============================================================
// ui.js — Canvas 渲染：Stage1 雨天背景、彩虹球、雨滴钉、粒子
// ============================================================

/* global formatNumber, ballsNeededForNextLevel */

let _rainDrops = null;

function render(ctx, game, now) {
  const W = game.canvas.width, H = game.canvas.height;
  const theme = game.config.stage1.theme;

  // 天空渐变
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawRainbow(ctx, W, H);
  drawRain(ctx, W, H, now);

  // 草地
  ctx.fillStyle = theme.grass;
  ctx.fillRect(0, H - 40, W, 40);

  drawHud(ctx, game, W);

  // 雨滴钉子
  for (const peg of game.board.pegs) drawPeg(ctx, peg);

  // 桶
  for (const bucket of game.board.buckets) drawBucket(ctx, bucket, game);

  // 彩虹球
  for (const ball of game.activeBalls) drawBall(ctx, ball);

  // 粒子
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 金饼干
  if (game.goldenCookie.active) drawCookie(ctx, game, now);

  // 飘字
  for (const n of game.risingNumbers) {
    ctx.globalAlpha = Math.max(0, n.life);
    ctx.fillStyle = n.color;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+' + formatNumber(n.value), n.x, n.y);
  }
  ctx.globalAlpha = 1;
}

function drawRainbow(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.25;
  const colors = ['#ff6b6b', '#ffd54f', '#81c784', '#64b5f6', '#b39ddb'];
  colors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(W * 0.75, H * 0.55, 260 + i * 7, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  });
  ctx.restore();
}

function drawRain(ctx, W, H, now) {
  if (!_rainDrops) {
    _rainDrops = [];
    for (let i = 0; i < 40; i++) {
      _rainDrops.push({ x: Math.random() * W, y: Math.random() * H, s: 4 + Math.random() * 6 });
    }
  }
  ctx.strokeStyle = 'rgba(200,220,255,0.35)';
  ctx.lineWidth = 1;
  for (const d of _rainDrops) {
    d.y += d.s;
    if (d.y > H) { d.y = -10; d.x = Math.random() * W; }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 2, d.y + 10);
    ctx.stroke();
  }
}

function drawHud(ctx, game, W) {
  ctx.fillStyle = 'rgba(10,16,28,0.85)';
  ctx.fillRect(0, 0, W, 38);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('💰' + formatNumber(game.state.coins), 10, 24);
  ctx.fillStyle = '#81c784';
  ctx.fillText('🔵' + formatNumber(game.state.balls), 110, 24);
  // 星级
  const stars = game.state.star;
  ctx.fillStyle = '#ffd54f';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 200, 24);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#90caf9';
  ctx.fillText(formatNumber(game.getCoinsPerSec()) + '/s', W - 10, 24);
}

function drawPeg(ctx, peg) {
  ctx.save();
  ctx.fillStyle = 'rgba(180,210,240,0.55)';
  ctx.beginPath();
  // 雨滴形
  ctx.moveTo(peg.x, peg.y - peg.radius - 2);
  ctx.quadraticCurveTo(peg.x + peg.radius, peg.y, peg.x, peg.y + peg.radius);
  ctx.quadraticCurveTo(peg.x - peg.radius, peg.y, peg.x, peg.y - peg.radius - 2);
  ctx.fill();
  ctx.restore();
}

function drawBucket(ctx, bucket, game) {
  const w = bucket.width, x = bucket.x, y = bucket.y, h = 56;
  const flash = bucket.flash > 0 ? bucket.flash : 0;
  ctx.fillStyle = flash > 0 ? `rgba(255,213,79,${0.2 + flash * 0.4})` : 'rgba(60,30,80,0.9)';
  ctx.fillRect(x - w / 2, y, w, h);
  ctx.strokeStyle = flash > 0 ? '#ffd54f' : '#8e44ad';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y, w, h);
  const need = ballsNeededForNextLevel(bucket, game.config);
  const fill = Math.min(1, bucket.progress / need);
  ctx.fillStyle = 'rgba(129,199,132,0.3)';
  ctx.fillRect(x - w / 2 + 2, y + h - h * fill - 2, w - 4, h * fill);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(bucket.level, x, y + 20);
}

function drawBall(ctx, ball) {
  ctx.save();
  const g = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.radius);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.3, ball.rarity.color);
  g.addColorStop(1, ball.rarity.color);
  ctx.fillStyle = g;
  ctx.shadowColor = ball.rarity.color;
  ctx.shadowBlur = ball.rarity.id === 'legendary' ? 16 : 8;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCookie(ctx, game, now) {
  const x = game.goldenCookie.x, y = game.goldenCookie.y;
  const pulse = 1 + Math.sin(now / 150) * 0.1;
  ctx.save();
  ctx.fillStyle = '#ffd54f';
  ctx.shadowColor = '#ffd54f';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, 14 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#7a4a00';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', x, y + 4);
  ctx.restore();
}

if (typeof module !== 'undefined') module.exports = { render };
