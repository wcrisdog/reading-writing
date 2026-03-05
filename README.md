# 智引文思（Write Bot）

一个基于原生 Web + Vercel Serverless 的 AI 写作教练应用，面向议论文、记叙文、学术论文三类写作场景，强调“引导思考”而不是“直接代写”。

## 功能概览

- 三种写作类型：议论文、记叙文、学术论文
- 中英文双语界面与双语 AI 提示
- 四个核心 AI 功能：
	- 启动引导：分步提问 + AI 反馈 + 生成详细大纲
	- 素材推荐：结合主题、写作进度与偏好生成素材卡片
	- 灵感提示：手动触发 + 卡顿自动检测触发
	- 优化修补：AI 生成引导性问题并给出针对性反馈
- 编辑器能力：自动保存、手动保存、清空、导出 `.txt`
- 写作数据面板：字符/字数/段落、完成度、写作时长与速度
- **✨ 全新写作报告系统**（v2.1.1）：
	- **🤖 AI智能评分**：接入大语言模型，提供专业的六维评分、等级评定和综合评价
	- **📊 评分与诊断**：参考中考/高考评分标准，六维能力评分（结构、论证、语言、素材、逻辑、反思）
	- **🔄 过程复盘**：卡顿分析、工具使用统计、素材采纳情况、写作节奏分析
	- **📈 成长档案**：六维能力追踪、进步里程碑、薄弱项提醒、历史趋势分析
	- **🛡️ 降级保障**：AI失败时自动使用本地评分，确保始终能获得结果
- 失败降级：AI 不可用时使用本地灵感提示与本地素材库

## 运行方式

### 1) 本地开发（推荐，含完整 AI 功能）

> 需要 Node.js 18+（Vercel CLI 运行 API）。

```bash
npm install
npm run dev
```

然后打开 Vercel 本地地址（通常是 `http://localhost:3000`）。

### 2) 仅前端静态预览

可直接打开 `index.html`，但若没有可用后端 `/api/qianwen/`，AI 功能会不可用，仅能使用本地能力与降级内容。

### 3) 部署到 Vercel

1. 导入本仓库到 Vercel
2. 配置环境变量：`QIANWEN_API_KEY`
3. 部署后即可通过 `/api/qianwen/` 调用通义千问

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `QIANWEN_API_KEY` | 是 | 阿里云 DashScope（通义千问）API Key |

## API 与架构说明

- 前端通过 `ai-service.js` 调用同源接口：`/api/qianwen/`
- 后端入口：`api/qianwen.js`（Vercel Serverless Function）
- 模型策略：优先 `qwen-plus`，失败时回退 `qwen-turbo`
- 服务端管理密钥，前端不暴露 API Key

## 项目结构

```text
reading-writing/
├── index.html            # 主页面
├── styles.css            # 主样式
├── script.js             # 前端主逻辑（状态、交互、存储、功能流程）
├── ai-service.js         # AI 调用封装（提示词与请求重试）
├── api/
│   └── qianwen.js        # Vercel Serverless API 代理
├── vercel.json           # Vercel 函数资源与超时配置
├── package.json
└── README.md
```

## npm scripts

- `npm run dev`：启动 Vercel 本地开发环境
- `npm run build`：将主站静态文件复制到 `public/`

## 浏览器与数据存储

- 推荐现代浏览器：Chrome / Edge / Safari / Firefox
- 用户写作内容保存在浏览器 `localStorage`
- 历史记录默认保留最近 10 条
- **成长档案数据**保存在 `localStorage`，包括历史写作记录、能力评分、里程碑等

## 📖 详细文档

- **[AI智能评分指南](./AI_EVALUATION_GUIDE.md)** - AI评分系统使用说明、技术实现、问题排查
- 查看AI评分功能的详细说明，包括评分标准、工作流程、降级策略等

---

© 2026 智引文思（Write Bot）- AI写作教练平台 v2.1.1

## License

MIT
