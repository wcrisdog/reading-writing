// ✅ 使用标准 CommonJS 导出

module.exports = async (req, res) => {
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
        const API_KEY = process.env.QIANWEN_API_KEY;
        
        if (!API_KEY) {
            console.error('❌ API密钥未配置');
            return res.status(500).json({ 
                error: '服务器配置错误',
                message: 'QIANWEN_API_KEY未设置'
            });
        }

        const { messages, type, essayType } = req.body;

        console.log(`✅ 收到请求 - 类型: ${type}, 文章: ${essayType}`);

        // 调用千问API
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                messages: messages,
                max_tokens: 2000,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ 千问API错误 (${response.status}):`, errorText);
            return res.status(response.status).json({ 
                error: 'Qianwen API Error',
                status: response.status,
                details: errorText
            });
        }

        const data = await response.json();

        console.log('✅ 千问API响应成功');
        
        return res.status(200).json({
            success: true,
            message: data.output?.text || '',
            type: type,
            essayType: essayType
        });

    } catch (error) {
        console.error('❌ 服务器错误:', error.message);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
};