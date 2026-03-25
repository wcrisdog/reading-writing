// Vercel Serverless Function for Qianwen API

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
        const API_KEY = process.env.QIANWEN_API_KEY;
        
        if (!API_KEY) {
            console.error('❌ API密钥未配置');
            return res.status(500).json({ 
                error: '服务器配置错误',
                message: 'QIANWEN_API_KEY未设置'
            });
        }

        const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const { messages, type, essayType } = payload;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid Request',
                message: 'messages 必须是非空数组'
            });
        }

        console.log(`✅ 收到请求 - 类型: ${type}, 文章: ${essayType}`);

        const maxTokensByType = {
            'detailed-outline': 1300,
            'detailed-materials': 1000,
            'guidance': 1000,
            'guidance-feedback': 800,
            'contextual-inspiration': 450,
            'inspiration': 300,
            'materials': 800,
            'logic-feedback': 800
        };

        const chosenMaxTokens = maxTokensByType[type] || 900;

        const createRequestBody = (model, maxTokens) => ({
            model,
            messages,
            max_tokens: maxTokens,
            temperature: 0.7,
            stream: false
        });

        const callQianwen = async (body, timeoutMs = 16000) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort('Upstream timeout'), timeoutMs);

            try {
                return await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timer);
            }
        };

        let response;
        let data;
        let lastErrorStatus = 0;

        const isMaterialsType = type === 'materials' || type === 'detailed-materials';
        const attempts = isMaterialsType
            ? [
                { model: 'qwen-turbo', maxTokens: Math.max(450, Math.floor(chosenMaxTokens * 0.8)), timeoutMs: 14000 },
                { model: 'qwen-plus', maxTokens: Math.max(400, Math.floor(chosenMaxTokens * 0.65)), timeoutMs: 12000 }
            ]
            : [
                { model: 'qwen-plus', maxTokens: chosenMaxTokens, timeoutMs: 16000 },
                { model: 'qwen-turbo', maxTokens: Math.max(400, Math.floor(chosenMaxTokens * 0.7)), timeoutMs: 12000 }
            ];

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            try {
                response = await callQianwen(
                    createRequestBody(attempt.model, attempt.maxTokens),
                    attempt.timeoutMs
                );

                if (!response.ok) {
                    lastErrorStatus = response.status;
                    const errorText = await response.text();
                    const isRetriable = response.status === 502 || response.status === 503 || response.status === 504 || response.status === 429;
                    console.error(`❌ 千问API错误 (${response.status}) [尝试 ${i + 1}/${attempts.length}]:`, errorText);

                    if (isRetriable && i < attempts.length - 1) {
                        continue;
                    }

                    return res.status(response.status).json({
                        error: 'Qianwen API Error',
                        status: response.status,
                        details: errorText
                    });
                }

                data = await response.json();
                break;
            } catch (error) {
                const isAbort = error?.name === 'AbortError' || String(error?.message || '').includes('timeout');
                console.error(`❌ 千问API请求异常 [尝试 ${i + 1}/${attempts.length}]:`, error.message);

                if (i >= attempts.length - 1) {
                    return res.status(504).json({
                        error: 'Upstream Timeout',
                        message: isAbort ? '上游模型响应超时，请稍后重试' : error.message
                    });
                }
            }
        }

        if (!data) {
            return res.status(lastErrorStatus || 504).json({
                error: 'Qianwen API Error',
                status: lastErrorStatus || 504,
                message: '上游服务暂时不可用，请稍后重试'
            });
        }

        const message = data?.choices?.[0]?.message?.content || '';

        console.log('✅ 千问API响应成功');
        
        return res.status(200).json({
            success: true,
            message,
            type: type,
            essayType: essayType,
            usage: data?.usage || null
        });

    } catch (error) {
        console.error('❌ 服务器错误:', error.message);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
}