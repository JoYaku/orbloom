// ============================================================
// test_core.js — Stage1 数值与逻辑测试
// ============================================================
const { CONFIG } = require('../src/config.js');
const { vcfCalculate, upgradeCostAt, upgradeValueAt } = require('../src/curves.js');
const { Ball, stepPhysics, rollRarity } = require('../src/physics.js');
const { buildBoard, ballsNeededForNextLevel, addBucketBalls } = require('../src/board.js');
const { UpgradeManager } = require('../src/upgrades.js');

let pass = 0, fail = 0;
function assert(c, m) { if (c) { pass++; console.log('  PASS:', m); } else { fail++; console.log('  FAIL:', m); } }
function approx(a, b, eps) { return Math.abs(a - b) < (eps || 1e-6); }

console.log('=== 1. VCF 通用公式 ===');
assert(approx(vcfCalculate(0, {a:20,b:1,c:0,d:1.9,e:-28,f:0.2815}), 10), '手动成本 L0=10');
assert(approx(vcfCalculate(0, {a:0.8,b:1,c:0,d:2,e:4,f:0.1626}), 5.6, 0.01), '自动中成本 L0=5.6');
assert(approx(vcfCalculate(0, {a:60,b:1,c:0,d:2,e:2380,f:0.3}), 2500, 1), '稀有度成本 L0=2500');
assert(approx(vcfCalculate(39940, {a:5.140449,b:9.99139,c:1,d:0,e:-13.84358,f:0}), 1, 0.05), '转生 39940→1');

console.log('=== 2. 成本/效果分离 ===');
{
  const m = CONFIG.upgrades.list.find(u => u.id === 'manual_drop');
  assert(approx(upgradeCostAt(m, 0), 10, 1e-6), '手动成本 L0=10');
  assert(approx(upgradeValueAt(m, 0), 4, 0.01), '手动效果 L0=4s');
  const ac = CONFIG.upgrades.list.find(u => u.id === 'auto_center');
  assert(approx(upgradeCostAt(ac, 0), 5.6, 0.05), '自动中成本 L0=5.6');
  assert(approx(upgradeValueAt(ac, 0), 4, 0.01), '自动中效果 L0=4s(clamp)');
  const rc = CONFIG.upgrades.list.find(u => u.id === 'rarity_chance');
  assert(approx(upgradeCostAt(rc, 0), 2500, 1), '稀有度成本 L0=2500');
  assert(approx(upgradeValueAt(rc, 0), 0.01, 1e-6), '稀有度效果 L0=0.01');
  const sm = CONFIG.upgrades.list.find(u => u.id === 'skill_multiball');
  assert(approx(upgradeCostAt(sm, 0), 50, 1e-6), '多球技能成本=50');
}

console.log('=== 3. 稀有度 ===');
{
  const T = Object.fromEntries(CONFIG.rarity.tiers.map(t => [t.id, t]));
  assert(T.uncommon.value===2 && T.rare.value===5 && T.epic.value===10 && T.legendary.value===100, '价值表');
  const N=200000, cnt={};
  for (let i=0;i<N;i++){ const r=rollRarity(CONFIG,0); cnt[r.id]=(cnt[r.id]||0)+1; }
  assert((cnt.common||0)===0, '自然球无 common');
  assert(Math.abs(cnt.uncommon/N-0.80)<0.01, 'uncommon≈80%');
  assert(Math.abs(cnt.rare/N-0.11)<0.01, 'rare≈11%');
  assert(Math.abs(cnt.epic/N-0.08)<0.01, 'epic≈8%');
  assert(Math.abs(cnt.legendary/N-0.01)<0.005, 'legendary≈1%');
}

console.log('=== 4. 棋盘与桶 ===');
{
  const b = buildBoard(520,720,CONFIG);
  assert(b.buckets.length===14, '14 桶');
  assert(b.pegs.length===131, '131 钉');
  const bk=b.buckets[0];
  assert(ballsNeededForNextLevel(bk,CONFIG)===20, 'Lv1→2=20');
  addBucketBalls(bk,20,CONFIG);
  assert(bk.level===2, '20球升Lv2');
  assert(ballsNeededForNextLevel(bk,CONFIG)===22, 'Lv2→3=22');
}

console.log('=== 5. 升级购买与解锁星 ===');
{
  const up = new UpgradeManager(CONFIG);
  const state={coins:10000,balls:100};
  // manual 初始可用
  assert(up.isUnlocked('manual_drop'), '手动初始可用');
  assert(up.buy('manual_drop',state), '买手动');
  assert(state.coins<10000 && state.balls===100, '只扣金币');
  // peg_white 需 1 星
  up.setStar(0);
  assert(!up.isUnlocked('peg_white'), '白钉需1星');
  up.setStar(1);
  assert(up.isUnlocked('peg_white'), '1星后白钉解锁');
  // auto_left 需 auto_center
  up.setStar(1);
  assert(!up.isUnlocked('auto_left'), '左口需先买中央');
  assert(up.buy('auto_center',state), '买自动中央');
  assert(up.isAutoUnlocked(), '自动解锁');
  assert(up.isUnlocked('auto_left'), '左口解锁');
}

console.log('=== 6. 物理捕获 ===');
{
  const b = buildBoard(520,720,CONFIG);
  const ball = new Ball(260,50,CONFIG.rarity.tiers[1],CONFIG.board.ballRadius);
  let cap=false;
  for (let i=0;i<3000;i++){ const r=stepPhysics(ball,b,CONFIG); if(r.captured){cap=true;break;} if(r.lost)break; }
  assert(cap, '球被桶捕获');
}

console.log('=== 7. 数字格式化 ===');
{
  // formatNumber 在 economy
  const { formatNumber } = require('../src/economy.js');
  assert(formatNumber(1500)==='1.50K', '1500→1.50K');
}

console.log('\n==============================');
console.log(`测试结果: ${pass} 通过, ${fail} 失败`);
console.log('==============================');
process.exit(fail>0?1:0);
