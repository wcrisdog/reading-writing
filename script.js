// ============================================
// 智引文思 - 智能写作平台 v2.0
// 核心功能：启动引导、素材推荐、灵感提示、逻辑修补
// ============================================

// =========== 应用状态管理 ===========
let currentType = 'argumentative';
let currentLevel = 'high-school';
let currentLanguage = 'zh';
let autoSaveEnabled = true;
let contentHistory = [];
let lastActivityTime = Date.now();
let guidanceStep = 0;
let currentOutline = null;
let writingStartTime = null; // 写作开始时间
let totalWritingTime = 0; // 总写作时长（秒）
let lastStatsUpdate = Date.now();

// =========== 写作类型配置 ===========
const essayTypes = {
    argumentative: {
        zh: {
            name: '议论文',
            level: '高中',
            description: '观点明确，论证有力的议论性文章',
            targetWords: 800,
            placeholder: '请清晰阐述你的论点...\n\n论证要点：\n1. 提出明确的观点\n2. 利用合适的论据支撑\n3. 进行深入的分析\n4. 形成有说服力的结论',
            sections: ['开篇引入', '论点阐述', '论据分析', '总结升华']
        },
        en: {
            name: 'Argumentative Essay',
            level: 'High School',
            description: 'A persuasive essay with clear arguments',
            targetWords: 800,
            placeholder: 'State your argument clearly...\n\nKey points:\n1. Clear thesis statement\n2. Supporting evidence\n3. Logical analysis\n4. Strong conclusion',
            sections: ['Introduction', 'Argument 1', 'Argument 2', 'Conclusion']
        }
    },
    narrative: {
        zh: {
            name: '记叙文',
            level: '高中',
            description: '生动描写事件、人物的叙事性文章',
            targetWords: 800,
            placeholder: '讲述一个生动的故事...\n\n写作要素：\n1. 清晰的时间地点\n2. 鲜明的人物形象\n3. 详细的场景描写\n4. 深刻的思想内涵',
            sections: ['背景交代', '事件发展', '高潮描写', '结尾感悟']
        },
        en: {
            name: 'Narrative Essay',
            level: 'High School',
            description: 'A vivid storytelling essay with characters and events',
            targetWords: 800,
            placeholder: 'Tell a compelling story...\n\nElements:\n1. Time and place\n2. Character descriptions\n3. Scene details\n4. Deeper meaning',
            sections: ['Background', 'Plot Development', 'Climax', 'Reflection']
        }
    },
    academic: {
        zh: {
            name: '学术论文',
            level: '大学/研究生',
            description: '严谨论证、深度研究的学术性文章',
            targetWords: null,
            placeholder: '进行学术研究和论证...\n\n论文结构：\n1. 研究背景和意义\n2. 理论分析和方法\n3. 实证研究和发现\n4. 结论和展望',
            sections: ['摘要', '引言', '文献综述', '理论框架', '研究方法', '结果分析', '讨论', '结论']
        },
        en: {
            name: 'Academic Paper',
            level: 'University/Graduate',
            description: 'A rigorous scholarly paper with evidence-based arguments',
            targetWords: null,
            placeholder: 'Conduct academic research...\n\nStructure:\n1. Research background\n2. Literature review\n3. Methodology\n4. Results and analysis\n5. Conclusion',
            sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion']
        }
    }
};

// =========== 启动引导问题库（6步详细流程）===========
const guidanceQuestions = {
    argumentative: {
        zh: [
            { 
                step: 1, 
                type: 'text',
                question: '你这篇文章的核心观点是什么？可以用一句话概括吗？',
                placeholder: '例如：长期主义是人生成功的关键...'
            },
            { 
                step: 2, 
                type: 'text',
                question: '你打算从哪几个角度来论证这个观点？想到几个就说几个。',
                placeholder: '例如：1. 个人成长角度 2. 历史事实角度 3. 社会发展角度...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: '根据你的回答，AI为你筛选和补充了以下论证角度。你是否满意？',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: '如果有人说你的观点不对，你觉得他会从哪个角度反驳？',
                placeholder: '例如：可能会说长期主义太理想化，忽视了现实困境...'
            },
            {
                step: 5,
                type: 'text',
                question: '你有没有特别想使用的素材？比如名言、事例等。',
                placeholder: '例如：屈原的"路漫漫其修远兮"、叶嘉莹的坚持...'
            },
            {
                step: 6,
                type: 'text',
                question: '你打算用什么样的例子来支撑第一个角度？',
                placeholder: '例如：可以用量子力学家的长期研究经历...'
            }
        ],
        en: [
            { 
                step: 1, 
                type: 'text',
                question: 'What is your core viewpoint for this article? Can you summarize it in one sentence?',
                placeholder: 'E.g., Long-term thinking is key to success...'
            },
            { 
                step: 2, 
                type: 'text',
                question: 'From which angles do you plan to argue this viewpoint? List as many as you can think of.',
                placeholder: 'E.g., 1. Personal growth 2. Historical facts 3. Social development...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: 'Based on your answer, AI has filtered and supplemented the following argumentation angles. Are you satisfied?',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: 'If someone says your viewpoint is wrong, from which angle would they refute it?',
                placeholder: 'E.g., They might say long-term thinking is too idealistic...'
            },
            {
                step: 5,
                type: 'text',
                question: 'Do you have any specific materials you want to use? Such as quotes or examples.',
                placeholder: 'E.g., Confucius\' famous quote, Steve Jobs\' persistence...'
            },
            {
                step: 6,
                type: 'text',
                question: 'What kind of example will you use to support your first angle?',
                placeholder: 'E.g., Long-term research by quantum physicists...'
            }
        ]
    },
    narrative: {
        zh: [
            { 
                step: 1, 
                type: 'text',
                question: '你想讲述一个什么样的故事？用一两句话简单描述。',
                placeholder: '例如：一个关于克服困难、最终实现梦想的成长故事...'
            },
            { 
                step: 2, 
                type: 'text',
                question: '故事中的主要人物是谁？他们有什么特点？',
                placeholder: '例如：主角是我自己，一个内向但坚韧的学生...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: '根据你的故事，AI为你梳理了以下叙事结构。你觉得如何？',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: '故事的矛盾冲突是什么？主角面临什么困境或挑战？',
                placeholder: '例如：学习成绩下滑，同时面对同学的质疑...'
            },
            {
                step: 5,
                type: 'text',
                question: '你打算如何刻画故事中的关键场景？有什么印象深刻的细节？',
                placeholder: '例如：深夜台灯下苦读的场景，妈妈递来的热牛奶...'
            },
            {
                step: 6,
                type: 'text',
                question: '故事最终想传达什么样的情感或启示？',
                placeholder: '例如：坚持和努力终会带来收获，不要轻易放弃...'
            }
        ],
        en: [
            { 
                step: 1, 
                type: 'text',
                question: 'What kind of story do you want to tell? Briefly describe in one or two sentences.',
                placeholder: 'E.g., A growth story about overcoming difficulties and achieving dreams...'
            },
            { 
                step: 2, 
                type: 'text',
                question: 'Who are the main characters in your story? What are their characteristics?',
                placeholder: 'E.g., The protagonist is myself, an introverted but resilient student...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: 'Based on your story, AI has organized the following narrative structure. What do you think?',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: 'What is the conflict in the story? What difficulties or challenges does the protagonist face?',
                placeholder: 'E.g., Declining grades while facing peer skepticism...'
            },
            {
                step: 5,
                type: 'text',
                question: 'How do you plan to portray key scenes in the story? Any memorable details?',
                placeholder: 'E.g., Studying late under a desk lamp, mom bringing warm milk...'
            },
            {
                step: 6,
                type: 'text',
                question: 'What emotion or message do you ultimately want to convey through this story?',
                placeholder: 'E.g., Persistence and effort will bring rewards, never give up...'
            }
        ]
    },
    academic: {
        zh: [
            { 
                step: 1, 
                type: 'text',
                question: '你的研究课题是什么？请简要说明研究的主要问题。',
                placeholder: '例如：探讨人工智能在教育领域的应用及其影响...'
            },
            { 
                step: 2, 
                type: 'text',
                question: '你打算采用哪些研究方法？为什么选择这些方法？',
                placeholder: '例如：文献综述法+问卷调查法，因为需要理论基础和实证数据...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: '根据你的研究设计，AI为你梳理了以下论文框架。你是否认可？',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: '现有研究中有哪些不足之处？你的研究如何弥补这些不足？',
                placeholder: '例如：现有研究多关注技术层面，较少关注教育公平问题...'
            },
            {
                step: 5,
                type: 'text',
                question: '你的研究预期会得到什么样的结论或发现？',
                placeholder: '例如：预期发现AI应用能提升学习效率，但需注意数据隐私...'
            },
            {
                step: 6,
                type: 'text',
                question: '你认为这项研究有哪些局限性？未来可以如何改进？',
                placeholder: '例如：样本量有限，未来可扩大调查范围...'
            }
        ],
        en: [
            { 
                step: 1, 
                type: 'text',
                question: 'What is your research topic? Please briefly explain the main research question.',
                placeholder: 'E.g., Exploring AI applications in education and their impacts...'
            },
            { 
                step: 2, 
                type: 'text',
                question: 'Which research methods will you use? Why did you choose these methods?',
                placeholder: 'E.g., Literature review + survey, for theoretical foundation and empirical data...'
            },
            {
                step: 3,
                type: 'ai-feedback',
                question: 'Based on your research design, AI has organized the following paper framework. Do you approve?',
                needsAI: true
            },
            {
                step: 4,
                type: 'text',
                question: 'What are the gaps in existing research? How does your research fill these gaps?',
                placeholder: 'E.g., Existing research focuses on technology, less on educational equity...'
            },
            {
                step: 5,
                type: 'text',
                question: 'What conclusions or findings do you expect from your research?',
                placeholder: 'E.g., Expect to find AI improves learning efficiency but raises privacy concerns...'
            },
            {
                step: 6,
                type: 'text',
                question: 'What are the limitations of this research? How could it be improved in the future?',
                placeholder: 'E.g., Limited sample size, could expand survey scope in future...'
            }
        ]
    }
};

// =========== 素材库 ===========
const materialLibrary = {
    argumentative: {
        zh: {
            materials: [
                { category: '名言警句', examples: ['业精于勤，荒于嬉。—韩愈', '人生如同道路一样，最重要的是走自己的路。—鲁迅'] },
                { category: '历史事例', examples: ['孙中山推翻帝制，建立共和', '中国航天事业的发展'] },
                { category: '科学事实', examples: ['互联网改变了人类生活方式', '人工智能技术的应用'] },
                { category: '社会现象', examples: ['城市化进程', '教育改革的意义'] }
            ]
        },
        en: {
            materials: [
                { category: 'Famous Quotes', examples: ['Knowledge is power - Francis Bacon', 'The only way to do great work is to love what you do - Steve Jobs'] },
                { category: 'Historical Examples', examples: ['Industrial Revolution\'s impact on society', 'Civil rights movement'] },
                { category: 'Scientific Facts', examples: ['Internet connectivity', 'Climate change evidence'] },
                { category: 'Social Phenomena', examples: ['Globalization', 'Digital transformation'] }
            ]
        }
    },
    narrative: {
        zh: {
            materials: [
                { category: '场景描写', examples: ['晨曦中的校园', '雨夜的城市街道', '月明星稀的乡村'] },
                { category: '人物刻画', examples: ['坚韧的眼神', '温暖的笑容', '略显疲惫的身影'] },
                { category: '心理描写', examples: ['紧张时的心跳声', '失落中的思绪漂零', '成功时的欣喜若狂'] },
                { category: '细节描写', examples: ['妈妈粗糙的手', '老师黑板上的粉笔灰', '同学递来的纸巾'] }
            ]
        },
        en: {
            materials: [
                { category: 'Scene Descriptions', examples: ['Morning light on campus', 'Rainy city streets', 'Starlit countryside'] },
                { category: 'Character Portrayal', examples: ['Determined eyes', 'Warm smile', 'Tired figure'] },
                { category: 'Psychological Descriptions', examples: ['Racing heartbeat of nervousness', 'Wandering thoughts of sadness', 'Pure joy of success'] },
                { category: 'Details', examples: ['Mother\'s worn hands', 'Chalk dust on the blackboard', 'Tissues passed by friends'] }
            ]
        }
    },
    academic: {
        zh: {
            materials: [
                { category: '理论框架', examples: ['系统论', '博弈论', '社会学理论'] },
                { category: '研究方法', examples: ['定量分析', '定性分析', '混合方法'] },
                { category: '数据来源', examples: ['学术数据库', '政府统计', '实地调查'] },
                { category: '写作标准', examples: ['APA格式', '学术严谨性', '引用规范'] }
            ]
        },
        en: {
            materials: [
                { category: 'Theoretical Frameworks', examples: ['Systems Theory', 'Game Theory', 'Sociological Theories'] },
                { category: 'Research Methods', examples: ['Quantitative Analysis', 'Qualitative Analysis', 'Mixed Methods'] },
                { category: 'Data Sources', examples: ['Academic Databases', 'Government Statistics', 'Field Studies'] },
                { category: 'Writing Standards', examples: ['APA Format', 'Academic Rigor', 'Citation Rules'] }
            ]
        }
    }
};

// =========== 灵感提示库 ===========
const inspirationTips = {
    argumentative: {
        zh: {
            stallTips: [
                '💡 若观点不够清晰，可以先说出你对这个问题的第一印象',
                '💡 你是否收集了足够的论据？试试查找相关的例子或数据',
                '💡 反驳观点往往能帮助你更深入地理解自己的立场',
                '💡 用一句话总结你最想表达的核心思想，然后围绕它展开'
            ],
            progressTips: [
                '💭 你已经写了很多内容，确保每个论点都有充足的论据支撑',
                '💭 这是检视逻辑连贯性的好时候，各部分是否有机联系？'
            ]
        },
        en: {
            stallTips: [
                '💡 If your point is unclear, start with your first impression of the issue',
                '💡 Do you have enough supporting evidence? Try finding relevant examples',
                '💡 Addressing counterarguments strengthens your position',
                '💡 Summarize your core idea in one sentence, then build around it'
            ],
            progressTips: [
                '💭 You have written a lot. Ensure each argument has sufficient evidence',
                '💭 Good time to check logical coherence. Are all parts connected?'
            ]
        }
    },
    narrative: {
        zh: {
            stallTips: [
                '💡 故事需要一个清晰的开头。描述故事发生的时间、地点和人物',
                '💡 加入更多感官细节会让故事更生动。你看到、听到、感受到了什么？',
                '💡 抓住故事的转折点——这就是最引人入胜的部分',
                '💡 想想故事对你有什么启示，这会让结尾更有深度'
            ],
            progressTips: [
                '💭 你正在讲述一个故事。确保读者能看到、听到、感受到',
                '💭 现在是梳理故事逻辑的时候，事件发展是否自然流畅？'
            ]
        },
        en: {
            stallTips: [
                '💡 A clear opening sets the scene. Describe when, where, and who',
                '💡 Add sensory details to bring the story alive. What did you see, hear, feel?',
                '💡 Focus on the turning point—the most engaging part of the story',
                '💡 Reflect on what the story means to you for a deeper ending'
            ],
            progressTips: [
                '💭 You\'re telling a story. Help readers see, hear, and feel',
                '💭 Good time to organize the plot. Is the development natural and smooth?'
            ]
        }
    },
    academic: {
        zh: {
            stallTips: [
                '💡 明确你的研究问题是什么。问题清晰，方向就清晰',
                '💡 查阅相关文献会给你灵感。什么是已经研究过的？你的创新点在哪？',
                '💡 用简洁的语言阐述你的理论框架，这会帮助结构化思路',
                '💡 考虑数据如何支持你的论证。需要补充什么样的数据？'
            ],
            progressTips: [
                '💭 你的论文正在形成。检查是否有充分的文献支撑',
                '💭 现在可以梳理论文的整体逻辑和部分之间的关系'
            ]
        },
        en: {
            stallTips: [
                '💡 Clarify your research question. Clear question = clear direction',
                '💡 Review related literature for inspiration. What\'s new in your work?',
                '💡 State your theoretical framework clearly. This structures your thinking',
                '💡 How does data support your argument? What data might you need?'
            ],
            progressTips: [
                '💭 Your paper is taking shape. Ensure sufficient literature support',
                '💭 Good time to review the logic and connections between sections'
            ]
        }
    }
};

// =========== 灵感提示和智能卡顿检测 ===========
let lastKeystrokeTime = Date.now();
let stallDetectionInterval = null;
let hasShownStallTip = false;

function setupKeystrokeTracking() {
    mainEditor.addEventListener('keydown', () => {
        lastKeystrokeTime = Date.now();
        hasShownStallTip = false; // 重置卡顿提示标记
    });

    mainEditor.addEventListener('input', () => {
        lastKeystrokeTime = Date.now();
        hasShownStallTip = false;
    });

    // 启动卡顿检测定时器（每15秒检测一次）
    if (stallDetectionInterval) {
        clearInterval(stallDetectionInterval);
    }
    
    stallDetectionInterval = setInterval(() => {
        detectWritingStall();
    }, 15000); // 每15秒检测一次
}

function detectWritingStall() {
    const timeSinceLastKeystroke = Date.now() - lastKeystrokeTime;
    const text = mainEditor.value;
    
    // 如果用户输入了内容但超过30秒没有新输入，且尚未显示提示
    if (timeSinceLastKeystroke > 30000 && text.length > 50 && !hasShownStallTip) {
        // 自动触发灵感提示
        showAutoInspirationTip();
        hasShownStallTip = true;
    }
}

async function showAutoInspirationTip() {
    const text = mainEditor.value;
    
    if (!text || text.length < 50) {
        return;
    }
    
    // 在AI输出面板显示"检测到卡顿"的提示
    aiOutput.innerHTML = `
        <p class="stall-notice">🔍 ${currentLanguage === 'zh' 
            ? '检测到你可能遇到了写作困难...' 
            : 'Detected you might be stuck...'}</p>
        <p class="loading">🔄 ${currentLanguage === 'zh' 
            ? 'AI正在分析你的文章，提供灵感提示...' 
            : 'AI is analyzing your writing for inspiration...'}</p>
    `;
    
    try {
        const wordCount = currentLanguage === 'zh'
            ? text.replace(/[^\u4e00-\u9fa5]/g, '').length
            : text.trim().split(/\s+/).filter(w => w).length;
        
        const targetWords = essayTypes[currentType][currentLanguage].targetWords;
        
        // 调用AI服务生成针对性灵感
        const result = await aiService.generateContextualInspiration(
            currentType, 
            currentLanguage, 
            text, 
            wordCount, 
            targetWords
        );
        
        const aiTip = result.message;
        const hasTarget = Number.isFinite(targetWords) && targetWords > 0;
        const progress = hasTarget ? (wordCount / targetWords * 100).toFixed(0) : null;
        
        aiOutput.innerHTML = `
            <div class="inspiration-tip">
                <p class="tip-header">💡 ${currentLanguage === 'zh' ? 'AI灵感提示' : 'AI Inspiration'}</p>
                <p class="suggestion">${aiTip}</p>
                <p class="progress-info">📊 ${
                    hasTarget
                        ? (currentLanguage === 'zh'
                            ? `当前进度: ${wordCount}/${targetWords} 字 (${progress}%)`
                            : `Progress: ${wordCount}/${targetWords} words (${progress}%)`)
                        : (currentLanguage === 'zh'
                            ? `当前字数: ${wordCount} 字`
                            : `Current words: ${wordCount}`)
                }</p>
            </div>
        `;
        
        // 播放提示音效（如果需要）
        playNotificationSound();
        
    } catch (error) {
        console.error('自动灵感提示失败:', error);
        
        // 使用本地提示
        const tips = inspirationTips[currentType][currentLanguage];
        const tip = tips.stallTips[Math.floor(Math.random() * tips.stallTips.length)];
        
        aiOutput.innerHTML = `
            <div class="inspiration-tip">
                <p class="tip-header">💡 ${currentLanguage === 'zh' ? '写作提示' : 'Writing Tip'}</p>
                <p class="suggestion">${tip}</p>
            </div>
        `;
    }
}

async function checkInspirationNeeded() {
    const text = mainEditor.value;
    
    if (!text || text.length < 50) {
        showNotification(
            currentLanguage === 'zh'
                ? '请先写入一些内容，AI才能提供针对性建议'
                : 'Please write some content first for personalized tips'
        );
        return;
    }
    
    const wordCount = currentLanguage === 'zh'
        ? text.replace(/[^\u4e00-\u9fa5]/g, '').length
        : text.trim().split(/\s+/).filter(w => w).length;

    // 显示加载状态
    aiOutput.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在分析你的文章，生成灵感提示...' : 'AI is analyzing your writing...') + 
        '</p>';

    try {
        const targetWords = essayTypes[currentType][currentLanguage].targetWords;
        const hasTarget = Number.isFinite(targetWords) && targetWords > 0;
        
        // 调用AI服务获取更针对性的灵感
        const result = await aiService.generateContextualInspiration(
            currentType, 
            currentLanguage, 
            text, 
            wordCount, 
            targetWords
        );
        
        const aiTip = result.message;
        const progress = hasTarget ? (wordCount / targetWords * 100).toFixed(0) : null;
        
        aiOutput.innerHTML = `
            <div class="inspiration-tip">
                <p class="tip-header">💡 ${currentLanguage === 'zh' ? 'AI灵感建议' : 'AI Inspiration'}</p>
                <p class="suggestion">${aiTip}</p>
                <p class="progress-info">📊 ${
                    hasTarget
                        ? (currentLanguage === 'zh'
                            ? `当前进度: ${wordCount}/${targetWords} 字 (${progress}%)`
                            : `Progress: ${wordCount}/${targetWords} words (${progress}%)`)
                        : (currentLanguage === 'zh'
                            ? `当前字数: ${wordCount} 字`
                            : `Current words: ${wordCount}`)
                }</p>
            </div>
        `;
        
        showNotification(
            currentLanguage === 'zh'
                ? '💡 AI灵感提示已生成'
                : '💡 AI inspiration generated'
        );
        
    } catch (error) {
        console.error('灵感提示失败:', error);
        
        // 降级到本地提示
        const tips = inspirationTips[currentType][currentLanguage];
        const tip = wordCount < essayTypes[currentType][currentLanguage].targetWords / 2
            ? tips.stallTips[Math.floor(Math.random() * tips.stallTips.length)]
            : tips.progressTips[Math.floor(Math.random() * tips.progressTips.length)];
        
        aiOutput.innerHTML = `
            <div class="inspiration-tip">
                <p class="suggestion">${tip}</p>
            </div>
        `;
    }
}

function playNotificationSound() {
    // 简单的提示音效（可选）
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // 音效播放失败，忽略
    }
}
    argumentative: {
        zh: {
            stallTips: [
                '💡 若观点不够清晰，可以先说出你对这个问题的第一印象',
                '💡 你是否收集了足够的论据？试试查找相关的例子或数据',
                '💡 反驳观点往往能帮助你更深入地理解自己的立场',
                '💡 用一句话总结你最想表达的核心思想，然后围绕它展开'
            ],
            progressTips: [
                '💭 你已经写了很多内容，确保每个论点都有充足的论据支撑',
                '💭 这是检视逻辑连贯性的好时候，各部分是否有机联系？'
            ]
        },
        en: {
            stallTips: [
                '💡 If your point is unclear, start with your first impression of the issue',
                '💡 Do you have enough supporting evidence? Try finding relevant examples',
                '💡 Addressing counterarguments strengthens your position',
                '💡 Summarize your core idea in one sentence, then build around it'
            ],
            progressTips: [
                '💭 You have written a lot. Ensure each argument has sufficient evidence',
                '💭 Good time to check logical coherence. Are all parts connected?'
            ]
        }
    },
    narrative: {
        zh: {
            stallTips: [
                '💡 故事需要一个清晰的开头。描述故事发生的时间、地点和人物',
                '💡 加入更多感官细节会让故事更生动。你看到、听到、感受到了什么？',
                '💡 抓住故事的转折点——这就是最引人入胜的部分',
                '💡 想想故事对你有什么启示，这会让结尾更有深度'
            ],
            progressTips: [
                '💭 你正在讲述一个故事。确保读者能看到、听到、感受到',
                '💭 现在是梳理故事逻辑的时候，事件发展是否自然流畅？'
            ]
        },
        en: {
            stallTips: [
                '💡 A clear opening sets the scene. Describe when, where, and who',
                '💡 Add sensory details to bring the story alive. What did you see, hear, feel?',
                '💡 Focus on the turning point—the most engaging part of the story',
                '💡 Reflect on what the story means to you for a deeper ending'
            ],
            progressTips: [
                '💭 You\'re telling a story. Help readers see, hear, and feel',
                '💭 Good time to organize the plot. Is the development natural and smooth?'
            ]
        }
    },
    academic: {
        zh: {
            stallTips: [
                '💡 明确你的研究问题是什么。问题清晰，方向就清晰',
                '💡 查阅相关文献会给你灵感。什么是已经研究过的？你的创新点在哪？',
                '💡 用简洁的语言阐述你的理论框架，这会帮助结构化思路',
                '💡 考虑数据如何支持你的论证。需要补充什么样的数据？'
            ],
            progressTips: [
                '💭 你的论文正在形成。检查是否有充分的文献支撑',
                '💭 现在可以梳理论文的整体逻辑和部分之间的关系'
            ]
        },
        en: {
            stallTips: [
                '💡 Clarify your research question. Clear question = clear direction',
                '💡 Review related literature for inspiration. What\'s new in your work?',
                '💡 State your theoretical framework clearly. This structures your thinking',
                '💡 How does data support your argument? What data might you need?'
            ],
            progressTips: [
                '💭 Your paper is taking shape. Ensure sufficient literature support',
                '💭 Good time to review the logic and connections between sections'
            ]
        }
    }
};

// =========== 逻辑修补问题 ===========
const logicRepairQuestions = {
    argumentative: {
        zh: [
            '你是否在每个观点后都提供了具体的论据？有哪些观点缺少支撑？',
            '你的论据是否来自可信的来源？这些论据的说服力如何？',
            '反对的观点可能是什么？你如何驳斥它们？',
            '你的结论是否呼应了开篇？论证过程是否完整？',
            '句与句之间的逻辑关系是否清晰？过渡是否自然？'
        ],
        en: [
            'Have you provided concrete evidence for each argument? Which lack support?',
            'Are your sources credible? How convincing is your evidence?',
            'What counter-arguments exist? How would you refute them?',
            'Does your conclusion echo the introduction? Is the argument complete?',
            'Are logical relationships between sentences clear? Are transitions natural?'
        ]
    },
    narrative: {
        zh: [
            '你的故事中有哪些地方描写不够生动？哪里需要更多细节？',
            '人物的性格和感情变化是否逼真？他们为什么做这些事？',
            '故事的前后顺序是否合理？有跳跃或混乱的地方吗？',
            '关键场景（高潮、转折）是否充分展开了？',
            '故事的意义是什么？读者能理解你想表达的主题吗？'
        ],
        en: [
            'Which parts of your story need more vivid descriptions? Where need more details?',
            'Are character emotions and changes realistic? Why do they act this way?',
            'Is the sequence of events logical? Any jumps or confusion?',
            'Are key scenes (climax, turning points) fully developed?',
            'What is the meaning of your story? Can readers understand your theme?'
        ]
    },
    academic: {
        zh: [
            '你引用的文献是否准确理解？有曲解原意的地方吗？',
            '理论与实证研究是否紧密联系？它们是否相互支撑？',
            '数据和结论之间是否有逻辑漏洞？是否过度解读了？',
            '你承认了研究的局限性吗？有哪些未来研究方向？',
            '整篇论文的论证链条是否完整？各部分是否有机连接？'
        ],
        en: [
            'Do you correctly understand the literature you cited? Any misinterpretations?',
            'Are theory and empirical research tightly linked? Do they support each other?',
            'Are there logical gaps between data and conclusions? Over-interpretation?',
            'Have you acknowledged research limitations? Future directions?',
            'Is the entire argumentative chain complete? Do sections connect logically?'
        ]
    }
};

// =========== DOM 元素（全局变量声明）===========
let mainEditor, titleInput, charCount, wordCount, paraCount;
let templateInfo, aiOutput, outlinePanel, materialsList, materialsPanel;

// =========== 初始化 ===========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded event triggered');
    
    // 获取 DOM 元素
    mainEditor = document.getElementById('mainEditor');
    titleInput = document.getElementById('titleInput');
    charCount = document.getElementById('charCount');
    wordCount = document.getElementById('wordCount');
    paraCount = document.getElementById('paraCount');
    templateInfo = document.getElementById('templateInfo');
    aiOutput = document.getElementById('aiOutput');
    outlinePanel = document.getElementById('outlinePanel');
    materialsList = document.getElementById('materialsList');
    materialsPanel = document.getElementById('materialsPanel');
    
    console.log('✅ DOM elements fetched:', {
        mainEditor: !!mainEditor,
        titleInput: !!titleInput,
        templateInfo: !!templateInfo,
        aiOutput: !!aiOutput
    });
    
    // 初始化应用
    loadSavedContent();
    updateTemplate();
    setupEventListeners();
    updateStats();
    setupKeystrokeTracking();
    
    console.log('✅ Initialization complete');
});

// =========== 事件监听设置 ===========
function setupEventListeners() {
    console.log('🔧 setupEventListeners started');
    
    // 写作类型切换
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('📌 nav-btn clicked:', e.target.dataset.type);
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentType = e.target.dataset.type;
            currentLevel = e.target.dataset.level;
            updateTemplate();
        });
    });

    // 语言切换
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            console.log('🌍 language changed:', e.target.value);
            currentLanguage = e.target.value;
            updateTemplate();
        });
    });

    // 文本编辑
    if (mainEditor) {
        mainEditor.addEventListener('input', () => {
            updateStats();
            lastActivityTime = Date.now();
            if (autoSaveEnabled) {
                debouncedSave();
            }
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (autoSaveEnabled) {
                debouncedSave();
            }
        });
    }

    // 新功能按钮
    const launchGuidanceBtn = document.getElementById('launchGuidance');
    const getMaterialsBtn = document.getElementById('getMaterials');
    const getInspirationBtn = document.getElementById('getInspiration');
    const logicRepairBtn = document.getElementById('logicRepair');
    
    console.log('🎯 Button elements:', {
        launchGuidance: !!launchGuidanceBtn,
        getMaterials: !!getMaterialsBtn,
        getInspiration: !!getInspirationBtn,
        logicRepair: !!logicRepairBtn
    });
    
    if (launchGuidanceBtn) {
        console.log('✅ Adding launchGuidance click listener');
        launchGuidanceBtn.addEventListener('click', () => {
            console.log('🚀 launchGuidance clicked');
            startGuidance();
        });
    } else {
        console.error('❌ launchGuidanceBtn not found!');
    }
    
    if (getMaterialsBtn) {
        console.log('✅ Adding getMaterials click listener');
        getMaterialsBtn.addEventListener('click', () => {
            console.log('📚 getMaterials clicked');
            showMaterials();
        });
    } else {
        console.error('❌ getMaterialsBtn not found!');
    }
    
    if (getInspirationBtn) {
        console.log('✅ Adding getInspiration click listener');
        getInspirationBtn.addEventListener('click', () => {
            console.log('💡 getInspiration clicked');
            checkInspirationNeeded();
        });
    } else {
        console.error('❌ getInspirationBtn not found!');
    }
    
    if (logicRepairBtn) {
        console.log('✅ Adding logicRepair click listener');
        logicRepairBtn.addEventListener('click', () => {
            console.log('🔍 logicRepair clicked');
            startLogicRepair();
        });
    } else {
        console.error('❌ logicRepairBtn not found!');
    }

    // 模态框关闭
    const closeModalBtn = document.getElementById('closeModal');
    const closeLogicModalBtn = document.getElementById('closeLogicModal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeGuidanceModal);
    if (closeLogicModalBtn) closeLogicModalBtn.addEventListener('click', closeLogicModal);

    // 工具按钮
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    
    if (saveBtn) saveBtn.addEventListener('click', saveContent);
    if (clearBtn) clearBtn.addEventListener('click', clearContent);
    if (exportBtn) exportBtn.addEventListener('click', exportContent);
    if (autoSaveToggle) autoSaveToggle.addEventListener('click', toggleAutoSave);

    // 点击模态框背景关闭
    const guidanceModal = document.getElementById('guidanceModal');
    const logicModal = document.getElementById('logicModal');
    
    console.log('📋 Modals:', {
        guidanceModal: !!guidanceModal,
        logicModal: !!logicModal
    });
    
    if (guidanceModal) {
        guidanceModal.addEventListener('click', (e) => {
            if (e.target.id === 'guidanceModal') closeGuidanceModal();
        });
    }
    if (logicModal) {
        logicModal.addEventListener('click', (e) => {
            if (e.target.id === 'logicModal') closeLogicModal();
        });
    }
    
    console.log('✅ setupEventListeners completed');
}

// =========== 启动引导功能（6步详细流程）===========
let userGuidanceAnswers = [];
let currentAISuggestion = '';

function startGuidance() {
    const modal = document.getElementById('guidanceModal');
    const content = document.getElementById('guidanceContent');
    guidanceStep = 0;
    userGuidanceAnswers = [];
    currentAISuggestion = '';
    showGuidanceQuestion(content, modal);
}

async function showGuidanceQuestion(container, modal) {
    const questions = guidanceQuestions[currentType][currentLanguage];
    if (guidanceStep >= questions.length) {
        // 收集完所有答案，生成完整大纲
        await generateDetailedOutline(userGuidanceAnswers);
        closeGuidanceModal();
        return;
    }

    const q = questions[guidanceStep];
    let html = `
        <div class="guidance-step">
            <p class="step-label">${currentLanguage === 'zh' ? '第' : 'Step '} ${guidanceStep + 1}/${questions.length} ${currentLanguage === 'zh' ? '步' : ''}</p>
            <p class="question-text">${q.question}</p>
    `;

    if (q.type === 'text') {
        // 文本输入类型
        html += `
            <div class="input-container">
                <textarea class="guidance-textarea" placeholder="${q.placeholder}" rows="4"></textarea>
                <button class="guidance-next-btn">${currentLanguage === 'zh' ? '下一步 →' : 'Next →'}</button>
            </div>
        `;
    } else if (q.type === 'ai-feedback') {
        // AI反馈类型 - 显示加载状态
        html += `
            <div class="ai-feedback-container">
                <p class="loading">🔄 ${currentLanguage === 'zh' ? 'AI正在分析你的回答...' : 'AI is analyzing your answers...'}</p>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
    modal.style.display = 'flex';

    if (q.type === 'text') {
        // 文本输入的下一步按钮
        const nextBtn = container.querySelector('.guidance-next-btn');
        const textarea = container.querySelector('.guidance-textarea');
        
        nextBtn.addEventListener('click', () => {
            const answer = textarea.value.trim();
            if (!answer) {
                showNotification(currentLanguage === 'zh' ? '请输入回答' : 'Please enter an answer');
                return;
            }
            
            userGuidanceAnswers.push({
                step: guidanceStep + 1,
                question: q.question,
                answer: answer
            });
            
            guidanceStep++;
            showGuidanceQuestion(container, modal);
        });
    } else if (q.type === 'ai-feedback' && q.needsAI) {
        // AI反馈类型 - 调用AI生成建议
        await generateAIFeedback(container, modal, q);
    }
}

async function generateAIFeedback(container, modal, q) {
    try {
        // 调用AI服务生成建议
        const result = await aiService.generateGuidanceFeedback(
            currentType,
            currentLanguage,
            userGuidanceAnswers
        );
        
        currentAISuggestion = result.message;
        
        // 显示AI建议
        const html = `
            <div class="ai-feedback-result">
                <div class="ai-suggestion">${currentAISuggestion.replace(/\n/g, '<br>')}</div>
                <div class="feedback-actions">
                    <button class="guidance-accept-btn">${currentLanguage === 'zh' ? '✓ 满意，继续' : '✓ Satisfied, Continue'}</button>
                    <button class="guidance-modify-btn">${currentLanguage === 'zh' ? '✎ 需要修改' : '✎ Need Modification'}</button>
                </div>
            </div>
        `;
        
        container.querySelector('.ai-feedback-container').innerHTML = html;
        
        // 满意按钮 - 继续下一步
        container.querySelector('.guidance-accept-btn').addEventListener('click', () => {
            userGuidanceAnswers.push({
                step: guidanceStep + 1,
                question: q.question,
                answer: currentAISuggestion,
                userAccepted: true
            });
            guidanceStep++;
            showGuidanceQuestion(container, modal);
        });
        
        // 修改按钮 - 让用户提出修改意见
        container.querySelector('.guidance-modify-btn').addEventListener('click', () => {
            showModificationInput(container, modal, q);
        });
        
    } catch (error) {
        console.error('AI反馈生成失败:', error);
        container.querySelector('.ai-feedback-container').innerHTML = `
            <p class="error">${currentLanguage === 'zh' ? '⚠️ AI暂时不可用，请稍后重试' : '⚠️ AI temporarily unavailable'}</p>
            <button class="guidance-skip-btn">${currentLanguage === 'zh' ? '跳过此步' : 'Skip this step'}</button>
        `;
        
        container.querySelector('.guidance-skip-btn').addEventListener('click', () => {
            guidanceStep++;
            showGuidanceQuestion(container, modal);
        });
    }
}

function showModificationInput(container, modal, q) {
    const html = `
        <div class="modification-input">
            <p class="modification-label">${currentLanguage === 'zh' ? '请说明你的修改意见：' : 'Please specify your modification:'}</p>
            <textarea class="guidance-textarea" placeholder="${currentLanguage === 'zh' ? '例如：第二个角度不太合适，可以换成...' : 'E.g., The second angle is not suitable, could be replaced with...'}" rows="3"></textarea>
            <button class="guidance-resubmit-btn">${currentLanguage === 'zh' ? '重新生成' : 'Regenerate'}</button>
        </div>
    `;
    
    container.querySelector('.ai-feedback-result').innerHTML = html;
    
    container.querySelector('.guidance-resubmit-btn').addEventListener('click', async () => {
        const modification = container.querySelector('.guidance-textarea').value.trim();
        if (!modification) {
            showNotification(currentLanguage === 'zh' ? '请输入修改意见' : 'Please enter modification');
            return;
        }
        
        // 将修改意见加入答案
        userGuidanceAnswers.push({
            step: guidanceStep + 1,
            question: q.question + ' (修改意见)',
            answer: modification
        });
        
        // 重新生成AI建议
        container.querySelector('.modification-input').innerHTML = `<p class="loading">🔄 ${currentLanguage === 'zh' ? 'AI正在根据你的意见重新生成...' : 'AI is regenerating based on your feedback...'}</p>`;
        await generateAIFeedback(container, modal, q);
    });
}

async function generateDetailedOutline(userAnswers) {
    // 显示加载状态
    outlinePanel.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在为你生成详细大纲（包含素材、篇幅、论证点）...' : 'AI is generating detailed outline with materials, word count, and key points...') + 
        '</p>';
    
    try {
        // 调用AI生成详细大纲
        const result = await aiService.generateDetailedOutline(
            currentType,
            currentLanguage,
            userAnswers
        );
        
        const aiOutline = result.message;
        
        // 显示AI生成的详细大纲
        outlinePanel.innerHTML = `
            <div class="detailed-outline">
                <h5>📋 ${currentLanguage === 'zh' ? '完整写作大纲' : 'Complete Writing Outline'}</h5>
                <div class="outline-content">${aiOutline.replace(/\n/g, '<br>')}</div>
                <div class="outline-hint">
                    <p>💡 ${currentLanguage === 'zh' 
                        ? '提示：大纲中已标注适配素材、建议篇幅和重要论证点，请参考进行写作。' 
                        : 'Tip: The outline includes suggested materials, word count, and key argumentation points. Please follow for writing.'}</p>
                </div>
            </div>
        `;
        
        showNotification(
            currentLanguage === 'zh' 
                ? '✓ 详细大纲已生成' 
                : '✓ Detailed outline generated'
        );
        
    } catch (error) {
        console.error('详细大纲生成失败:', error);
        
        // 降级到基础大纲
        await generateOutlineFromAnswers(userAnswers);
    }
}

async function generateOutlineFromAnswers(userAnswers = null) {
    // 显示加载状态
    outlinePanel.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在为你生成个性化大纲...' : 'AI is generating personalized outline...') + 
        '</p>';
    
    try {
        // 尝试调用AI生成个性化大纲
        if (userAnswers) {
            const result = await aiService.generateGuidanceResponse(
                currentType,
                currentLanguage,
                userAnswers
            );
            
            const aiOutline = result.message;
            
            // 显示AI生成的大纲
            outlinePanel.innerHTML = `
                <div class="ai-outline">
                    <h5>📋 ${currentLanguage === 'zh' ? 'AI个性化大纲' : 'AI Personalized Outline'}</h5>
                    <div class="outline-content">${aiOutline.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            
            showNotification(
                currentLanguage === 'zh' 
                    ? '✓ AI大纲已生成，根据你的需求定制' 
                    : '✓ AI outline generated based on your needs'
            );
            return;
        }
    } catch (error) {
        console.error('AI大纲生成失败，使用默认模板:', error);
    }
    
    // 如果AI失败，使用默认大纲
    const type = essayTypes[currentType][currentLanguage];
    const sections = type.sections;
    const placeholder = currentLanguage === 'zh' ? '在这里添加内容...' : 'Add content here...';
    
    let outlineHTML = `<div class="outline">`;
    sections.forEach((section, idx) => {
        outlineHTML += `
            <div class="outline-item" data-section="${idx}">
                <span class="section-number">${idx + 1}.</span>
                <span class="section-name">${section}</span>
                <textarea class="section-editor" placeholder="${placeholder}">
                </textarea>
            </div>
        `;
    });
    outlineHTML += `</div>`;

    outlinePanel.innerHTML = outlineHTML;

    // 大纲项点击事件
    outlinePanel.querySelectorAll('.outline-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('expanded');
        });
    });

    showNotification(
        currentLanguage === 'zh' 
            ? '✓ 大纲已生成，你可以按照大纲逐步撰写' 
            : '✓ Outline generated. Write according to the outline'
    );
}

function closeGuidanceModal() {
    document.getElementById('guidanceModal').style.display = 'none';
    guidanceStep = 0;
}

// =========== 素材推荐（5步详细流程）===========
let userMaterialPreferences = []; // 记录用户素材偏好

async function showMaterials() {
    // 步骤1：获取当前文章类型和主题
    const topic = titleInput.value.trim() || (currentLanguage === 'zh' ? '写作主题' : 'writing topic');
    
    if (!topic || topic === '写作主题' || topic === 'writing topic') {
        showNotification(
            currentLanguage === 'zh' 
                ? '请先在标题栏输入文章主题，AI将为你推荐相关素材' 
                : 'Please enter article topic in title field for material recommendations'
        );
        return;
    }
    
    // 显示素材面板并展示加载状态（步骤2：系统分析）
    materialsPanel.style.display = 'block';
    materialsList.innerHTML = `
        <p class="loading">🔄 ${currentLanguage === 'zh' 
            ? `AI正在为"${topic}"分析和筛选相关素材...` 
            : `AI is analyzing and filtering materials for "${topic}"...`}</p>
    `;

    try {
        // 调用AI服务生成素材推荐
        const result = await aiService.generateDetailedMaterials(
            currentType,
            currentLanguage,
            topic,
            currentLevel,
            userMaterialPreferences
        );
        
        // 步骤3：以卡片形式展示素材
        displayMaterialCards(result.message, topic);
        
        showNotification(
            currentLanguage === 'zh'
                ? '✓ AI素材推荐已生成'
                : '✓ AI materials generated'
        );
        
    } catch (error) {
        console.error('素材推荐失败:', error);
        
        // 降级到本地素材库
        displayFallbackMaterials(topic);
    }
}

function displayMaterialCards(aiResponse, topic) {
    // 解析AI返回的素材并格式化为卡片
    const materials = parseAIMaterials(aiResponse);
    
    let html = `
        <div class="materials-header">
            <h5>📚 ${currentLanguage === 'zh' ? '推荐素材' : 'Recommended Materials'}</h5>
            <button class="refresh-materials-btn" onclick="refreshMaterials('${topic}')">
                🔄 ${currentLanguage === 'zh' ? '换一批' : 'Refresh'}
            </button>
        </div>
    `;
    
    materials.forEach((material, idx) => {
        html += `
            <div class="material-card" data-material-id="${idx}">
                <div class="material-category">${material.category || (currentLanguage === 'zh' ? '素材' : 'Material')}</div>
                <div class="material-content">
                    ${material.content}
                </div>
                ${material.usage ? `
                    <div class="material-usage">
                        <strong>${currentLanguage === 'zh' ? '💡 使用示例：' : '💡 Usage Example:'}</strong>
                        <p>${material.usage}</p>
                    </div>
                ` : ''}
                ${material.scene ? `
                    <div class="material-scene">
                        <small>${currentLanguage === 'zh' ? '📍 适用场景：' : '📍 Suitable for:'} ${material.scene}</small>
                    </div>
                ` : ''}
                <div class="material-actions">
                    <button class="material-use-btn" onclick="useMaterial(${idx})">
                        ${currentLanguage === 'zh' ? '✓ 使用' : '✓ Use'}
                    </button>
                    <button class="material-expand-btn" onclick="expandMaterial(${idx})">
                        ${currentLanguage === 'zh' ? '查看详情' : 'Details'}
                    </button>
                </div>
            </div>
        `;
    });
    
    materialsList.innerHTML = html;
}

function parseAIMaterials(aiResponse) {
    // 解析AI返回的素材文本为结构化数据
    const materials = [];
    const lines = aiResponse.split('\n');
    let currentMaterial = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // 检测素材类别
        if (line.match(/^[\d一二三四五六七八九十]+[、\.．。]/)) {
            if (currentMaterial) {
                materials.push(currentMaterial);
            }
            currentMaterial = {
                category: currentLanguage === 'zh' ? '素材' : 'Material',
                content: line.replace(/^[\d一二三四五六七八九十]+[、\.．。]\s*/, ''),
                usage: '',
                scene: ''
            };
        } else if (line.includes('使用示例') || line.includes('Usage Example') || line.includes('引用：') || line.includes('Quote:')) {
            if (currentMaterial) {
                currentMaterial.usage = line.replace(/.*(使用示例|Usage Example|引用：|Quote:)[：:]\s*/, '');
            }
        } else if (line.includes('适用') || line.includes('Suitable') || line.includes('场景')) {
            if (currentMaterial) {
                currentMaterial.scene = line.replace(/.*(适用|Suitable|场景)[：:]\s*/, '');
            }
        } else if (line.includes('名言') || line.includes('Quote')) {
            if (currentMaterial) {
                currentMaterial.category = currentLanguage === 'zh' ? '名言警句' : 'Famous Quote';
            }
        } else if (line.includes('事例') || line.includes('Example') || line.includes('案例')) {
            if (currentMaterial) {
                currentMaterial.category = currentLanguage === 'zh' ? '典型事例' : 'Example';
            }
        } else if (currentMaterial && !currentMaterial.usage) {
            currentMaterial.content += ' ' + line;
        }
    });
    
    if (currentMaterial) {
        materials.push(currentMaterial);
    }
    
    // 如果解析失败，返回原始内容作为单个素材
    if (materials.length === 0) {
        materials.push({
            category: currentLanguage === 'zh' ? '推荐素材' : 'Recommended Material',
            content: aiResponse,
            usage: '',
            scene: ''
        });
    }
    
    return materials;
}

function displayFallbackMaterials(topic) {
    const materials = materialLibrary[currentType][currentLanguage].materials;
    let html = `
        <p class="fallback-notice">⚠️ ${currentLanguage === 'zh' 
            ? '使用本地素材库（AI暂时不可用）' 
            : 'Using local materials (AI unavailable)'}</p>
        <div class="materials-header">
            <h5>📚 ${currentLanguage === 'zh' ? '推荐素材' : 'Recommended Materials'}</h5>
        </div>
    `;

    materials.forEach((group, gidx) => {
        group.examples.forEach((example, eidx) => {
            html += `
                <div class="material-card">
                    <div class="material-category">${group.category}</div>
                    <div class="material-content">"${example}"</div>
                    <div class="material-actions">
                        <button class="material-use-btn" onclick="useMaterialText('${example.replace(/'/g, "\\'")}')">
                            ${currentLanguage === 'zh' ? '✓ 使用' : '✓ Use'}
                        </button>
                    </div>
                </div>
            `;
        });
    });

    materialsList.innerHTML = html;
}

// 步骤4：用户操作素材
function useMaterial(materialId) {
    const card = document.querySelector(`.material-card[data-material-id="${materialId}"]`);
    if (!card) return;
    
    const content = card.querySelector('.material-content').textContent;
    
    // 将素材插入到编辑器当前光标位置
    const editor = document.getElementById('mainEditor');
    const cursorPos = editor.selectionStart;
    const textBefore = editor.value.substring(0, cursorPos);
    const textAfter = editor.value.substring(cursorPos);
    
    editor.value = textBefore + '\n' + content + '\n' + textAfter;
    editor.focus();
    
    // 步骤5：记录用户偏好
    userMaterialPreferences.push({
        materialId: materialId,
        content: content,
        type: currentType,
        timestamp: Date.now()
    });
    
    // 标记已使用
    card.classList.add('material-used');
    
    showNotification(
        currentLanguage === 'zh' 
            ? '✓ 素材已插入到文章中' 
            : '✓ Material inserted into article'
    );
    
    updateStats();
}

function useMaterialText(text) {
    const editor = document.getElementById('mainEditor');
    const cursorPos = editor.selectionStart;
    const textBefore = editor.value.substring(0, cursorPos);
    const textAfter = editor.value.substring(cursorPos);
    
    editor.value = textBefore + '\n' + text + '\n' + textAfter;
    editor.focus();
    
    showNotification(
        currentLanguage === 'zh' 
            ? '✓ 素材已插入到文章中' 
            : '✓ Material inserted into article'
    );
    
    updateStats();
}

function expandMaterial(materialId) {
    const card = document.querySelector(`.material-card[data-material-id="${materialId}"]`);
    if (!card) return;
    
    card.classList.toggle('material-expanded');
    
    const btn = card.querySelector('.material-expand-btn');
    if (card.classList.contains('material-expanded')) {
        btn.textContent = currentLanguage === 'zh' ? '收起' : 'Collapse';
    } else {
        btn.textContent = currentLanguage === 'zh' ? '查看详情' : 'Details';
    }
}

async function refreshMaterials(topic) {
    materialsList.innerHTML = `<p class="loading">🔄 ${currentLanguage === 'zh' 
        ? '正在为你推荐新一批素材...' 
        : 'Loading new materials...'}</p>`;
    
    try {
        const result = await aiService.generateDetailedMaterials(
            currentType,
            currentLanguage,
            topic,
            currentLevel,
            userMaterialPreferences
        );
        
        displayMaterialCards(result.message, topic);
        
    } catch (error) {
        console.error('刷新素材失败:', error);
        displayFallbackMaterials(topic);
    }
}

// =========== 灵感提示和卡顿检测 ===========
function setupKeystrokeTracking() {
    let lastKeystroke = Date.now();
    
    mainEditor.addEventListener('keydown', () => {
        lastKeystroke = Date.now();
    });

    // 每30秒检测一次卡顿
    setInterval(() => {
        const timeSinceLastKeystroke = Date.now() - lastKeystroke;
        if (timeSinceLastKeystroke > 30000 && mainEditor.value.length > 0) {
            checkInspirationNeeded();
        }
    }, 30000);
}

async function checkInspirationNeeded() {
    const text = mainEditor.value;
    
    if (!text || text.length < 50) {
        showNotification(
            currentLanguage === 'zh'
                ? '请先写入一些内容，AI才能提供针对性建议'
                : 'Please write some content first for personalized tips'
        );
        return;
    }
    
    const wordCount = currentLanguage === 'zh'
        ? text.replace(/[^\u4e00-\u9fa5]/g, '').length
        : text.trim().split(/\s+/).filter(w => w).length;

    // 显示加载状态
    aiOutput.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在分析你的文章，生成灵感提示...' : 'AI is analyzing your writing...') + 
        '</p>';

    try {
        const targetWords = essayTypes[currentType][currentLanguage].targetWords;
        const hasTarget = Number.isFinite(targetWords) && targetWords > 0;
        
        // 调用AI服务
        const result = await aiService.generateInspiration(
            currentType, 
            currentLanguage, 
            text, 
            wordCount, 
            targetWords
        );
        
        const aiTip = result.message;
        const progress = hasTarget ? (wordCount / targetWords * 100).toFixed(0) : null;
        
        aiOutput.innerHTML = `
            <p class="suggestion">💡 ${aiTip}</p>
            <p class="progress-info">📊 ${
                hasTarget
                    ? (currentLanguage === 'zh'
                        ? `当前进度: ${wordCount}/${targetWords} 字 (${progress}%)`
                        : `Progress: ${wordCount}/${targetWords} words (${progress}%)`)
                    : (currentLanguage === 'zh'
                        ? `当前字数: ${wordCount} 字`
                        : `Current words: ${wordCount}`)
            }</p>
        `;
        
        showNotification(
            currentLanguage === 'zh'
                ? '💡 AI灵感提示已生成'
                : '💡 AI inspiration generated'
        );
        
    } catch (error) {
        console.error('灵感提示失败:', error);
        
        // 降级到本地提示
        const tips = inspirationTips[currentType][currentLanguage];
        const tip = wordCount < essayTypes[currentType][currentLanguage].targetWords / 2
            ? tips.stallTips[Math.floor(Math.random() * tips.stallTips.length)]
            : tips.progressTips[Math.floor(Math.random() * tips.progressTips.length)];
        
        aiOutput.innerHTML = `<p class="suggestion">${tip}</p>`;
    }
}

// =========== 逻辑修补 ===========
// =========== 逻辑修补（引导式提问）===========
let userLogicAnswers = [];

async function startLogicRepair() {
    if (mainEditor.value.length === 0) {
        showNotification(
            currentLanguage === 'zh'
                ? '请先写入一些内容'
                : 'Please write some content first'
        );
        return;
    }

    const modal = document.getElementById('logicModal');
    const content = document.getElementById('logicContent');
    userLogicAnswers = [];
    
    // 显示加载状态
    content.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在分析你的文章，生成引导性问题...' : 'AI is analyzing your article to generate guiding questions...') + 
        '</p>';
    modal.style.display = 'flex';

    try {
        // 调用AI生成针对性问题
        const result = await aiService.generateLogicQuestions(
            currentType,
            currentLanguage,
            mainEditor.value
        );
        
        const aiQuestions = result.message;
        
        // 将AI返回的问题按行分割
        const questionsList = parseLogicQuestions(aiQuestions);
        let questionIdx = 0;

        function showLogicQuestion() {
            if (questionIdx >= questionsList.length) {
                // 所有问题完成，生成总结
                showLogicSummary();
                return;
            }

            const q = questionsList[questionIdx];
            content.innerHTML = `
                <div class="logic-question">
                    <p class="question-label">${currentLanguage === 'zh' ? '🔍 问题' : '🔍 Question'} ${questionIdx + 1}/${questionsList.length}</p>
                    <p class="question-text">${q}</p>
                    <p class="question-hint">${currentLanguage === 'zh' 
                        ? '💭 请认真思考这个问题，并诚实地回答。这有助于你发现文章中的不足之处。' 
                        : '💭 Think carefully about this question and answer honestly. This helps you discover weaknesses in your article.'}</p>
                    <textarea class="logic-answer" placeholder="${currentLanguage === 'zh' ? '在这里写下你的回答和思考...' : 'Write your answer and thoughts here...'}" rows="4"></textarea>
                    <div class="logic-buttons">
                        <button class="primary-btn" id="submitAnswer">
                            ${currentLanguage === 'zh' ? '✓ 提交回答' : '✓ Submit Answer'}
                        </button>
                        <button class="secondary-btn" id="skipQuestion">
                            ${currentLanguage === 'zh' ? '→ 跳过' : '→ Skip'}
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('submitAnswer').addEventListener('click', async () => {
                const answer = content.querySelector('.logic-answer').value.trim();
                if (!answer) {
                    showNotification(currentLanguage === 'zh' ? '请输入回答' : 'Please enter an answer');
                    return;
                }
                
                // 记录用户回答
                userLogicAnswers.push({
                    question: q,
                    answer: answer
                });
                
                // 显示AI针对回答的建议
                await showAnswerFeedback(q, answer, questionIdx, questionsList.length);
            });

            document.getElementById('skipQuestion').addEventListener('click', () => {
                questionIdx++;
                showLogicQuestion();
            });
        }

        async function showAnswerFeedback(question, answer, currentIdx, total) {
            content.innerHTML = '<p class="loading">🔄 ' + 
                (currentLanguage === 'zh' ? 'AI正在根据你的回答提供建议...' : 'AI is providing suggestions based on your answer...') + 
                '</p>';
            
            try {
                // 调用AI生成针对性建议
                const result = await aiService.generateLogicFeedback(
                    currentType,
                    currentLanguage,
                    question,
                    answer,
                    mainEditor.value.substring(0, 500)
                );
                
                const feedback = result.message;
                
                content.innerHTML = `
                    <div class="logic-feedback">
                        <p class="feedback-header">💡 ${currentLanguage === 'zh' ? 'AI建议' : 'AI Suggestion'}</p>
                        <div class="feedback-content">${feedback.replace(/\n/g, '<br>')}</div>
                        <p class="feedback-hint">${currentLanguage === 'zh' 
                            ? '提示：请不要让AI代替你修改，而是根据建议自己思考并改进文章。' 
                            : 'Tip: Don\'t let AI make changes for you. Think and improve your article based on suggestions.'}</p>
                        <div class="logic-buttons">
                            <button class="primary-btn" id="nextQuestion">
                                ${currentLanguage === 'zh' ? '明白了，继续 →' : 'Got it, Continue →'}
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('nextQuestion').addEventListener('click', () => {
                    questionIdx++;
                    showLogicQuestion();
                });
                
            } catch (error) {
                console.error('反馈生成失败:', error);
                // 直接进入下一个问题
                questionIdx++;
                showLogicQuestion();
            }
        }

        function showLogicSummary() {
            const answeredCount = userLogicAnswers.length;
            content.innerHTML = `
                <div class="logic-complete">
                    <h3>✓ ${currentLanguage === 'zh' ? '逻辑检查完成' : 'Logic Check Complete'}</h3>
                    <p>${currentLanguage === 'zh' 
                        ? `你已经回答了 ${answeredCount} 个问题，认真思考了文章的逻辑。` 
                        : `You answered ${answeredCount} questions and thoughtfully reviewed your article's logic.`}</p>
                    <p class="summary-hint">${currentLanguage === 'zh' 
                        ? '💡 建议：现在回到文章，根据刚才的思考和AI建议，自己动手改进文章的逻辑和表达。' 
                        : '💡 Suggestion: Return to your article and improve its logic and expression based on your thoughts and AI suggestions.'}</p>
                    <div class="logic-buttons">
                        <button class="primary-btn" id="closeLogicBtn">
                            ${currentLanguage === 'zh' ? '返回继续写作' : 'Return to Writing'}
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('closeLogicBtn').addEventListener('click', closeLogicModal);
        }

        showLogicQuestion();
        
    } catch (error) {
        console.error('逻辑修补失败:', error);
        
        // 降级到本地问题库
        const questions = logicRepairQuestions[currentType][currentLanguage];
        let questionIdx = 0;

        function showLogicQuestion() {
            if (questionIdx >= questions.length) {
                content.innerHTML = `
                    <div class="logic-complete">
                        <p>✓ ${currentLanguage === 'zh' 
                            ? '你已经完成了逻辑修补检查。根据这些问题反思并改进你的文章。' 
                            : 'Logic repair complete. Reflect on these questions and improve your article.'}</p>
                        <button class="primary-btn" id="closeLogicBtn">
                            ${currentLanguage === 'zh' ? '返回写作' : 'Return to Writing'}
                        </button>
                    </div>
                `;
                document.getElementById('closeLogicBtn')?.addEventListener('click', closeLogicModal);
                return;
            }

            const q = questions[questionIdx];
            content.innerHTML = `
                <div class="logic-question">
                    <p class="question-label">${currentLanguage === 'zh' ? '🔍 问题' : '🔍 Question'} ${questionIdx + 1}/${questions.length}</p>
                    <p class="question-text">${q}</p>
                    <textarea class="logic-answer" placeholder="${currentLanguage === 'zh' ? '在这里记录你的思考...' : 'Record your thoughts here...'}"></textarea>
                    <div class="logic-buttons">
                        <button class="secondary-btn" id="nextQuestion">
                            ${currentLanguage === 'zh' ? '下一个问题 →' : 'Next →'}
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('nextQuestion').addEventListener('click', () => {
                questionIdx++;
                showLogicQuestion();
            });
        }

        showLogicQuestion();
    }
}

function parseLogicQuestions(aiResponse) {
    // 解析AI返回的问题列表
    const lines = aiResponse.split('\n').filter(line => line.trim().length > 0);
    const questions = [];
    
    for (const line of lines) {
        // 清理行号和标点
        const cleaned = line
            .replace(/^[\d一二三四五六七八九十]+[、\.．。:：]\s*/, '')
            .replace(/^[•\-\*]\s*/, '')
            .trim();
        
        if (cleaned.length > 10) { // 确保是有效问题
            questions.push(cleaned);
        }
    }
    
    return questions.length > 0 ? questions : [aiResponse];
}

function closeLogicModal() {
    document.getElementById('logicModal').style.display = 'none';
    userLogicAnswers = [];
}

// =========== 模板更新 ===========
function updateTemplate() {
    const template = essayTypes[currentType][currentLanguage];
    templateInfo.innerHTML = `<p>📝 ${template.name} - ${template.level} | ${template.description}</p>`;
    mainEditor.placeholder = template.placeholder;
    updateStats();
}

// =========== 统计信息更新 ===========
function updateStats() {
    const text = mainEditor.value;
    const chars = text.length;

    let words;
    if (currentLanguage === 'zh') {
        words = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    } else {
        words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    const paragraphs = text.split('\n').filter(p => p.trim().length > 0).length;
    
    // 更新基础统计
    charCount.textContent = chars;
    wordCount.textContent = words;
    paraCount.textContent = paragraphs;
    
    // 计算目标和进度
    const targetWords = essayTypes[currentType][currentLanguage].targetWords;
    if (Number.isFinite(targetWords) && targetWords > 0) {
        const progress = Math.min(100, ((words / targetWords) * 100).toFixed(1));
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressBar').style.width = progress + '%';
        
        const targetInfo = currentLanguage === 'zh' 
            ? `目标: ${targetWords}字 (还需${Math.max(0, targetWords - words)}字)` 
            : `Target: ${targetWords} words (${Math.max(0, targetWords - words)} more)`;
        document.getElementById('targetInfo').textContent = targetInfo;
    } else {
        document.getElementById('progressPercent').textContent = currentLanguage === 'zh' ? '—' : '—';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('targetInfo').textContent = currentLanguage === 'zh'
            ? '目标: 无限制'
            : 'Target: No limit';
    }
    
    // 计算写作时长
    if (text.length > 0) {
        if (!writingStartTime) {
            writingStartTime = Date.now();
        }
        
        // 累计写作时间（只在有输入时累计）
        const now = Date.now();
        if (now - lastStatsUpdate < 5000) { // 5秒内有活动视为连续写作
            totalWritingTime += (now - lastStatsUpdate) / 1000;
        }
        lastStatsUpdate = now;
        
        const minutes = Math.floor(totalWritingTime / 60);
        const timeText = currentLanguage === 'zh'
            ? `${minutes}分钟`
            : `${minutes} min`;
        document.getElementById('writingTime').textContent = timeText;
        
        // 计算写作速度（字/分钟）
        if (minutes > 0) {
            const speed = Math.round(words / minutes);
            const speedText = currentLanguage === 'zh'
                ? `${speed} 字/分钟`
                : `${speed} words/min`;
            document.getElementById('writingSpeed').textContent = speedText;
        }
    } else {
        // 重置时间
        writingStartTime = null;
        totalWritingTime = 0;
        lastStatsUpdate = Date.now();
        document.getElementById('writingTime').textContent = currentLanguage === 'zh' ? '0分钟' : '0 min';
        document.getElementById('writingSpeed').textContent = '-';
    }
}

// =========== 保存功能 ===========
let saveTimeout;

function saveContent() {
    const content = {
        type: currentType,
        level: currentLevel,
        language: currentLanguage,
        title: titleInput.value,
        text: mainEditor.value,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('currentContent', JSON.stringify(content));
    contentHistory.unshift(content);
    if (contentHistory.length > 10) contentHistory.pop();
    localStorage.setItem('contentHistory', JSON.stringify(contentHistory));

    const now = new Date().toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
    document.getElementById('lastSaved').textContent = now;

    showNotification(currentLanguage === 'zh' ? '✓ 已保存' : '✓ Saved');
}

function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveContent, 2000);
}

function loadSavedContent() {
    const saved = localStorage.getItem('currentContent');
    if (saved) {
        const content = JSON.parse(saved);
        currentType = content.type || 'argumentative';
        currentLevel = content.level || 'high-school';
        currentLanguage = content.language || 'zh';
        titleInput.value = content.title || '';
        mainEditor.value = content.text || '';

        const btn = document.querySelector(`[data-type="${currentType}"]`);
        if (btn) btn.classList.add('active');
        const radio = document.querySelector(`input[value="${currentLanguage}"]`);
        if (radio) radio.checked = true;

        updateStats();
        updateTemplate();
    }

    const history = localStorage.getItem('contentHistory');
    if (history) contentHistory = JSON.parse(history);
}

function clearContent() {
    const confirmText = currentLanguage === 'zh'
        ? '确定要清空内容吗？此操作不可撤销。'
        : 'Clear all content? This cannot be undone.';

    if (confirm(confirmText)) {
        titleInput.value = '';
        mainEditor.value = '';
        updateStats();
        showNotification(currentLanguage === 'zh' ? '✓ 已清空' : '✓ Cleared');
    }
}

function exportContent() {
    const title = titleInput.value || (currentLanguage === 'zh' ? '未命名文档' : 'Untitled');
    const text = mainEditor.value;

    if (!text) {
        alert(currentLanguage === 'zh' ? '没有内容可导出' : 'No content to export');
        return;
    }

    const content = `${title}\n${'='.repeat(title.length)}\n\n${text}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification(currentLanguage === 'zh' ? '✓ 已导出' : '✓ Exported');
}

function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    const statusZh = autoSaveEnabled ? '开启' : '关闭';
    const statusEn = autoSaveEnabled ? 'ON' : 'OFF';
    document.getElementById('autoSaveStatus').textContent = statusZh;
    document.getElementById('autoSaveStatusEn').textContent = statusEn;
    showNotification(
        currentLanguage === 'zh'
            ? `自动保存已${statusZh}`
            : `Auto-save ${statusEn}`
    );
}

// =========== 通知函数 ===========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #50c878;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .guidance-step, .logic-question {
        padding: 1.5rem;
    }
    .step-label {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    .question-text {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        color: #2c3e50;
        font-weight: 500;
    }
    .options-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .option-btn {
        padding: 0.75rem 1rem;
        border: 2px solid #4a90e2;
        background: white;
        color: #4a90e2;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
    }
    .option-btn:hover {
        background: #4a90e2;
        color: white;
    }
    .outline {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .outline-item {
        padding: 0.75rem;
        background: #f8f9fa;
        border-left: 4px solid #4a90e2;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .outline-item:hover {
        background: #e8f0ff;
    }
    .outline-item.expanded .section-editor {
        display: block;
    }
    .section-number {
        font-weight: bold;
        color: #4a90e2;
    }
    .section-editor {
        display: none;
        width: 100%;
        min-height: 100px;
        margin-top: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
    }
    .material-group {
        margin-bottom: 1rem;
    }
    .material-group h5 {
        color: #4a90e2;
        margin-bottom: 0.5rem;
    }
    .material-group ul {
        list-style: none;
        padding-left: 1rem;
    }
    .material-group li {
        padding: 0.5rem 0;
        color: #2c3e50;
        border-bottom: 1px solid #ecf0f1;
    }
    .logic-answer {
        width: 100%;
        min-height: 120px;
        padding: 0.75rem;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        margin: 1rem 0;
        font-family: inherit;
    }
    .logic-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .logic-complete {
        padding: 2rem;
        text-align: center;
        background: #f0fff4;
        border-radius: 8px;
    }
`;
document.head.appendChild(style);

// 诊断函数 - 用于调试事件监听器问题
function runDiagnostics() {
    console.log('=== 🔍 开始诊断 ===');
    console.log('');
    
    // 检查 DOM 元素
    console.log('📋 1. DOM 元素检查:');
    const buttons = {
        '启动引导': 'launchGuidance',
        '素材推荐': 'getMaterials',
        '灵感提示': 'getInspiration',
        '逻辑修补': 'logicRepair',
        '保存': 'saveBtn',
        '清空': 'clearBtn',
        '导出': 'exportBtn',
        '自动保存': 'autoSaveToggle'
    };
    
    Object.entries(buttons).forEach(([name, id]) => {
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`  ✅ ${name} (${id}): 找到`);
            console.log(`     - 显示状态: ${btn.style.display || '默认'}`);
            console.log(`     - 禁用状态: ${btn.disabled}`);
            console.log(`     - pointer-events: ${window.getComputedStyle(btn).pointerEvents}`);
        } else {
            console.log(`  ❌ ${name} (${id}): 未找到`);
        }
    });
    
    console.log('');
    console.log('📋 2. 事件监听器检查:');
    Object.entries(buttons).forEach(([name, id]) => {
        const btn = document.getElementById(id);
        if (btn) {
            const listeners = getEventListeners(btn);
            if (listeners && listeners.click) {
                console.log(`  ✅ ${name}: 有 ${listeners.click.length} 个 click 监听器`);
            } else {
                console.log(`  ⚠️ ${name}: 没有找到 click 监听器`);
            }
        }
    });
    
    console.log('');
    console.log('📋 3. 函数检查:');
    const functions = [
        'startGuidance',
        'showMaterials',
        'checkInspirationNeeded',
        'startLogicRepair',
        'saveContent',
        'clearContent',
        'exportContent'
    ];
    
    functions.forEach(fnName => {
        if (typeof window[fnName] === 'function') {
            console.log(`  ✅ ${fnName}: 存在`);
        } else {
            console.log(`  ❌ ${fnName}: 未找到`);
        }
    });
    
    console.log('');
    console.log('📋 4. 全局变量检查:');
    console.log(`  - currentType: ${currentType}`);
    console.log(`  - currentLanguage: ${currentLanguage}`);
    console.log(`  - currentLevel: ${currentLevel}`);
    console.log(`  - autoSaveEnabled: ${autoSaveEnabled}`);
    
    console.log('');
    console.log('📋 5. 手动测试点击:');
    console.log('  执行: document.getElementById("launchGuidance").click()');
    console.log('');
    console.log('=== 诊断完成 ===');
}

// 使诊断函数在全局作用域可用
window.runDiagnostics = runDiagnostics;
console.log('💡 诊断函数已加载，在控制台输入: runDiagnostics() 来运行诊断');
