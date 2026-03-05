// AI服务模块 - 处理所有与AI相关的API调用
// 注意：API Key由开发端在后端管理，用户无需配置

class AIService {
    constructor() {
        // 默认使用同源 API，确保 Vercel 部署时无需硬编码域名
        // 如需跨域（例如前端托管在 GitHub Pages），可在页面注入 window.__AI_API_BASE_URL
        const customBaseUrl = (window.__AI_API_BASE_URL || '').trim().replace(/\/$/, '');
        this.apiEndpoint = customBaseUrl
            ? `${customBaseUrl}/api/qianwen/`
            : '/api/qianwen/';
        
        console.log('✨ AI服务已初始化，API密钥由后端管理');
    }

    /**
     * 调用后端AI API
     * @param {Array} messages - 对话消息数组
     * @param {string} type - 请求类型
     * @param {string} essayType - 文章类型
     */
    async callAI(messages, type, essayType, options = {}) {
        const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 25000;
        const maxRetries = Number.isFinite(options.retries) ? options.retries : 0;

        let attempt = 0;
        let lastError = null;

        while (attempt <= maxRetries) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort('Request timeout'), timeoutMs);

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
                    }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const err = new Error(errorData.error || errorData.message || `API错误: ${response.status}`);
                    err.status = response.status;
                    throw err;
                }

                const data = await response.json();

                return {
                    success: data.success,
                    message: data.message,
                    usage: data.usage
                };
            } catch (error) {
                const isTimeout = error?.name === 'AbortError' || String(error?.message || '').includes('timeout');
                const status = Number(error?.status || 0);
                const isRetriable = isTimeout || status === 504 || status === 502 || status === 503;

                lastError = isTimeout
                    ? new Error('AI request timeout')
                    : error;

                if (!isRetriable || attempt >= maxRetries) {
                    console.error('AI服务调用错误:', lastError);
                    throw lastError;
                }

                await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
                attempt += 1;
            } finally {
                clearTimeout(timer);
            }
        }

        console.error('AI服务调用错误:', lastError);
        throw lastError;
    }

    /**
     * 生成启动引导的AI反馈（第3步）
     */
    async generateGuidanceFeedback(essayType, language, userAnswers) {
        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;
        
        const systemPrompt = language === 'zh' 
            ? `你是一位资深的写作指导专家。根据用户前面的回答，为他们的${essayTypeName}提供论证角度/叙事结构/研究框架的筛选和补充建议。

要求：
1. 分析用户提供的角度/结构是否适合主题
2. 指出哪些角度/结构特别好，应该保留
3. 建议删除或修改不太合适的部分
4. 补充2-3个用户可能没想到的角度/结构
5. 保持简洁，每个建议不超过30字

输出格式：
✓ 保留：[分析用户提供的好的角度]
✎ 建议修改：[指出需要改进的地方]
➕ 补充建议：[提供新的角度/结构]`
            : `You are an experienced writing instructor. Based on the user's previous answers, provide filtering and supplementary suggestions for their ${essayTypeName} argumentation angles/narrative structure/research framework.

Requirements:
1. Analyze if user's angles/structure fit the theme
2. Point out which angles/structure are good and should be kept
3. Suggest removing or modifying less suitable parts
4. Supplement 2-3 angles/structures the user might not have thought of
5. Keep concise, max 30 words per suggestion

Output format:
✓ Keep: [analyze user's good angles]
✎ Suggest modifying: [point out areas for improvement]
➕ Additional suggestions: [provide new angles/structure]`;

        const answersText = userAnswers.map(a => `${a.question} → ${a.answer}`).join('\n');
        
        const userPrompt = language === 'zh'
            ? `用户的回答：\n${answersText}\n\n请分析并给出筛选和补充建议。`
            : `User's answers:\n${answersText}\n\nPlease analyze and provide filtering and supplementary suggestions.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.callAI(messages, 'guidance-feedback', essayType);
    }

    /**
     * 生成详细大纲（第6步，包含素材、篇幅和论证点）
     */
    async generateDetailedOutline(essayType, language, userAnswers) {
        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;
        
        const systemPrompt = language === 'zh' 
            ? `你是写作指导专家。根据用户回答，生成简洁实用的${essayTypeName}大纲。

格式（4-5个部分）：
📝 部分标题（建议字数）
   核心要点：...
   💡 关键点：...
   📚 素材：[具体事例/名言]

要求：
- 个性化，符合用户回答
- 语言简洁，可操作
- 标注篇幅和素材`
            : `You are a writing instructor. Generate a concise ${essayTypeName} outline based on user's answers.

Format (4-5 sections):
📝 Section Title (suggested words)
   Key points: ...
   💡 Focus: ...
   📚 Materials: [specific examples/quotes]

Requirements:
- Personalized to user's answers
- Concise and actionable
- Include word counts and materials`;

        const answersText = userAnswers.map(a => {
            if (a.step) {
                return `${a.step}. ${a.answer}`;
            }
            return a.answer;
        }).join(' | ');
        
        const userPrompt = language === 'zh'
            ? `用户回答：${answersText}\n\n生成${essayTypeName}大纲，包含【素材】【字数】【要点】。`
            : `User answers: ${answersText}\n\nGenerate ${essayTypeName} outline with [materials] [word count] [key points].`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.callAI(messages, 'detailed-outline', essayType);
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
     * 生成详细素材推荐（包含使用示例和适用场景）
     */
    async generateDetailedMaterials(essayType, language, topic, level, userPreferences = [], guidanceAnswers = [], contentText = '', options = {}) {
        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;
        
        // 构建偏好说明
        const preferenceText = userPreferences.length > 0
            ? (language === 'zh' 
                ? `\n用户之前使用过的素材类型：${userPreferences.slice(-3).map(p => p.content.substring(0, 20)).join('、')}` 
                : `\nUser's previous material preferences: ${userPreferences.slice(-3).map(p => p.content.substring(0, 20)).join(', ')}`)
            : '';
        
        // 构建启动引导上下文
        const guidanceContext = guidanceAnswers.length > 0
            ? (language === 'zh'
                ? `\n用户在启动引导中的信息：${guidanceAnswers.map(a => a.answer).join('；').substring(0, 200)}`
                : `\nUser guidance context: ${guidanceAnswers.map(a => a.answer).join('; ').substring(0, 200)}`)
            : '';
        
        // 构建现有写作内容信息
        const contentContext = contentText && contentText.length > 0
            ? (language === 'zh'
                ? `\n用户当前已写的文章片段（${contentText.length}字）可作为参考`
                : `\nUser's current draft (${contentText.length} chars) for reference`)
            : '';
        
        const promptMap = {
            'argumentative': language === 'zh' 
                ? `为主题为"${topic}"的${essayTypeName}推荐4-5个素材，要求：
1. 包括名言警句、历史事例、现代案例等多种类型
2. 每个素材要具体、有说服力
3. 标注每个素材的【适用场景】（如"适用于第一分论点"或"适用于反驳论证"）
4. 提供【使用示例】，说明如何在文章中引用这个素材
5. 考虑${level === 'high-school' ? '高中生' : '大学生'}的水平${preferenceText}${guidanceContext}${contentContext}

输出格式：
1. [素材类型] 素材内容
   适用场景：XXX
   使用示例：你可以这样引用：...

2. [素材类型] 素材内容
   适用场景：XXX
   使用示例：...`
                : `Recommend 4-5 materials for ${essayTypeName} on topic "${topic}". Requirements:
1. Include famous quotes, historical examples, modern cases, etc.
2. Each material should be specific and persuasive
3. Mark [Suitable Scenario] for each (e.g., "suitable for first sub-argument")
4. Provide [Usage Example] showing how to cite in the article
5. Consider ${level === 'high-school' ? 'high school' : 'university'} level${preferenceText}${guidanceContext}${contentContext}

Output format:
1. [Material Type] Material content
   Suitable for: XXX
   Usage Example: You can cite like this: ...

2. [Material Type] Material content
   Suitable for: XXX
   Usage Example: ...`,
            'narrative': language === 'zh'
                ? `为主题为"${topic}"的${essayTypeName}推荐4-5个写作素材，要求：
1. 包括场景描写、人物刻画、心理描写、细节描写等
2. 每个素材要生动、具体、有画面感
3. 标注每个素材的【适用场景】（如"适用于开头场景"或"适用于高潮部分"）
4. 提供【使用示例】，展示如何在文章中运用
5. 考虑${level === 'high-school' ? '高中生' : '大学生'}的水平${preferenceText}${guidanceContext}${contentContext}

输出格式：
1. [描写类型] 素材内容
   适用场景：XXX
   使用示例：可以这样描写：...

2. [描写类型] 素材内容
   适用场景：XXX
   使用示例：...`
                : `Recommend 4-5 writing materials for ${essayTypeName} on topic "${topic}". Requirements:
1. Include scene descriptions, character portrayals, psychological descriptions, details, etc.
2. Each material should be vivid, specific, and visual
3. Mark [Suitable Scenario] (e.g., "suitable for opening scene")
4. Provide [Usage Example] showing how to apply in writing
5. Consider ${level === 'high-school' ? 'high school' : 'university'} level${preferenceText}${guidanceContext}${contentContext}

Output format:
1. [Description Type] Material content
   Suitable for: XXX
   Usage Example: You can describe like this: ...

2. [Description Type] Material content
   Suitable for: XXX
   Usage Example: ...`,
            'academic': language === 'zh'
                ? `为主题为"${topic}"的${essayTypeName}推荐4-5个研究素材，要求：
1. 包括理论框架、研究方法、可能的数据来源、写作规范等
2. 每个素材要学术严谨、有参考价值
3. 标注每个素材的【适用场景】（如"适用于文献综述部分"）
4. 提供【使用示例】或说明
5. 考虑${level === 'high-school' ? '本科' : '研究生'}的水平${preferenceText}${guidanceContext}${contentContext}

输出格式：
1. [素材类型] 素材内容
   适用场景：XXX
   使用说明：...

2. [素材类型] 素材内容
   适用场景：XXX
   使用说明：...`
                : `Recommend 4-5 research materials for ${essayTypeName} on topic "${topic}". Requirements:
1. Include theoretical frameworks, research methods, data sources, writing standards, etc.
2. Each material should be academically rigorous and valuable
3. Mark [Suitable Scenario] (e.g., "suitable for literature review")
4. Provide [Usage Instructions] or explanations
5. Consider ${level === 'high-school' ? 'undergraduate' : 'graduate'} level${preferenceText}${guidanceContext}${contentContext}

Output format:
1. [Material Type] Material content
   Suitable for: XXX
   Usage Instructions: ...

2. [Material Type] Material content
   Suitable for: XXX
   Usage Instructions: ...`
        };

        const messages = [
            { role: 'system', content: language === 'zh' ? '你是写作素材推荐专家，擅长为不同类型的文章提供精准的素材建议。' : 'You are a writing materials expert, skilled at providing precise material recommendations for different types of essays.' },
            { role: 'user', content: promptMap[essayType] }
        ];

        // 合并传入的选项和默认选项（传入的选项优先级更高）
        const callOptions = {
            timeoutMs: 22000,
            retries: 1,
            ...options  // 传入的选项可以覆盖默认值
        };

        return await this.callAI(messages, 'detailed-materials', essayType, callOptions);
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

        // 简化版本也应有合理的超时和重试机制
        return await this.callAI(messages, 'materials', essayType, {
            timeoutMs: 18000,
            retries: 1
        });
    }

    /**
     * 生成基于上下文的灵感提示（更针对性地分析当前文章）
     */
    async generateContextualInspiration(essayType, language, currentText, wordCount, targetWords) {
        const hasTarget = Number.isFinite(targetWords) && targetWords > 0;
        const progress = hasTarget ? (wordCount / targetWords * 100).toFixed(0) : null;
        const isStalled = hasTarget ? wordCount < targetWords / 2 : wordCount < 300;

        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;

        // 获取文章最后200字以更好地理解上下文
        const recentText = currentText.length > 200 
            ? currentText.substring(currentText.length - 200) 
            : currentText;

        const systemPrompt = language === 'zh'
            ? `你是一位富有创造力的写作灵感导师。根据用户正在撰写的${essayTypeName}的内容，提供一个简短但有启发性的写作建议。

要求：
1. 分析文章最近的内容，理解用户当前的写作方向
2. 如果用户似乎遇到写作困难（进度慢），提供具体的突破建议
3. 如果用户写作顺利，鼓励并提示下一步方向
4. 建议要简洁有力，不超过50字
5. 可以包括：具体写作技巧、素材建议、结构提示等

输出格式：直接输出一条建议，不需要前缀。`
            : `You are a creative writing inspiration mentor. Based on the user's ${essayTypeName} content, provide a brief but inspiring writing suggestion.

Requirements:
1. Analyze recent content to understand current writing direction
2. If user seems stuck (slow progress), provide specific breakthrough suggestions
3. If writing smoothly, encourage and hint at next steps
4. Keep suggestion concise, max 50 words
5. Can include: specific techniques, material suggestions, structure tips

Output format: Direct suggestion without prefix.`;

        const userPrompt = language === 'zh'
            ? `用户正在写${essayTypeName}，当前已写${wordCount}字${hasTarget ? `（目标${targetWords}字，完成${progress}%）` : '（无字数上限）'}。

最近的内容：
${recentText}

${isStalled ? '用户似乎写作进度较慢，可能遇到了困难。' : '用户正在稳步推进写作。'}

请给出一条简短而有针对性的灵感提示或写作建议。`
            : `User is writing ${essayTypeName}, currently ${wordCount} words${hasTarget ? ` (target ${targetWords}, ${progress}% complete)` : ' (no word limit)'}.

Recent content:
${recentText}

${isStalled ? 'User seems to be progressing slowly, might be stuck.' : 'User is progressing steadily.'}

Provide a brief, targeted inspiration tip or writing suggestion.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.callAI(messages, 'contextual-inspiration', essayType);
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
     * 根据用户对逻辑问题的回答生成建议
     */
    async generateLogicFeedback(essayType, language, question, userAnswer, articlePreview) {
        const essayTypeNames = {
            'argumentative': { zh: '议论文', en: 'argumentative essay' },
            'narrative': { zh: '记叙文', en: 'narrative essay' },
            'academic': { zh: '学术论文', en: 'academic paper' }
        };
        
        const essayTypeName = language === 'zh' 
            ? essayTypeNames[essayType].zh 
            : essayTypeNames[essayType].en;

        const systemPrompt = language === 'zh'
            ? `你是一位资深的写作导师，擅长通过启发式提问帮助学生自己发现问题并改进文章。

你的任务：根据学生对逻辑问题的回答，提供简短的引导性建议，帮助他们自己思考如何改进，而不是直接告诉他们怎么改。

要求：
1. 分析学生的回答，理解他们的思考
2. 指出回答中反映出的文章可能存在的问题
3. 用启发性的语言引导学生思考改进方向
4. 不直接给出修改方案，而是提供思考的角度
5. 保持鼓励和支持的语气
6. 建议简洁，不超过80字

输出格式：直接输出建议，不要前缀。`
            : `You are an experienced writing mentor who excels at helping students discover issues and improve articles through inspiring questions.

Your task: Based on the student's answer to logic questions, provide brief guiding suggestions to help them think about improvements, rather than directly telling them what to change.

Requirements:
1. Analyze the student's answer and understand their thinking
2. Point out potential issues in the article reflected by their answer
3. Use inspiring language to guide students' thinking about improvement
4. Don't give direct solutions, provide thinking perspectives
5. Maintain encouraging and supportive tone
6. Keep suggestion concise, max 80 words

Output format: Direct suggestion without prefix.`;

        const userPrompt = language === 'zh'
            ? `问题：${question}

学生的回答：${userAnswer}

文章片段：${articlePreview}

请根据学生的回答，提供引导性建议，帮助他们自己思考如何改进${essayTypeName}。`
            : `Question: ${question}

Student's answer: ${userAnswer}

Article excerpt: ${articlePreview}

Based on the student's answer, provide guiding suggestions to help them think about how to improve their ${essayTypeName}.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.callAI(messages, 'logic-feedback', essayType);
    }

    /**
     * 生成优化修补问题
     */
    async generateOptimizationQuestions(essayType, language, articleContent) {
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
            { role: 'system', content: language === 'zh' ? '你是文章优化评审专家' : 'You are a content optimization expert' },
            { role: 'user', content: promptMap[essayType] }
        ];

        return await this.callAI(messages, 'optimization', essayType);
    }
}

// 导出全局实例
const aiService = new AIService();
