# 🚀 部署指南 - 智引文思平台

本文档将指导你如何完成以下步骤：
1. 申请阿里云通义千问API密钥（免费）
2. 部署到Vercel（免费）
3. 让全世界的人都能访问你的平台

---

## 第一步：申请通义千问API密钥

### 1.1 注册阿里云账号

访问：[https://www.aliyun.com](https://www.aliyun.com)

- 如果已有阿里云账号，直接登录
- 如果没有，点击注册（需要手机号验证）

### 1.2 开通DashScope服务

1. 访问 [DashScope控制台](https://dashscope.console.aliyun.com/)
2. 首次访问会提示开通服务，点击**立即开通**
3. 阅读并同意服务协议

### 1.3 获取API密钥

1. 在DashScope控制台，点击左侧的 **API-KEY管理**
2. 点击**创建新的API-KEY**
3. 复制生成的API Key（格式类似：`sk-xxxxxxxxxxxxxxxx`）
4. ⚠️ **重要**：妥善保管这个密钥，不要泄露给他人

### 1.4 查看免费额度

- 新用户通常赠送 **100万tokens** 的免费额度
- 在控制台可以查看剩余额度
- 对于你的写作平台，这个额度足够使用很长时间

---

## 第二步：部署到Vercel

### 2.1 准备工作

确保你的项目已经推送到GitHub：

```bash
cd /Users/wangchengrui11/Desktop/卓越杯/reading-writing
git add -A
git commit -m "feat: 集成通义千问AI"
git push origin main
```

### 2.2 注册Vercel账号

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 **Sign Up**
3. **推荐**：使用GitHub账号登录（会自动关联你的仓库）

### 2.3 导入项目

1. 登录后，点击 **Add New** → **Project**
2. 选择你的 `reading-writing` 仓库
3. 点击 **Import**

### 2.4 配置环境变量 ⭐关键步骤

在部署之前，需要配置API密钥：

1. 在项目配置页面，找到 **Environment Variables** 部分
2. 添加以下变量：
   - **Name**: `QIANWEN_API_KEY`
   - **Value**: `你在第一步获取的API密钥`
3. 点击 **Add**

### 2.5 开始部署

1. 确认配置无误后，点击 **Deploy**
2. 等待1-2分钟，Vercel会自动构建和部署
3. 部署成功后，你会看到一个类似这样的域名：
   ```
   https://reading-writing-xxxx.vercel.app
   ```

### 2.6 测试部署

1. 点击刚才生成的域名
2. 测试各项功能：
   - 点击"启动引导" - 应该会收到AI的真实回复
   - 点击"素材推荐" - 应该会生成个性化素材
   - 点击"灵感提示" - 应该会获得AI写作建议
   - 点击"逻辑修补" - 应该会收到AI的引导性问题

---

## 第三步：自定义域名（可选）

如果你想使用自己的域名（如 `writing.yourdomain.com`）：

### 3.1 在Vercel添加域名

1. 进入项目的 **Settings**
2. 点击 **Domains**
3. 输入你的自定义域名
4. Vercel会提供DNS配置信息

### 3.2 配置DNS

1. 登录你的域名服务商（如阿里云、腾讯云）
2. 添加Vercel提供的CNAME记录
3. 等待DNS生效（通常几分钟到几小时）

---

## 第四步：分享给其他人

部署完成后，你可以通过以下方式分享：

### 直接分享链接

```
https://reading-writing-xxxx.vercel.app
```

任何人都可以通过这个链接访问你的平台！

### 生成二维码

使用在线工具（如 [QRCode Generator](https://www.qrcode-generator.de/)）生成二维码，方便移动端访问。

### 嵌入到其他网站

可以使用iframe嵌入：

```html
<iframe src="https://reading-writing-xxxx.vercel.app" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

---

## 常见问题 Q&A

### Q1: API密钥会被别人看到吗？

**答**：不会。API密钥保存在Vercel的环境变量中，只有服务器端能访问，前端代码和用户都无法看到。

### Q2: 免费额度用完了怎么办？

**答**：
1. 可以充值继续使用（价格很便宜）
2. 可以换一个阿里云账号重新申请
3. 可以切换到其他免费的AI服务

### Q3: 部署后发现有bug怎么办？

**答**：
1. 在本地修复代码
2. 推送到GitHub
3. Vercel会自动检测并重新部署

### Q4: 能看到有多少人在使用吗？

**答**：可以！Vercel提供免费的访问统计，在项目的 **Analytics** 标签页查看。

### Q5: 如何更新平台功能？

**答**：
```bash
# 1. 修改代码
# 2. 提交到GitHub
git add -A
git commit -m "更新功能描述"
git push origin main

# 3. Vercel自动部署（30秒内完成）
```

---

## 进阶配置

### 启用国内CDN加速

Vercel在中国访问可能较慢，可以考虑：

1. **Cloudflare** - 添加CDN加速
2. **阿里云CDN** - 使用国内CDN服务
3. **备用部署** - 同时部署到Netlify或Render

### 监控和日志

1. 在Vercel的 **Logs** 标签查看API调用日志
2. 在阿里云DashScope控制台查看token使用情况
3. 设置额度告警（避免意外超支）

### 安全加固

1. **设置访问频率限制** - 防止滥用
2. **添加用户认证** - 如果需要限制访问
3. **定期更换API密钥** - 提高安全性

---

## 成本估算

### 完全免费的组合

- ✅ **Vercel托管** - 免费
- ✅ **通义千问** - 100万tokens免费额度
- ✅ **GitHub仓库** - 免费
- ✅ **域名解析** - 可选（域名本身需要购买）

### 估算使用量

假设每次AI调用使用500 tokens：
- 100万tokens ÷ 500 = 2000次调用
- 如果每个用户平均使用10次AI功能 = 支持200个用户

**结论**：免费额度足够初期使用！

---

## 下一步

✅ 已完成部署  
✅ 平台正常运行  
✅ 其他人可以访问

### 推广建议

1. 在学校/班级群分享链接
2. 制作使用教程短视频
3. 收集用户反馈，持续改进
4. 考虑添加更多AI功能

---

## 技术支持

遇到问题？

1. 查看Vercel的Logs了解具体错误
2. 检查阿里云DashScope控制台的API调用状态
3. 参考本项目的 `PROJECT_SUMMARY.md` 了解技术细节

---

**祝部署顺利！🎉**

如有问题，欢迎在GitHub Issues中提问。
