# API 设置指南

## 🎉 好消息：无需 Vercel！

现在平台已改为**直接调用**阿里云通义千问API，无需任何后端服务器！

## 📋 快速设置步骤

### 1. 获取 API Key

1. 访问阿里云百炼平台：https://dashscope.aliyuncs.com/
2. 登录/注册账号
3. 点击左侧菜单"API-KEY"
4. 复制你的 API Key（格式类似：`sk-xxxxxxxxxxxxxx`）

### 2. 首次访问平台时

当你第一次打开 https://www.writefduvke.cn/ 时：

1. 会自动弹出一个输入框
2. 粘贴你的 API Key
3. 点击"确定"

**就这么简单！** 🎊

### 3. API Key 存储说明

- 你的 API Key 会安全地存储在浏览器的 localStorage 中
- **仅在你的浏览器**本地保存，不会上传到任何服务器
- 下次访问时会自动使用，无需重复输入

### 4. 管理 API Key

如果需要更换或删除 API Key，打开浏览器控制台（F12）输入：

```javascript
// 查看当前 API Key
config.getApiKey()

// 设置新的 API Key
config.setApiKey('sk-your-new-api-key')

// 清除 API Key（下次访问会要求重新输入）
config.clearApiKey()

// 手动触发设置提示
config.showSetupPrompt()
```

## ⚠️ 安全提示

**重要：** 
- 不要在公共电脑上保存你的 API Key
- 不要将 API Key 分享给他人
- 如果 API Key 泄露，请立即在阿里云后台重新生成

## 🚀 优势对比

### ✅ 新方案（直接调用）
- 无需部署后端服务器
- 无需配置 Vercel 环境变量
- 设置简单，一次配置永久使用
- 完全由 GitHub Pages 托管

### ❌ 旧方案（Vercel）
- 需要注册 Vercel 账号（手机验证）
- 需要配置环境变量
- 可能遇到 404、CORS 等各种错误
- 部署复杂

## 📊 API 配额说明

阿里云通义千问新用户免费赠送：
- **100万 tokens** 免费额度
- 足够写数百篇文章

配额用完后需要充值，价格参考：https://dashscope.aliyuncs.com/pricing

## 🔧 故障排查

### 问题1：弹窗没有出现
**解决：** 打开浏览器控制台（F12）手动输入：
```javascript
config.showSetupPrompt()
```

### 问题2：输入 API Key 后仍报错
**检查：**
1. API Key 格式是否正确（应以 `sk-` 开头）
2. 在阿里云后台确认 API Key 状态是否"启用"
3. 打开控制台查看具体错误信息

### 问题3：调用 AI 功能无反应
**解决：**
1. 打开控制台（F12）查看错误日志
2. 确认网络连接正常
3. 尝试刷新页面重新设置 API Key

## 💡 技术说明

### 为什么现在可以直接调用？

阿里云 DashScope API 支持跨域（CORS）请求，所以前端可以直接调用，无需后端代理。

### 架构对比

**之前：**
```
浏览器 → GitHub Pages → Vercel API → 阿里云 API
```

**现在：**
```
浏览器 → GitHub Pages ⇢ 阿里云 API（直接）
```

更简单，更快速！✨

## 📞 需要帮助？

如果遇到任何问题，可以：
1. 查看浏览器控制台（F12）的错误信息
2. 检查 API Key 是否正确配置
3. 确认阿里云账号配额是否充足
