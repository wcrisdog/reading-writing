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
2. 按 `.env.example` 配置环境变量
3. 部署后即可通过 `/api/qianwen/` 调用通义千问，并通过 `/api/auth/send-code`、`/api/auth/verify-code` 发送和校验真实验证码

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `QIANWEN_API_KEY` | 是 | 阿里云 DashScope（通义千问）API Key |
| `RAG_ENABLED` | 否 | 是否启用服务端 RAG，默认 `true`，可设置为 `false` 临时关闭 |
| `RAG_TOP_K` | 否 | 每次检索返回的参考片段数量，默认 `3`，建议范围 `2-6` |
| `RESEND_API_KEY` | 邮箱验证码必填 | Resend 邮件发送服务 API Key |
| `RESEND_FROM_EMAIL` | 邮箱验证码必填 | 已在 Resend 验证的发件邮箱，例如 `Write Bot <no-reply@yourdomain.com>` |
| `VERIFICATION_CODE_SIGNING_SECRET` | 邮箱验证码必填 | 服务端签名邮箱验证码 challenge 的密钥，建议使用随机长字符串 |
| `UNISMS_API_KEY` | 短信验证码必填 | UniSMS API Key |
| `UNISMS_API_SECRET` | 建议填写 | UniSMS API Secret（如你的账户启用 Key+Secret 鉴权） |
| `UNISMS_API_URL` | 否 | UniSMS 短信发送地址，默认 `https://api.unisms.io/v1/sms/messages` |
| `UNISMS_SIGNATURE` | 否 | 短信签名（不填则默认显示“智引文思”） |

## 验证码服务说明

- 邮箱验证码：通过 Resend 真实发信，服务端生成 6 位验证码并签名 challenge，前端不再保存明文验证码。
- 短信验证码：通过 UniSMS 真实下发；验证码校验改为服务端 challenge 签名校验，避免每次校验都调用第三方接口，降低成本。
- 中国大陆手机号：前端输入仍按 11 位手机号处理，服务端会自动转换为 `+86` E.164 格式再调用短信服务。
- 若只配置了邮箱或短信其中一种，未配置的渠道会在发送时返回明确错误提示。

## API 与架构说明

- 前端通过 `ai-service.js` 调用同源接口：`/api/qianwen/`
- 认证接口通过前端脚本直接调用：`/api/auth/send-code`、`/api/auth/verify-code`
- 后端入口：`api/qianwen.js`、`api/auth/send-code.js`、`api/auth/verify-code.js`
- RAG 检索模块：`api/rag/retriever.js`（当前使用本地语料库）
- RAG 语料库：`data/rag-materials.json`
- 验证码工具：`api/auth/_verification-utils.js`
- 模型策略：优先 `qwen-plus`，失败时回退 `qwen-turbo`
- 服务端管理密钥，前端不暴露 API Key、邮件验证码或短信服务凭证

## RAG 部署说明（已接入当前项目）

当前项目已经接入轻量 RAG：当请求类型为素材推荐/上下文灵感时，服务端会先从本地语料中检索相关片段，再把检索结果作为额外系统提示发送给大模型，从而让输出更贴近写作场景。

### 1) 立即可用的方式（当前实现）

1. 在 `data/rag-materials.json` 中维护素材知识库（可按 essayType、tags 扩充）
2. 在 Vercel 设置 `RAG_ENABLED=true`（可省略，默认开启）
3. 可按需要设置 `RAG_TOP_K=3`
4. 重新部署后即可生效

### 2) 升级到向量数据库（推荐生产）

当你的素材规模变大（数千条以上），建议升级为 embedding + 向量检索：

1. 选择向量库：`pgvector` / `Pinecone` / `Milvus` / `Qdrant`
2. 离线建立索引：将素材分块、生成 embedding、写入向量库
3. 在线检索：在 `api/rag/retriever.js` 中替换本地打分逻辑为向量相似度查询
4. 保留当前注入机制：继续通过 `api/qianwen.js` 将 top-k 检索结果注入模型上下文

这样可以在保持现有 API 协议不变的情况下平滑演进。

## 项目结构

```text
reading-writing/
├── index.html            # 主页面
├── styles.css            # 主样式
├── script.js             # 前端主逻辑（状态、交互、存储、功能流程）
├── ai-service.js         # AI 调用封装（提示词与请求重试）
├── .env.example          # 环境变量示例
├── api/
│   ├── qianwen.js        # Vercel Serverless AI 代理
│   ├── rag/
│   │   └── retriever.js  # RAG 检索逻辑（本地语料/后续可替换向量检索）
│   └── auth/
│       ├── send-code.js  # 发送真实短信/邮箱验证码
│       ├── verify-code.js# 校验真实短信/邮箱验证码
│       └── _verification-utils.js
├── data/
│   └── rag-materials.json# RAG 语料知识库
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
