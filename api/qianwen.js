module.exports = async (req, res) => {
    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '方法不允许' });
    }

    // 允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { messages, type, essayType } = req.body;

        // 获取API密钥
        const API_KEY = process.env.QIANWEN_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ 
                error: '服务器配置错误：API密钥未设置',
                message: '请在Vercel环境变量中添加 QIANWEN_API_KEY'
            });
        }

        console.log(`[${new Date().toISOString()}] 调用千问API - 类型: ${type}, 文章类型: ${essayType}`);

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                messages: messages,
                max_tokens: 1500,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('千问API错误响应:', errorText);
            return res.status(response.status).json({ 
                error: '千问API调用失败',
                details: errorText
            });
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            message: data.output.text,
            type: type,
            essayType: essayType,
            usage: data.usage
        });

    } catch (error) {
        console.error('服务器错误:', error);
        return res.status(500).json({
            error: '服务器内部错误',
            message: error.message
        });
    }
};