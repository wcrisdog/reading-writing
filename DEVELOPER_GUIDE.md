# 开发端 API 部署指南

## 🎯 新方案说明

现在API密钥由**开发端**统一管理，用户无需配置任何API密钥，可直接使用所有AI功能。

## 📋 部署步骤

### 方式一：使用 Vercel（推荐）

#### 1. 准备 API 密钥

1. 访问阿里云百炼：https://dashscope.aliyuncs.com/
2. 登录并获取你的 API Key（格式：`sk-xxxxxx`）

#### 2. 修改后端代码

在 `api/qianwen.js` 第23行，将 `YOUR_API_KEY_HERE` 替换为你的实际API密钥：

```javascript
const API_KEY = process.env.QIANWEN_API_KEY || 'sk-your-actual-api-key-here';
```

**⚠️ 安全提示：**
- 如果不希望在代码中硬编码API密钥，请使用Vercel环境变量（见下方步骤3）
- 确保 `.env` 文件已在 `.gitignore` 中，不要提交到Git

#### 3. 部署到 Vercel

**方法A：通过命令行**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel（如能登录）
vercel login

# 部署
vercel

# 添加环境变量
vercel env add QIANWEN_API_KEY
# 粘贴你的API密钥
# 选择：Production, Preview, Development (全选)

# 重新部署
vercel --prod
```

**方法B：通过GitHub（如Vercel账号有问题）**

1. 将代码推送到GitHub
2. 访问 https://vercel.com/
3. 选择 "Import Project"
4. 连接GitHub仓库
5. 在 Settings → Environment Variables 添加：
   - 名称：`QIANWEN_API_KEY`
   - 值：你的API密钥（sk-xxx）
   - 选择所有环境（Production, Preview, Development）
6. 点击 Deploy

#### 4. 配置前端

部署成功后，Vercel会提供一个URL（如 `https://your-project.vercel.app`）

**如果前端也部署在Vercel：** 无需额外配置，相对路径 `/api/qianwen` 会自动工作

**如果前端部署在GitHub Pages：** 需要修改 `ai-service.js` 第10行：

```javascript
this.apiEndpoint = 'https://your-project.vercel.app/api/qianwen';
```

### 方式二：使用其他平台

如果Vercel无法使用，可选择以下替代方案：

#### Railway（https://railway.app/）

```bash
# 安装CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加环境变量
railway variables set QIANWEN_API_KEY=sk-your-key

# 部署
railway up
```

#### Render（https://render.com/）

1. 注册账号（支持GitHub登录）
2. New → Web Service
3. 连接GitHub仓库
4. Build Command: `npm install`
5. Start Command: `node api/qianwen.js`（需创建服务器文件）
6. 添加环境变量 `QIANWEN_API_KEY`

#### Cloudflare Workers（完全免费）

创建 `wrangler.toml`：

```toml
name = "reading-writing-api"
main = "api/qianwen.js"
compatibility_date = "2023-01-01"

[vars]
QIANWEN_API_KEY = "" # 在Cloudflare Dashboard中设置
```

部署：

```bash
npm install -g wrangler
wrangler login
wrangler publish
```

## 🧪 测试 API

### 1. 本地测试

创建 `test-api.js`：

```javascript
const handler = require('./api/qianwen.js').default;

const mockReq = {
    method: 'POST',
    body: {
        messages: [
            { role: 'user', content: '你好' }
        ],
        type: 'test',
        essayType: 'argumentative'
    }
};

const mockRes = {
    status: (code) => ({
        json: (data) => console.log('Status:', code, 'Data:', data),
        end: () => console.log('Request ended')
    }),
    setHeader: (key, value) => console.log(`Header set: ${key} = ${value}`)
};

handler(mockReq, mockRes);
```

运行：
```bash
node test-api.js
```

### 2. 线上测试

使用curl测试Vercel API：

```bash
curl -X POST https://your-project.vercel.app/api/qianwen \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "测试"}],
    "type": "test",
    "essayType": "argumentative"
  }'
```

预期返回：

```json
{
  "success": true,
  "message": "AI的回复内容...",
  "type": "test",
  "essayType": "argumentative",
  "usage": {...}
}
```

### 3. 浏览器测试

打开浏览器控制台（F12），输入：

```javascript
fetch('https://your-project.vercel.app/api/qianwen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }],
        type: 'test',
        essayType: 'argumentative'
    })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

## 🔍 故障排查

### 问题1：404 NOT_FOUND

**原因：** API文件路径不正确或未部署

**解决：**
1. 确认 `api/qianwen.js` 文件存在
2. 确认 `vercel.json` 配置正确
3. 重新部署：`vercel --prod`

### 问题2：500 API密钥错误

**原因：** API密钥未设置或不正确

**解决：**
1. 检查Vercel环境变量是否正确设置
2. 或在代码中硬编码密钥进行测试
3. 确认密钥格式正确（以 `sk-` 开头）

### 问题3：CORS  错误

**原因：** 跨域请求被阻止

**解决：**
`api/qianwen.js` 已包含CORS头：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```
确保这行代码存在。

### 问题4：前端调用失败

**步骤：**
1. 打开网站F12控制台
2. 查看Network选项卡
3. 找到 `/api/qianwen` 请求
4. 查看请求和响应详情
5. 根据错误信息诊断

## 📊 API 配额监控

阿里云千问新用户免费额度：**100万 tokens**

### 查看使用情况

1. 登录 https://dashscope.aliyuncs.com/
2. 点击 "资源用量"
3. 查看剩余配额

### 优化建议

- 每次调用AI时，后端会返回 `usage` 字段，包含本次token消耗
- 可在前端添加累计统计
- 建议限制单次请求的 `max_tokens` 参数（已设为1500）

## ✅ 完成检查清单

- [ ] 获取阿里云API密钥
- [ ] 修改 `api/qianwen.js` 或设置Vercel环境变量
- [ ] 部署到Vercel或其他平台
- [ ] 测试API接口（curl或浏览器）
- [ ] 访问前端网站测试AI功能
- [ ] 检查所有4个AI功能：启动引导、素材推荐、灵感提示、逻辑修补

## 🎉 部署成功标志

当你访问 https://www.writefduvke.cn/ 并：

1. ✅ 点击"启动引导"能生成详细大纲
2. ✅ 点击"素材推荐"能获取AI推荐的素材
3. ✅ 点击"灵感提示"能获得AI的写作建议
4. ✅ 完成文章后"逻辑修补"能提出改进问题
5. ✅ 字数统计显示进度、时长、速度等信息

恭喜！你的AI写作平台已完全部署成功！🎊
