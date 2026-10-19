# 技术选型：HTML5 + Canvas

## 候选方案对比

| 维度 | Unity | HTML5/Canvas |
|---|---|---|
| 环境要求 | 需安装 Unity Hub + Editor（数 GB） | 任意现代浏览器 |
| 物理表现 | 内置 2D/3D 物理引擎 | 自写简单物理（重力+碰撞）足够 |
| UI 复现 | 完整 UGUI 体系 | Canvas/DOM 混合 |
| 可交付性 | 需构建打包 | 打开 HTML 即可运行 |
| 学习成本（用户是 IT 学生） | 需学 C# + Unity 工作流 | 标准 JS/HTML，可直接阅读 |
| 放置游戏契合度 | 适合 | 完全适合（2D 轻量） |

## 决定：HTML5 + Canvas

**理由：**
1. 零安装、零构建，双击 HTML 即可运行
2. Plinko 物理简单（重力 + 钉子弹性碰撞 + 桶捕获），自写完全可控
3. 原型阶段以验证玩法循环和数值为主，不需要引擎级特性
4. 用户是 IT 学生，JS 比 C#/Unity 更容易直接审阅和修改
5. 后续若需要 Steam 上架，可再用 Electron 打包或迁移 Unity

## 架构
```
src/
  config.js      所有数值参数（占位值明确标记，便于校准）
  physics.js     球、钉子、桶的物理碰撞
  economy.js     金币、倍率、结算
  upgrades.js    升级定义、价格曲线、购买
  rarity.js      稀有度系统
  board.js       棋盘生成（钉子布局、桶布局）
  save.js        localStorage 存档
  game.js        主游戏循环与状态
  ui.js          UI 渲染与交互
  main.js        入口
index.html
```

## 数值标注规则
- 所有从原作提取的 VERIFIED 数值标注 `[VERIFIED]`
- 所有合理占位值标注 `[PLACEHOLDER]`
- 公式里的猜测参数标注 `[INFERRED]`
