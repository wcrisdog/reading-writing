// Vercel Serverless Function - 通义千问API代理
// 用于处理前端的AI请求，避免暴露API密钥

export default async function handler(req, res) {
    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 从环境变量获取API密钥（在Vercel中配置）
    const API_KEY = process.env.QIANWEN_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ 
            error: '服务器配置错误：未设置API密钥',
            message: '请在Vercel环境变量中添加 QIANWEN_API_KEY'
        });
    }

    const { messages, type, essayType } = req.body;

    try {
        // 调用通义千问API
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'qwen-turbo', // 使用qwen-turbo模型（免费额度较多）
                input: {
                    messages: messages
                },
                parameters: {
                    result_format: 'message',
                    temperature: 0.7, // 创意程度
                    top_p: 0.8,
                    max_tokens: 1500,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('通义千问API错误:', errorData);
            return res.status(response.status).json({
                error: '调用AI服务失败',
                details: errorData
            });
        }

        const data = await response.json();
        
        // 提取AI回复内容
        const aiMessage = data.output?.choices?.[0]?.message?.content || data.output?.text || '抱歉，无法生成回复';

        // 返回结果
        return res.status(200).json({
            success: true,
            message: aiMessage,
            type: type,
            essayType: essayType,
            usage: data.usage // 返回token使用情况
        });

    } catch (error) {
        console.error('处理请求时出错:', error);
        return res.status(500).json({
            error: '服务器内部错误',
            message: error.message
        });
    }
}
