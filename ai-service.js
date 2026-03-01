// AI服务模块 - 处理所有与AI相关的API调用
// 注意：API Key由开发端在后端管理，用户无需配置

class AIService {
    constructor() {
        // 默认使用同源 API，确保 Vercel 部署时无需硬编码域名
        // 如需跨域（例如前端托管在 GitHub Pages），可在页面注入 window.__AI_API_BASE_URL
        const customBaseUrl = (window.__AI_API_BASE_URL || '').trim().replace(/\/$/, '');
        this.apiEndpoint = customBaseUrl
            ? `${customBaseUrl}/api/qianwen`
            : '/api/qianwen';
        
        console.log('✨ AI服务已初始化，API密钥由后端管理');
    }

    /**
     * 调用后端AI API
     * @param {Array} messages - 对话消息数组
     * @param {string} type - 请求类型
     * @param {string} essayType - 文章类型
     */
    async callAI(messages, type, essayType) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    type,
                    essayType
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || error.message || `API错误: ${response.status}`);
            }

            const data = await response.json();
            
            // 返回统一格式
            return {
                success: data.success,
                message: data.message,
                usage: data.usage
            };

        } catch (error) {
            console.error('AI服务调用错误:', error);
            throw error;
        }
    }

    /**
     * 生成启动引导的问题回应
     */
    async generateGuidanceResponse(essayType, language, userAnswers) {
        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;
        
        const systemPrompt = language === 'zh' 
            ? `你是一位资深的写作指导专家，擅长帮助学生构建清晰的写作框架。
你的任务是：根据用户对于${essayTypeName}的回答，生成一份详细、实用、有指导性的写作大纲。

要求：
1. 大纲要分成4-6个主要部分，每部分标明标题和要点
2. 每个部分要提供2-3个具体的写作建议或提示
3. 要考虑用户的回答，使大纲个性化
4. 语言要清晰易懂，可操作性强
5. 适当添加emoji使大纲更生动

输出格式示例：
📝 一、引言部分
   - 要点1：...
   - 要点2：...
   建议：...

📝 二、主体部分（第一论点）
   - 要点1：...
   - 要点2：...
   建议：...
   
请按此格式生成完整大纲。`
            : `You are an experienced writing instructor who excels at helping students build clear writing frameworks.

Your task: Based on the user's answers about their ${essayTypeName}, generate a detailed, practical, and instructive writing outline.

Requirements:
1. Divide the outline into 4-6 main sections with clear titles and key points
2. Provide 2-3 specific writing suggestions for each section
3. Personalize the outline based on user's answers
4. Use clear, actionable language
5. Add appropriate emojis to make it engaging

Output format example:
📝 I. Introduction
   - Point 1: ...
   - Point 2: ...
   Suggestion: ...

📝 II. Body (First Argument)
   - Point 1: ...
   - Point 2: ...
   Suggestion: ...

Please generate a complete outline in this format.`;

        const answersText = userAnswers.map(a => `${a.question} → ${a.answer}`).join('\n');
        
        const userPrompt = language === 'zh'
            ? `用户的背景信息：\n${answersText}\n\n请根据以上信息，为用户生成一份详细的${essayTypeName}写作大纲。`
            : `User's background:\n${answersText}\n\nBased on the above information, generate a detailed ${essayTypeName} outline for the user.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.callAI(messages, 'guidance', essayType);
    }

    /**
     * 生成素材推荐
     */
    async generateMaterials(essayType, language, topic) {
        const promptMap = {
            'argumentative': language === 'zh' 
                ? `为议论文主题"${topic}"推荐4-5个相关素材，包括：名言警句、历史事例、科学事实或社会现象。每个素材要具体且有说服力。`
                : `Recommend 4-5 materials for argumentative essay topic "${topic}", including: famous quotes, historical examples, scientific facts, or social phenomena. Each should be specific and persuasive.`,
            'narrative': language === 'zh'
                ? `为记叙文主题"${topic}"推荐写作素材，包括：场景描写、人物刻画、心理描写和细节描写的具体示例。`
                : `Recommend writing materials for narrative essay topic "${topic}", including: scene descriptions, character portrayals, psychological descriptions, and detail examples.`,
            'academic': language === 'zh'
                ? `为学术论文主题"${topic}"推荐研究素材，包括：理论框架、研究方法、可能的数据来源和写作规范。`
                : `Recommend research materials for academic paper topic "${topic}", including: theoretical frameworks, research methods, potential data sources, and writing standards.`
        };

        const messages = [
            { role: 'system', content: language === 'zh' ? '你是写作素材推荐专家' : 'You are a writing materials expert' },
            { role: 'user', content: promptMap[essayType] }
        ];

        return await this.callAI(messages, 'materials', essayType);
    }

    /**
     * 生成灵感提示
     */
    async generateInspiration(essayType, language, currentText, wordCount, targetWords) {
        const hasTarget = Number.isFinite(targetWords) && targetWords > 0;
        const progress = hasTarget ? (wordCount / targetWords * 100).toFixed(0) : null;
        const isStalled = hasTarget ? wordCount < targetWords / 2 : wordCount < 300;

        const promptMap = {
            'argumentative': language === 'zh'
                ? `用户正在写议论文，当前已写${wordCount}字${hasTarget ? `（目标${targetWords}字，完成${progress}%）` : '（无字数上限）'}。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的写作建议或灵感提示（不超过50字）。`
                : `User is writing an argumentative essay, currently ${wordCount} words${hasTarget ? ` (target ${targetWords}, ${progress}% complete)` : ' (no word limit)'}. Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief writing tip (max 50 words).`,
            'narrative': language === 'zh'
                ? `用户正在写记叙文，当前已写${wordCount}字${hasTarget ? `（目标${targetWords}字，完成${progress}%）` : '（无字数上限）'}。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的写作建议或灵感提示（不超过50字）。`
                : `User is writing a narrative essay, currently ${wordCount} words${hasTarget ? ` (target ${targetWords}, ${progress}% complete)` : ' (no word limit)'}. Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief writing tip (max 50 words).`,
            'academic': language === 'zh'
                ? `用户正在写学术论文，当前已写${wordCount}字${hasTarget ? `（目标${targetWords}字，完成${progress}%）` : '（无字数上限）'}。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的学术写作建议（不超过50字）。`
                : `User is writing an academic paper, currently ${wordCount} words${hasTarget ? ` (target ${targetWords}, ${progress}% complete)` : ' (no word limit)'}. Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief academic writing tip (max 50 words).`
        };

        const messages = [
            { role: 'system', content: language === 'zh' ? '你是写作灵感导师' : 'You are a writing inspiration mentor' },
            { role: 'user', content: promptMap[essayType] }
        ];

        return await this.callAI(messages, 'inspiration', essayType);
    }

    /**
     * 生成逻辑修补问题
     */
    async generateLogicQuestions(essayType, language, articleContent) {
        const promptMap = {
            'argumentative': language === 'zh'
                ? `分析这篇议论文：${articleContent.substring(0, 500)}... 提出3-5个引导性问题，帮助作者发现论证中的逻辑问题或不足之处。每个问题要具体且有针对性。`
                : `Analyze this argumentative essay: ${articleContent.substring(0, 500)}... Ask 3-5 guiding questions to help the author discover logical issues. Each question should be specific.`,
            'narrative': language === 'zh'
                ? `分析这篇记叙文：${articleContent.substring(0, 500)}... 提出3-5个引导性问题，帮助作者改进故事的情节、人物或细节描写。`
                : `Analyze this narrative essay: ${articleContent.substring(0, 500)}... Ask 3-5 guiding questions to help improve plot, characters, or details.`,
            'academic': language === 'zh'
                ? `分析这篇学术论文：${articleContent.substring(0, 500)}... 提出3-5个引导性问题，帮助作者检查研究逻辑、论证严谨性和学术规范。`
                : `Analyze this academic paper: ${articleContent.substring(0, 500)}... Ask 3-5 guiding questions about research logic, rigor, and academic standards.`
        };

        const messages = [
            { role: 'system', content: language === 'zh' ? '你是论文逻辑审查专家' : 'You are a logic review expert' },
            { role: 'user', content: promptMap[essayType] }
        ];

        return await this.callAI(messages, 'logic', essayType);
    }
}

// 导出全局实例
const aiService = new AIService();
