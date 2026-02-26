// AI服务模块 - 处理所有与AI相关的API调用

class AIService {
    constructor() {
        // API端点 - 开发时使用本地，部署后自动使用Vercel
        this.apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api/qianwen'  // 本地开发
            : '/api/qianwen';  // 生产环境
    }

    /**
     * 调用AI API
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
                const error = await response.json();
                throw new Error(error.message || '调用AI服务失败');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('AI服务调用错误:', error);
            throw error;
        }
    }

    /**
     * 生成启动引导的问题回应
     */
    async generateGuidanceResponse(essayType, language, userAnswers) {
        const systemPrompt = language === 'zh' 
            ? `你是一个写作指导专家。用户正在写${essayType === 'argumentative' ? '议论文' : essayType === 'narrative' ? '记叙文' : '学术论文'}。根据用户的回答，生成一个详细的写作大纲建议。`
            : `You are a writing guidance expert. The user is writing ${essayType === 'argumentative' ? 'an argumentative essay' : essayType === 'narrative' ? 'a narrative essay' : 'an academic paper'}. Based on the user's answers, generate a detailed writing outline.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `用户的回答：${JSON.stringify(userAnswers)}。请生成写作大纲建议。` }
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
        const progress = (wordCount / targetWords * 100).toFixed(0);
        const isStalled = wordCount < targetWords / 2;

        const promptMap = {
            'argumentative': language === 'zh'
                ? `用户正在写议论文，当前已写${wordCount}字（目标${targetWords}字，完成${progress}%）。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的写作建议或灵感提示（不超过50字）。`
                : `User is writing an argumentative essay, currently ${wordCount} words (target ${targetWords}, ${progress}% complete). Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief writing tip (max 50 words).`,
            'narrative': language === 'zh'
                ? `用户正在写记叙文，当前已写${wordCount}字（目标${targetWords}字，完成${progress}%）。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的写作建议或灵感提示（不超过50字）。`
                : `User is writing a narrative essay, currently ${wordCount} words (target ${targetWords}, ${progress}% complete). Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief writing tip (max 50 words).`,
            'academic': language === 'zh'
                ? `用户正在写学术论文，当前已写${wordCount}字（目标${targetWords}字，完成${progress}%）。当前内容：${currentText.substring(0, 200)}... ${isStalled ? '用户似乎遇到了困难。' : '用户正在稳步推进。'}请给出一条简短的学术写作建议（不超过50字）。`
                : `User is writing an academic paper, currently ${wordCount} words (target ${targetWords}, ${progress}% complete). Content: ${currentText.substring(0, 200)}... ${isStalled ? 'User seems stuck.' : 'User is progressing well.'} Provide a brief academic writing tip (max 50 words).`
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
