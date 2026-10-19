// ============================================================
// physics.js — 球体物理、稀有度生成、碰钉事件
// ============================================================

class Ball {
  constructor(x, y, rarityTier, radius) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = 0;
    this.radius = radius;
    this.rarity = rarityTier;
    this.dead = false;
    this.pegHits = 0;
    this.rotation = 0;
  }
}

function stepPhysics(ball, board, config) {
  const p = config.physics;
  const hits = [];
  ball.vy += p.gravity;
  if (ball.vy > p.maxBallSpeed) ball.vy = p.maxBallSpeed;
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.rotation += ball.vx * 0.05;

  if (ball.x - ball.radius < board.left) {
    ball.x = board.left + ball.radius;
    ball.vx = Math.abs(ball.vx) * p.wallBounce;
  }
  if (ball.x + ball.radius > board.right) {
    ball.x = board.right - ball.radius;
    ball.vx = -Math.abs(ball.vx) * p.wallBounce;
  }

  for (const peg of board.pegs) {
    const dx = ball.x - peg.x, dy = ball.y - peg.y;
    const dist = Math.hypot(dx, dy);
    const minDist = ball.radius + peg.radius;
    if (dist < minDist && dist > 0) {
      const nx = dx / dist, ny = dy / dist;
      ball.x += nx * (minDist - dist);
      ball.y += ny * (minDist - dist);
      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx = (ball.vx - 2 * dot * nx) * p.pegBounce;
      ball.vy = (ball.vy - 2 * dot * ny) * p.pegBounce;
      ball.vx += (Math.random() - 0.5) * p.horizontalRandomness;
      if (Math.abs(nx) < 0.15 && Math.abs(ball.vx) < 0.6) {
        ball.vx += (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.5);
      }
      ball.pegHits++;
      hits.push({ x: peg.x, y: peg.y });
    }
  }

  const bucketLine = board.buckets[0] ? board.buckets[0].y : board.bottom;
  if (ball.y + ball.radius >= bucketLine) {
    let nearest = null, minDist = Infinity;
    for (const bucket of board.buckets) {
      const d = Math.abs(ball.x - bucket.x);
      if (d < minDist) { minDist = d; nearest = bucket; }
    }
    if (nearest) return { captured: true, bucket: nearest, hits };
  }
  if (ball.y > board.bottom + 50) return { lost: true, hits };
  return { captured: false, hits };
}

// [V] 自然球 80/11/8/1；rarityChance 升级为简化升档
function rollRarity(config, rarityChance = 0) {
  const tiers = config.rarity.tiers;
  const byId = Object.fromEntries(tiers.map((t) => [t.id, t]));
  const r = Math.random() * 100;
  let pick;
  if (r < 1) pick = byId.legendary;
  else if (r < 9) pick = byId.epic;
  else if (r < 20) pick = byId.rare;
  else pick = byId.uncommon;
  if (rarityChance > 0 && Math.random() < rarityChance) {
    const order = ['uncommon', 'rare', 'epic', 'legendary'];
    const idx = order.indexOf(pick.id);
    if (idx >= 0 && idx < order.length - 1) pick = byId[order[idx + 1]];
  }
  return pick;
}

if (typeof module !== 'undefined') module.exports = { Ball, stepPhysics, rollRarity };
