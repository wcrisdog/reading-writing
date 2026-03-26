# 📊 数据库集成指南

## 🚀 快速开始

### 1. MongoDB Atlas 设置

#### 创建数据库
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. 注册或登录账户
3. 创建新项目，选择免费集群（M0）
4. 配置安全（允许所有IP：`0.0.0.0/0`）

#### 获取连接字符串
1. 点击 "Connect"
2. 选择 "Drivers" 方式
3. 复制连接字符串：`mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### 2. Vercel 环境变量配置

#### 本地开发
创建 `.env.local` 文件：
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reading_writing?retryWrites=true&w=majority
```

#### Vercel 部署
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → Settings → Environment Variables
3. 添加 `MONGODB_URI` 变量
4. 部署即可

### 3. 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# Vercel 开发模式会在 http://localhost:3000
```

## 📈 查看数据

### 方案1：仪表板（推荐）
访问 `https://your-domain/dashboard.html`

功能：
- 📊 实时统计（总反馈、点赞率等）
- 📝 内容类型分布图表
- 👥 用户反馈排行
- 📋 反馈详情表（分页）

### 方案2：API 查询

#### 获取统计信息
```bash
GET /api/query-feedback?action=user-stats
```

响应：
```json
{
  "success": true,
  "data": {
    "total": 100,
    "likes": 75,
    "dislikes": 25,
    "likeRatio": 0.75
  }
}
```

#### 获取用户反馈
```bash
GET /api/query-feedback?action=user-feedbacks&userId=user123
```

#### 获取所有反馈（分页）
```bash
GET /api/query-feedback?action=all-feedbacks&page=1&limit=20
```

#### 内容类型分布
```bash
GET /api/query-feedback?action=content-distribution
```

#### 用户分布
```bash
GET /api/query-feedback?action=user-distribution
```

### 方案3：MongoDB 后台

1. 在 MongoDB Atlas 登录
2. 选择 Clusters → Collections
3. 查看 `reading_writing.feedbacks` 集合
4. 可以直接查看、编辑、删除数据

## 📁 文件结构

```
api/
├── db-service.js       # 数据库操作函数
├── feedback.js         # 反馈提交 API（已修改）
└── query-feedback.js   # 数据查询 API（新建）

public/
└── dashboard.html      # 数据仪表板（新建）
```

## 🔍 数据结构

### Feedbacks 集合

```javascript
{
  _id: ObjectId,
  timestamp: "2024-03-25T10:00:00Z",
  userId: "user-id",
  username: "username",
  userEmail: "user@example.com",
  userPhone: "13800138000",
  
  userProfile: {
    nickname: "昵称",
    realName: "真实名字",
    gender: "male",
    grade: "high-school",
    writingStyle: "formal"
  },
  
  article: {
    title: "文章标题",
    contentLength: 1500,
    type: "argumentative",
    language: "zh",
    level: "high-school"
  },
  
  feedback: {
    contentType: "outline|materials|inspiration|optimization",
    contentId: "outline_1234567890_xyz",
    sentiment: "like|dislike",
    contentPreview: "AI生成内容的前500个字符"
  },
  
  interaction: {
    guidanceAnswersCount: 5,
    timeSpent: 120000,  // 毫秒
    userAgent: "Mozilla/5.0..."
  },
  
  createdAt: ISODate,
  updated: false
}
```

## ⚙️ 常见问题

### Q: 如何导出数据？
```bash
# MongoDB Atlas 中点击 "..." → Export Collection
# 或使用 mongoexport 命令
mongoexport --uri "mongodb+srv://..." --collection feedbacks --out feedbacks.json
```

### Q: 如何备份数据？
在 MongoDB Atlas 中：
1. Backups → Backup Now
2. 设置自动备份（Free M0 不支持，需要付费）

### Q: 本地开发时如何测试数据库？
```javascript
// 在 feedback.js 中添加测试数据
import { saveFeedback } from './db-service.js';

const testFeedback = {
  userId: 'test-user-1',
  username: 'testuser',
  contentType: 'outline',
  sentiment: 'like',
  // ... 其他字段
};

const result = await saveFeedback(testFeedback);
console.log('Test feedback saved:', result);
```

### Q: 如何查询特定日期范围的数据？
需要在 `db-service.js` 中添加新函数：
```javascript
export async function getFeedbacksByDateRange(startDate, endDate) {
    const { db } = await connectToDatabase();
    const collection = db.collection('feedbacks');
    
    return collection.find({
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();
}
```

## 🛠️ 故障排除

### 连接失败
- ✅ 检查 `MONGODB_URI` 是否正确
- ✅ 确保 MongoDB Atlas IP 白名单包含 Vercel IP
- ✅ 检查网络连接

### 数据没有保存
- ✅ 查看 Vercel 日志找错误信息
- ✅ 确认反馈 API 返回 `"success": true`
- ✅ MongoDB 是否有权限问题

### 仪表板加载不了
- ✅ 检查浏览器控制台错误
- ✅ 验证 `/api/query-feedback` 是否可访问
- ✅ 确认 CORS 已正确配置

## 📞 支持

有问题？查看：
1. MongoDB 官方文档：https://docs.mongodb.com/
2. Vercel 文档：https://vercel.com/docs
3. 项目 Issue tracker

---

**部署完成后，访问 `/dashboard.html` 开始查看数据！** 🎉
