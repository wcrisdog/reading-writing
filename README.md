# 智引文思 - 智能写作平台 / AI-Powered Writing Platform

智引文思是一个智能写作助手平台，为不同学历阶段的学生提供针对性的写作支持，帮助他们提升写作能力。

## 核心功能 / Features

### 📝 三种专业写作类型 / Three Writing Types
- **议论文** (高中) - 观点鲜明、论证有力的论说文，支持多种论证方式
- **记叙文** (高中) - 人物生动、细节丰富的叙事文，强调场景和情感描写
- **学术论文** (大学/研究生) - 严谨规范、逻辑深刻的学术作品，包含完整的学术框架

### 🚀 启动引导 / Launch Guidance
- **AI反向提问** - 通过精心设计的问题了解你的写作需求
- **自动大纲生成** - 根据你的回答自动为你生成符合该类型的写作大纲
- **选项式指引** - 每个问题都有多个选项供你快速选择

### 📚 素材推荐 / Material Recommendation
根据选择的文章类型推荐相关素材，帮助丰富写作储备：
- **议论文** - 名言警句、历史事例、科学事实、社会现象
- **记叙文** - 场景描写、人物刻画、心理描写、细节描写
- **学术论文** - 理论框架、研究方法、数据来源、写作标准

### 💡 灵感提示 / Inspiration Tips
在写作过程中智能检测：
- **卡顿时提示** - 检测到写作停滞时自动提供建议和素材补充
- **进度反馈** - 根据完成进度提供不同的修改建议
- **实时激励** - 帮助你突破创作瓶颈，保持写作动力

### 🔍 逻辑修补 / Logic Repair
不是直接代写，而是通过提问引导你发现问题：
- **循序渐进的问题** - 引导你逐步反思文章的逻辑、论证、结构
- **自我完善** - 通过回答问题发现漏洞，自身改正不足
- **深层思考** - 帮你理解写作中的逻辑关系和改进点

### 🌐 双语支持 / Bilingual Support
- 完整的中英文界面切换
- 针对不同语言的智能识别和处理
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

## 使用方法 / How to Use

### 在线使用 / Online Usage

本项目已通过 GitHub Pages 自动部署，可直接访问：

**🌐 在线访问地址 / Live URL:** https://wcrisdog.github.io/reading-writing/

> 每次推送到 `main` 分支时，网站会自动更新部署。
> The site is automatically redeployed on every push to the `main` branch.

如需手动启用 GitHub Pages / To manually enable GitHub Pages:
1. 进入仓库 **Settings → Pages** / Go to repo **Settings → Pages**
2. Source 选择 **GitHub Actions**
3. 保存后等待 Actions 完成部署 / Save and wait for the Actions workflow to finish

1. 打开 `index.html` 文件在浏览器中
2. 选择写作模式（800字作文、日记本或自由写作）
3. 选择语言（中文或英文）
4. 开始写作！

### 本地部署 / Local Deployment

只需要一个现代浏览器即可运行，无需安装任何依赖：

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
