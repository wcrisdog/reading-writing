# 入心 - 智能阅读写作平台 / AI-Powered Reading & Writing Platform

入心旨在通过不同的在线撰写平台，配以辅助阅读写作功能，助力人们重拾阅读写作习惯

## 功能特性 / Features

### 📝 多种写作模板 / Multiple Writing Templates
- **800字作文模式** - 适合练习写作文，目标字数800字
- **日记本模式** - 记录日常生活和心情
- **自由写作模式** - 无拘无束的自由创作

### 🤖 AI 智能助手 / AI Writing Assistant
- **写作建议** - 获取针对性的写作指导
- **文本改进** - 智能优化文章质量
- **语法检查** - 检查语法和拼写错误
- **思路扩展** - 帮助发散思维，丰富内容

### 🌐 双语支持 / Bilingual Support
- 完整支持中文和英文界面
- 针对不同语言提供定制化建议
- 智能字数统计（中文按字符，英文按单词）

### 💾 智能存储 / Smart Storage
- 自动保存功能，防止内容丢失
- 本地存储，保护隐私
- 一键导出为文本文件
- 保存历史记录（最近10篇）

### 📊 实时统计 / Real-time Statistics
- 字符数统计
- 字数统计
- 段落数统计
- 写作进度跟踪

## 使用方法 / How to Use

### 在线使用 / Online Usage
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
