// ============================================================
// board.js — 棋盘生成：15×9 梅花桩钉子 + 14 桶（[VERIFIED] 布局）
// 桶升级：收集球数阈值 Round(20 × 1.12^(level-1))
// ============================================================

function buildBoard(canvasWidth, canvasHeight, config) {
  const b = config.board;
  const pegs = [];
  const buckets = [];

  const startY = b.topMargin;
  const maxCols = b.pegColsMax;          // 15
  const rowWidth = (maxCols - 1) * b.pegSpacingX;
  const baseStartX = canvasWidth / 2 - rowWidth / 2;

  // 钉子：隔行交替 15 / 14（oneFewerPegOnAlternateRows）
  for (let row = 0; row < b.pegRows; row++) {
    const isFewer = b.altRowsOneLess && row % 2 === 1;
    const cols = maxCols - (isFewer ? 1 : 0);
    const thisRowWidth = (cols - 1) * b.pegSpacingX;
    const startX = canvasWidth / 2 - thisRowWidth / 2;
    const y = startY + row * b.pegSpacingY;
    for (let c = 0; c < cols; c++) {
      pegs.push({
        x: startX + c * b.pegSpacingX,
        y,
        radius: b.pegRadius,
        type: 'plain',   // plain=普通半透明; white=碰钱发光; green=碰钱更亮
        flash: 0,        // 碰撞时短暂闪光
      });
    }
  }

  // 底部 14 个桶
  const bucketY = startY + b.pegRows * b.pegSpacingY + 16;
  const count = b.buckets;
  const bucketWidth = canvasWidth / count;
  for (let i = 0; i < count; i++) {
    buckets.push({
      index: i,
      x: bucketWidth * i + bucketWidth / 2,
      y: bucketY,
      width: bucketWidth - 4,
      level: 1,   // 1-based，Lv1 起步
      progress: 0, // 当前等级已收集球数
      hits: 0,
      flash: 0,
    });
  }

  return {
    pegs, buckets,
    left: 10, right: canvasWidth - 10,
    top: 40, bottom: bucketY,
    dropY: 50, width: canvasWidth, height: canvasHeight,
  };
}

// 桶升到下一级所需球数（[VERIFIED] Round(20×1.12^(level-1))）
function ballsNeededForNextLevel(bucket, config) {
  const lvl = bucket.level - 1; // 内部 0-based
  return Math.round(config.bucket.ballTargetBase *
    Math.pow(config.bucket.ballTargetScalar, lvl));
}

// 根据购买的钉子升级数量，把对应数量的钉子标记为 white/green（常亮、碰钱）
function applyPegTypes(board, whiteCount, greenCount) {
  const pegs = board.pegs;
  pegs.forEach((p) => { p.type = 'plain'; });
  const total = Math.min(whiteCount + greenCount, pegs.length);
  if (total <= 0) return;
  const step = pegs.length / total;
  for (let i = 0; i < total; i++) {
    const idx = Math.min(pegs.length - 1, Math.floor(i * step + step / 2));
    pegs[idx].type = i < whiteCount ? 'white' : 'green';
  }
}

// 球入桶后累加进度，返回是否升级（maxLevel 可由升级系统提高）
function addBucketBalls(bucket, ballCount, config, maxLevel) {
  const cap = maxLevel || config.bucket.baseMaxLevel;
  bucket.progress += ballCount;
  bucket.hits += ballCount;
  let leveled = false;
  while (bucket.level < cap && bucket.progress >= ballsNeededForNextLevel(bucket, config)) {
    bucket.progress -= ballsNeededForNextLevel(bucket, config);
    bucket.level++;
    bucket.flash = 1;
    leveled = true;
  }
  return leveled;
}

if (typeof module !== 'undefined') module.exports = {
  buildBoard, ballsNeededForNextLevel, addBucketBalls, applyPegTypes,
};
