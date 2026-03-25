// Vercel Serverless Function for AI Content Feedback

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 处理CORS预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

        // 验证必需字段
        if (!payload.userId || !payload.contentType || !payload.sentiment) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'userId, contentType, and sentiment are required'
            });
        }

        // 记录反馈数据
        const feedbackRecord = {
            timestamp: new Date().toISOString(),
            userId: payload.userId,
            username: payload.username || 'Anonymous',
            userEmail: payload.userEmail || '',
            userPhone: payload.userPhone || '',
            
            // 用户Profile信息
            userProfile: {
                nickname: payload.userProfile?.nickname || '',
                realName: payload.userProfile?.realName || '',
                gender: payload.userProfile?.gender || '',
                grade: payload.userProfile?.grade || '',
                writingStyle: payload.userProfile?.writingStyle || ''
            },

            // 文章信息
            article: {
                title: payload.articleTitle || 'Untitled',
                contentLength: (payload.articleContent || '').length,
                type: payload.articleType || 'argumentative',
                language: payload.articleLanguage || 'zh',
                level: payload.articleLevel || 'high-school'
            },

            // AI反馈信息
            feedback: {
                contentType: payload.contentType,
                contentId: payload.contentId || '',
                sentiment: payload.sentiment, // 'like' 或 'dislike'
                contentPreview: (payload.generatedContent || '').substring(0, 500)
            },

            // 用户交互数据
            interaction: {
                guidanceAnswersCount: (payload.guidanceAnswers || []).length,
                timeSpent: payload.timeSpent || 0,
                userAgent: req.headers['user-agent'] || ''
            }
        };

        // 这里可以根据需要存储反馈数据
        // 1. 存储到数据库
        // 2. 写入日志文件
        // 3. 发送到数据分析服务
        // 4. 保存到云存储等

        console.log('📊 Received AI Feedback:', JSON.stringify(feedbackRecord, null, 2));

        // 示例：存储到环境变量指定的外部服务（可选）
        if (process.env.FEEDBACK_WEBHOOK_URL) {
            try {
                await fetch(process.env.FEEDBACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedbackRecord)
                }).catch(e => console.warn('Webhook failed:', e.message));
            } catch (webhookError) {
                console.warn('Cannot send to webhook:', webhookError.message);
            }
        }

        // 返回成功响应
        return res.status(200).json({
            success: true,
            message: 'Feedback received successfully',
            feedbackId: feedbackRecord.userId + '_' + Date.now(),
            contentType: feedbackRecord.feedback.contentType,
            sentiment: feedbackRecord.feedback.sentiment
        });

    } catch (error) {
        console.error('❌ Feedback processing error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
