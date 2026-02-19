# 使用指南 / User Guide

## 快速开始 / Quick Start

### 本地运行 / Run Locally

1. 下载或克隆此仓库 / Download or clone this repository
2. 在浏览器中打开 `index.html` / Open `index.html` in your browser
3. 开始写作！/ Start writing!

### 使用Web服务器 / Using a Web Server

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# 然后访问 / Then visit: http://localhost:8000
```

## 功能说明 / Features

### 1. 选择写作模式 / Choose Writing Mode

点击顶部的模式按钮切换不同的写作模板：
Click the mode buttons at the top to switch between writing templates:

- **800字作文 / 800-Word Essay**: 适合练习作文写作 / For essay practice
- **日记本 / Diary**: 记录日常生活 / For daily journaling
- **自由写作 / Free Writing**: 无限制创作 / For unrestricted writing

### 2. 选择语言 / Select Language

在AI助手面板中选择语言：
Select your language in the AI Assistant panel:

- **中文 Chinese**: 中文界面和提示 / Chinese interface and suggestions
- **English**: 英文界面和提示 / English interface and suggestions

### 3. 使用AI助手 / Use AI Assistant

AI助手提供四种类型的帮助：
The AI Assistant provides four types of help:

#### 💡 获取写作建议 / Get Writing Suggestions
- 提供写作技巧和方法 / Provides writing tips and techniques
- 帮助改善文章结构 / Helps improve article structure

#### ✨ 改进文本 / Improve Text
- 优化表达方式 / Optimizes expression
- 提升文章质量 / Enhances article quality

#### ✓ 语法检查 / Grammar Check
- 检查语法错误 / Checks grammar errors
- 标点符号建议 / Punctuation suggestions

#### 🎯 扩展思路 / Expand Ideas
- 拓展写作思路 / Expands writing ideas
- 丰富文章内容 / Enriches content

### 4. 实时统计 / Real-time Statistics

右侧统计面板显示：
The statistics panel on the right shows:

- **字符数 / Characters**: 总字符数 / Total character count
- **字数 / Words**: 
  - 中文模式：汉字数量 / Chinese mode: Chinese character count
  - 英文模式：单词数量 / English mode: Word count
- **段落 / Paragraphs**: 段落数量 / Paragraph count

### 5. 保存和导出 / Save and Export

#### 自动保存 / Auto-save
- 默认开启，每2秒自动保存 / Enabled by default, saves every 2 seconds
- 内容保存在浏览器本地 / Content saved in browser locally
- 点击底部按钮可以开启/关闭 / Click bottom button to toggle

#### 手动保存 / Manual Save
- 点击 💾 按钮立即保存 / Click 💾 button to save immediately
- 保存历史记录（最多10篇）/ Saves history (up to 10 entries)

#### 导出文件 / Export File
- 点击 📥 按钮导出为.txt文件 / Click 📥 button to export as .txt file
- 文件名为标题 / Filename is the title

#### 清空内容 / Clear Content
- 点击 🗑️ 按钮清空所有内容 / Click 🗑️ button to clear all content
- 会要求确认以防误操作 / Asks for confirmation to prevent accidents

## 快捷键 / Keyboard Shortcuts

目前平台使用标准的文本编辑快捷键：
The platform uses standard text editing shortcuts:

- `Ctrl/Cmd + A`: 全选 / Select all
- `Ctrl/Cmd + C`: 复制 / Copy
- `Ctrl/Cmd + V`: 粘贴 / Paste
- `Ctrl/Cmd + Z`: 撤销 / Undo
- `Ctrl/Cmd + Shift + Z`: 重做 / Redo

## 隐私和数据 / Privacy and Data

### 数据存储 / Data Storage
- 所有数据存储在浏览器的LocalStorage中 / All data stored in browser's LocalStorage
- 不会上传到任何服务器 / Not uploaded to any server
- 只有你可以访问 / Only you can access it

### 清除数据 / Clear Data
如果需要清除所有保存的数据：
To clear all saved data:

1. 打开浏览器开发者工具 / Open browser developer tools (F12)
2. 进入 Application/Storage 标签 / Go to Application/Storage tab
3. 清除 LocalStorage / Clear LocalStorage

或者在控制台运行：/ Or run in console:
```javascript
localStorage.clear();
```

## 常见问题 / FAQ

### Q: 我的内容会丢失吗？ / Will my content be lost?
A: 只要开启自动保存，内容会定期保存到浏览器本地。但建议重要内容及时导出备份。
   As long as auto-save is enabled, content is saved locally. But it's recommended to export important content.

### Q: 可以离线使用吗？ / Can I use it offline?
A: 可以！所有功能都是本地运行，不需要网络连接。
   Yes! All features run locally, no internet connection required.

### Q: AI建议是真的AI生成的吗？ / Are AI suggestions real AI?
A: 当前版本的AI建议是预设的写作技巧和建议。未来版本可能会集成真实的AI服务。
   Current AI suggestions are pre-written tips. Future versions may integrate real AI services.

### Q: 支持哪些浏览器？ / Which browsers are supported?
A: 支持所有现代浏览器：Chrome, Firefox, Safari, Edge等。
   Supports all modern browsers: Chrome, Firefox, Safari, Edge, etc.

### Q: 可以自定义AI建议吗？ / Can I customize AI suggestions?
A: 可以！打开 `script.js` 文件，找到 `aiSuggestions` 对象，添加你自己的建议。
   Yes! Open `script.js`, find the `aiSuggestions` object, and add your own suggestions.

### Q: 如何添加新的写作模板？ / How to add new writing templates?
A: 在 `script.js` 中的 `templates` 对象中添加新模板配置即可。
   Add new template configuration in the `templates` object in `script.js`.

## 技术支持 / Technical Support

如有问题或建议，请访问：
For questions or suggestions, please visit:

- GitHub Issues: https://github.com/wcrisdog/reading-writing/issues
- GitHub Repo: https://github.com/wcrisdog/reading-writing

## 贡献 / Contributing

欢迎贡献代码、报告问题或提出建议！
Contributions, bug reports, and feature requests are welcome!

请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多信息。
See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

---

享受写作的乐趣！/ Enjoy writing!
