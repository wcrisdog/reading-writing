# 智引文思 - 智能写作平台 / AI-Powered Writing Platform

智引文思是一个**真实AI驱动**的智能写作助手平台，集成阿里云通义千问大语言模型，为不同学历阶段的学生提供针对性的写作支持，帮助他们提升写作能力。

## ✨ 核心亮点

🤖 **真实AI驱动** - 集成阿里云通义千问大语言模型，提供智能化写作辅助  
📝 **三类文章** - 议论文、记叙文、学术论文，针对不同学习阶段  
🎯 **四大功能** - 启动引导、素材推荐、灵感提示、逻辑修补  
🌐 **双语支持** - 完整的中英文界面和AI响应  
💾 **本地存储** - 隐私保护，数据永不上传  

## 核心功能 / Features

### 📝 三种专业写作类型 / Three Writing Types
- **议论文** (高中) - 观点鲜明、论证有力的论说文，支持多种论证方式
- **记叙文** (高中) - 人物生动、细节丰富的叙事文，强调场景和情感描写
- **学术论文** (大学/研究生) - 严谨规范、逻辑深刻的学术作品，包含完整的学术框架

### 🤖 AI智能功能 / AI-Powered Features

#### 🚀 启动引导 / Launch Guidance
- **AI反向提问** - 通过精心设计的问题了解你的写作需求
- **智能大纲生成** - AI根据你的回答生成个性化写作大纲
- **选项式指引** - 每个问题都有多个选项供你快速选择

#### 📚 素材推荐 / Material Recommendation
- **AI智能推荐** - 根据你的主题，AI实时生成相关素材
- **分类丰富** - 议论文（名言、事例）、记叙文（描写技巧）、学术论文（理论框架）
- **降级保护** - AI不可用时自动切换到本地素材库

#### 💡 灵感提示 / Inspiration Tips
- **AI写作诊断** - AI分析你的当前内容和进度
- **卡顿检测** - 30秒无输入时自动触发AI建议
- **个性化建议** - 根据文章类型和完成度给出针对性提示

#### 🔍 逻辑修补 / Logic Repair
- **AI问题生成** - AI分析你的文章后提出针对性问题
- **引导式完善** - 不直接代写，而是引导你自己发现和改正问题
- **深度思考** - 帮助你理解写作中的逻辑关系

### 🌐 双语支持 / Bilingual Support
- 完整的中英文界面切换
- AI根据语言提供对应的响应
- 中文按字数，英文按单词进行统计

### 💾 智能存储 / Smart Storage
- 自动保存功能，防止重要内容丢失
- 本地存储，保护用户隐私
- 一键导出为文本文件
- 写作历史记录（最近10篇）

### 📊 实时统计 / Real-time Statistics
- 字符数统计
- 字数统计（智能识别语言）
- 段落数统计
- 时时刻刻掌握写作进度

## 🚀 快速开始 / Quick Start

### 在线使用（推荐）/ Online Usage (Recommended)

访问已部署的在线版本：

**🌐 在线地址 / Live URL:** https://your-deployment.vercel.app

> ⚠️ 首次部署需要按照 [DEPLOY.md](DEPLOY.md) 配置AI API密钥

### 部署你自己的版本 / Deploy Your Own

想要使用完整的AI功能？按照以下步骤部署：

1. **申请API密钥** - 参考 [DEPLOY.md](DEPLOY.md) 获取阿里云通义千问API密钥（免费100万tokens）
2. **一键部署到Vercel** - 完全免费，自动HTTPS，全球CDN
3. **配置环境变量** - 在Vercel中添加API密钥
4. **分享给朋友** - 任何人都可以通过链接访问！

详细部署步骤请查看：**[📖 DEPLOY.md - 完整部署指南](DEPLOY.md)**

### 本地开发 / Local Development

如需本地开发或测试：

```bash
# 克隆仓库
git clone https://github.com/wcrisdog/reading-writing.git

# 进入目录
cd reading-writing

# 在浏览器中打开 index.html
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### 作为Web服务器部署 / Deploy as Web Server

使用任何静态文件服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (需要先安装 http-server)
npx http-server

# 然后访问 http://localhost:8000
```

## 技术栈 / Tech Stack

- **前端** / Frontend: HTML5, CSS3, JavaScript (原生 / Vanilla)
- **存储** / Storage: LocalStorage API
- **响应式设计** / Responsive: CSS Grid & Flexbox
- **无依赖** / No Dependencies: 纯原生实现，无需框架

## 项目结构 / Project Structure

```
reading-writing/
├── index.html      # 主页面 / Main page
├── styles.css      # 样式文件 / Styles
├── script.js       # JavaScript 逻辑 / JavaScript logic
└── README.md       # 说明文档 / Documentation
```

## 功能详解 / Feature Details

### 写作模式 / Writing Modes

#### 800字作文 / 800-Word Essay
适合：
- 学生练习作文
- 考试作文准备
- 短篇文章创作

特点：
- 建议字数800字
- 提供写作提示
- 实时进度跟踪

#### 日记本 / Diary
适合：
- 日常生活记录
- 心情日记
- 个人反思

特点：
- 自由格式
- 建议字数300字
- 时间戳记录

#### 自由写作 / Free Writing
适合：
- 创意写作
- 随笔
- 不受限的表达

特点：
- 无字数限制
- 完全自由
- 灵感记录

### AI 助手功能 / AI Assistant Features

所有 AI 建议都是根据写作最佳实践预设的，帮助用户：
- 改善文章结构
- 提升表达质量
- 发现写作问题
- 拓展思路

## 浏览器兼容性 / Browser Compatibility

- ✅ Chrome/Edge (推荐 / Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

支持现代浏览器的所有版本 / Supports all modern browser versions

## 隐私保护 / Privacy

- 所有数据存储在本地浏览器 / All data stored locally in browser
- 不收集任何用户信息 / No user data collection
- 不需要注册账号 / No account registration required
- 可离线使用 / Can be used offline

## 贡献指南 / Contributing

欢迎贡献！请随时提交 Issue 或 Pull Request。

Welcome contributions! Feel free to submit Issues or Pull Requests.

## 开源协议 / License

MIT License

## 联系方式 / Contact

- GitHub: https://github.com/wcrisdog/reading-writing
- Issues: https://github.com/wcrisdog/reading-writing/issues

---

© 2024 入心 - 助力人们更好地完成阅读写作任务 | Helping people accomplish reading and writing tasks better
