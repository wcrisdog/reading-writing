// ============================================
// 智引文思 - 智能写作平台 v2.0
// 核心功能：启动引导、素材推荐、灵感提示、优化修补
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
let targetWordsConfig = {
    argumentative: 800,
    narrative: 600
};
let currentRightPanelView = 'outline';
let optimizationRecords = [];
let rawPromptInput = ''; // 保存原始题目输入

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
            targetWords: 600,
            placeholder: '讲述一个生动的故事...\n\n写作要素：\n1. 清晰的时间地点\n2. 鲜明的人物形象\n3. 详细的场景描写\n4. 深刻的思想内涵',
            sections: ['背景交代', '事件发展', '高潮描写', '结尾感悟']
        },
        en: {
            name: 'Narrative Essay',
            level: 'High School',
            description: 'A vivid storytelling essay with characters and events',
            targetWords: 600,
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

// =========== 优化修补问题 ===========
const optimizationQuestions = {
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
let templateInfo, aiOutput, outlinePanel, optimizationPanel, materialsList, materialsPanel;
let targetWordsSelect, targetSelectorWrap, targetSelectorLabel;

function showOutlineResultModal(contentHtml) {
    const modal = document.getElementById('outlineResultModal');
    const content = document.getElementById('outlineResultContent');
    if (!modal || !content) return;

    content.innerHTML = contentHtml;
    modal.style.display = 'flex';
}

function closeOutlineResultModal() {
    const modal = document.getElementById('outlineResultModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showAILoadingModal() {
    const modal = document.getElementById('aiLoadingModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAILoadingModal() {
    const modal = document.getElementById('aiLoadingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

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
    optimizationPanel = document.getElementById('optimizationPanel');
    materialsList = document.getElementById('materialsList');
    materialsPanel = document.getElementById('materialsPanel');
    targetWordsSelect = document.getElementById('targetWordsSelect');
    targetSelectorWrap = document.getElementById('targetSelectorWrap');
    targetSelectorLabel = document.getElementById('targetSelectorLabel');
    
    console.log('✅ DOM elements fetched:', {
        mainEditor: !!mainEditor,
        titleInput: !!titleInput,
        templateInfo: !!templateInfo,
        aiOutput: !!aiOutput
    });
    
    // 初始化应用
    loadSavedContent();
    applyTargetWordsConfig();
    updateTemplate();
    setupEventListeners();
    initializeRightPanelTabs();
    renderOptimizationRecords();
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
            const newType = e.target.dataset.type;
            const newLevel = e.target.dataset.level;
            changeEssayType(newType, newLevel, e.target);
        });
    });

    // 语言切换
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            console.log('🌍 language changed:', e.target.value);
            currentLanguage = e.target.value;
            updateTemplate();
            renderOptimizationRecords();
        });
    });

    if (targetWordsSelect) {
        targetWordsSelect.addEventListener('change', (e) => {
            const value = Number(e.target.value);
            if (!Number.isFinite(value) || value <= 0) return;
            updateTargetWords(value);
        });
    }

    const viewOutlineBtn = document.getElementById('viewOutlineBtn');
    const viewLogicBtn = document.getElementById('viewLogicBtn');
    if (viewOutlineBtn) {
        viewOutlineBtn.addEventListener('click', () => switchRightPanel('outline'));
    }
    if (viewLogicBtn) {
        viewLogicBtn.addEventListener('click', () => switchRightPanel('logic'));
    }

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
    const optimizationBtn = document.getElementById('optimization');
    const inputRawPromptBtn = document.getElementById('inputRawPrompt');
    
    console.log('🎯 Button elements:', {
        launchGuidance: !!launchGuidanceBtn,
        getMaterials: !!getMaterialsBtn,
        getInspiration: !!getInspirationBtn,
        optimization: !!optimizationBtn,
        inputRawPrompt: !!inputRawPromptBtn
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
    
    if (optimizationBtn) {
        console.log('✅ Adding optimization click listener');
        optimizationBtn.addEventListener('click', () => {
            console.log('🔍 optimization clicked');
            startOptimization();
        });
    } else {
        console.error('❌ optimizationBtn not found!');
    }

    if (inputRawPromptBtn) {
        console.log('✅ Adding inputRawPrompt click listener');
        inputRawPromptBtn.addEventListener('click', () => {
            console.log('📝 inputRawPrompt clicked');
            openRawPromptModal();
        });
    } else {
        console.error('❌ inputRawPromptBtn not found!');
    }
    
    // 写作完成按钮
    const finishWritingBtn = document.getElementById('finishWritingBtn');
    
    if (finishWritingBtn) {
        finishWritingBtn.addEventListener('click', () => {
            finishWriting();
        });
    }

    // 模态框关闭
    const closeModalBtn = document.getElementById('closeModal');
    const closeOptimizationModalBtn = document.getElementById('closeOptimizationModal');
    const closeOutlineResultModalBtn = document.getElementById('closeOutlineResultModal');
    const closeRawPromptModalBtn = document.getElementById('closeRawPromptModal');
    const startWritingFromOutlineBtn = document.getElementById('startWritingFromOutline');
    const enlargeOutlineBtn = document.getElementById('enlargeOutlineBtn');
    const enlargeOutlineFromPanelBtn = document.getElementById('enlargeOutlineFromPanelBtn');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeGuidanceModal);
    if (closeOptimizationModalBtn) closeOptimizationModalBtn.addEventListener('click', closeOptimizationModal);
    if (closeOutlineResultModalBtn) closeOutlineResultModalBtn.addEventListener('click', closeOutlineResultModal);
    if (closeRawPromptModalBtn) closeRawPromptModalBtn.addEventListener('click', closeRawPromptModal);
    
    // 原始题目模态框事件
    const submitRawPromptBtn = document.getElementById('submitRawPromptBtn');
    const cancelRawPromptBtn = document.getElementById('cancelRawPromptBtn');
    const rawPromptInput_elem = document.getElementById('rawPromptInput');
    
    if (submitRawPromptBtn) {
        submitRawPromptBtn.addEventListener('click', () => {
            if (rawPromptInput_elem) {
                rawPromptInput = rawPromptInput_elem.value.trim();
                if (rawPromptInput) {
                    closeRawPromptModal();
                    showNotification(
                        currentLanguage === 'zh' 
                            ? '✓ 原始题目已保存，现在可以启动引导' 
                            : '✓ Original prompt saved, now you can start guidance'
                    );
                } else {
                    showNotification(
                        currentLanguage === 'zh' 
                            ? '请输入题目内容' 
                            : 'Please enter prompt content'
                    );
                }
            }
        });
    }
    
    if (cancelRawPromptBtn) {
        cancelRawPromptBtn.addEventListener('click', closeRawPromptModal);
    }
    if (startWritingFromOutlineBtn) {
        startWritingFromOutlineBtn.addEventListener('click', () => {
            closeOutlineResultModal();
            switchRightPanel('outline');
            mainEditor?.focus();
        });
    }
    if (enlargeOutlineBtn) {
        enlargeOutlineBtn.addEventListener('click', () => {
            // 获取右下角大纲的内容并在弹窗中显示
            const outlineContent = outlinePanel.innerHTML;
            showOutlineResultModal(outlineContent);
        });
    }
    if (enlargeOutlineFromPanelBtn) {
        enlargeOutlineFromPanelBtn.addEventListener('click', () => {
            // 从右下角面板放大查看大纲
            const outlineContent = outlinePanel.innerHTML;
            if (outlineContent && outlineContent.trim()) {
                showOutlineResultModal(outlineContent);
            } else {
                showNotification(
                    currentLanguage === 'zh' 
                        ? '暂无写作计划，请先完成启动引导' 
                        : 'No writing plan available, please complete the guidance first',
                    'warning'
                );
            }
        });
    }

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
    const optimizationModal = document.getElementById('optimizationModal');
    const outlineResultModal = document.getElementById('outlineResultModal');
    const rawPromptModal = document.getElementById('rawPromptModal');
    
    console.log('📋 Modals:', {
        guidanceModal: !!guidanceModal,
        optimizationModal: !!optimizationModal,
        rawPromptModal: !!rawPromptModal
    });
    
    if (guidanceModal) {
        guidanceModal.addEventListener('click', (e) => {
            if (e.target.id === 'guidanceModal') closeGuidanceModal();
        });
    }
    if (optimizationModal) {
        optimizationModal.addEventListener('click', (e) => {
            if (e.target.id === 'optimizationModal') closeOptimizationModal();
        });
    }
    if (outlineResultModal) {
        outlineResultModal.addEventListener('click', (e) => {
            if (e.target.id === 'outlineResultModal') closeOutlineResultModal();
        });
    }
    if (rawPromptModal) {
        rawPromptModal.addEventListener('click', (e) => {
            if (e.target.id === 'rawPromptModal') closeRawPromptModal();
        });
    }
    
    console.log('✅ setupEventListeners completed');
}

// =========== 启动引导功能（6步详细流程）===========
let userGuidanceAnswers = [];
let currentAISuggestion = '';

function setGuidanceAnswer(record) {
    const index = userGuidanceAnswers.findIndex(a => a.step === record.step);
    if (index >= 0) {
        userGuidanceAnswers[index] = { ...userGuidanceAnswers[index], ...record };
    } else {
        userGuidanceAnswers.push(record);
        userGuidanceAnswers.sort((a, b) => a.step - b.step);
    }
}

function getGuidanceAnswer(step) {
    return userGuidanceAnswers.find(a => a.step === step);
}

function pruneGuidanceAnswersFrom(step) {
    userGuidanceAnswers = userGuidanceAnswers.filter(a => a.step < step);
}

function startGuidance() {
    const modal = document.getElementById('guidanceModal');
    const content = document.getElementById('guidanceContent');
    guidanceStep = 0;
    userGuidanceAnswers = [];
    currentAISuggestion = '';
    
    // 如果用户输入了原始题目，作为第0步添加到引导回答中
    if (rawPromptInput) {
        userGuidanceAnswers.push({
            step: 0,
            question: currentLanguage === 'zh' ? '原始题目' : 'Original Prompt',
            answer: rawPromptInput
        });
    }
    
    showGuidanceQuestion(content, modal);
}

async function showGuidanceQuestion(container, modal) {
    const questions = guidanceQuestions[currentType][currentLanguage];
    if (guidanceStep >= questions.length) {
        // 收集完所有答案，先关闭引导窗口
        closeGuidanceModal();
        
        // 显示AI正在生成的加载窗口
        showAILoadingModal();
        
        try {
            // 生成完整大纲
            outlinePanel.style.display = 'block';
            const outlineHtml = await generateDetailedOutline(userGuidanceAnswers);
            
            // 关闭加载窗口
            closeAILoadingModal();
            
            // 切换到写作计划面板
            switchRightPanel('outline');
            
            // 显示提示通知
            showNotification(
                currentLanguage === 'zh' 
                    ? '✓ 写作计划已生成！你可以随时在右下角查看或点击放大' 
                    : '✓ Writing plan generated! You can view it in the bottom right corner or click to enlarge',
                'success',
                5000
            );
        } catch (error) {
            console.error('生成大纲失败:', error);
            closeAILoadingModal();
            showNotification(
                currentLanguage === 'zh' 
                    ? '⚠️ 大纲生成失败，请重试' 
                    : '⚠️ Outline generation failed, please try again',
                'error'
            );
        }
        
        return;
    }

    const q = questions[guidanceStep];
    let html = `
        <div class="guidance-step">
            <p class="step-label">${currentLanguage === 'zh' ? '第' : 'Step '} ${guidanceStep + 1}/${questions.length} ${currentLanguage === 'zh' ? '步' : ''}</p>
            <p class="question-text">${q.question}</p>
    `;

    if (q.type === 'text') {
        const existingAnswer = getGuidanceAnswer(guidanceStep + 1);
        // 文本输入类型
        html += `
            <div class="input-container">
                <textarea class="guidance-textarea" placeholder="${q.placeholder}" rows="4">${existingAnswer?.answer || ''}</textarea>
                <div style="display: flex; gap: 12px;">
                    <button class="guidance-next-btn" style="flex: 1;">${currentLanguage === 'zh' ? '下一步 →' : 'Next →'}</button>
                </div>
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
        
        // 添加返回上一步按钮的容器
        const buttonContainer = nextBtn.parentElement;
        if (guidanceStep > 0) {
            const backBtn = document.createElement('button');
            backBtn.className = 'guidance-back-btn';
            backBtn.textContent = currentLanguage === 'zh' ? '← 上一步' : '← Back';
            backBtn.style.marginRight = '12px';
            backBtn.style.background = 'var(--text-secondary)';
            backBtn.addEventListener('click', () => {
                guidanceStep--;
                showGuidanceQuestion(container, modal);
            });
            buttonContainer.insertBefore(backBtn, nextBtn);
        }
        
        nextBtn.addEventListener('click', () => {
            const answer = textarea.value.trim();
            if (!answer) {
                showNotification(currentLanguage === 'zh' ? '请输入回答' : 'Please enter an answer');
                return;
            }

            pruneGuidanceAnswersFrom(guidanceStep + 2);
            setGuidanceAnswer({
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

async function generateAIFeedback(container, modal, q, modification = '') {
    try {
        const feedbackContext = modification
            ? [...userGuidanceAnswers.filter(a => a.step !== guidanceStep + 1), {
                step: guidanceStep + 1,
                question: `${q.question} (${currentLanguage === 'zh' ? '修改意见' : 'Modification'})`,
                answer: modification
            }]
            : userGuidanceAnswers;

        // 调用AI服务生成建议
        const result = await aiService.generateGuidanceFeedback(
            currentType,
            currentLanguage,
            feedbackContext
        );
        
        currentAISuggestion = result.message;
        
        // 显示AI建议（增加“回退到上一步”选项，保留用户输入）

        const html = `
            <div class="ai-feedback-result">
                <div class="ai-suggestion">${currentAISuggestion.replace(/\n/g, '<br>')}</div>
                <div class="feedback-actions">
                    <button class="guidance-back-btn">${currentLanguage === 'zh' ? '← 返回上一步' : '← Back'}</button>
                    <button class="guidance-accept-btn">${currentLanguage === 'zh' ? '✓ 满意，继续' : '✓ Satisfied, Continue'}</button>
                    <button class="guidance-modify-btn">${currentLanguage === 'zh' ? '✎ 需要修改' : '✎ Need Modification'}</button>
                </div>
            </div>
        `;

        container.querySelector('.ai-feedback-container').innerHTML = html;

        // 回退按钮 - 返回上一步并保留当前已填内容
        container.querySelector('.guidance-back-btn').addEventListener('click', () => {
            if (guidanceStep > 0) {
                guidanceStep--;
            }
            showGuidanceQuestion(container, modal);
        });

        // 满意按钮 - 继续下一步
        container.querySelector('.guidance-accept-btn').addEventListener('click', () => {
            pruneGuidanceAnswersFrom(guidanceStep + 2);
            setGuidanceAnswer({
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
            <div style="display:flex;gap:10px;margin-top:8px;">
                <button class="guidance-back-btn">${currentLanguage === 'zh' ? '← 返回上一步' : '← Back'}</button>
                <button class="guidance-skip-btn">${currentLanguage === 'zh' ? '跳过此步' : 'Skip this step'}</button>
            </div>
        `;

        container.querySelector('.guidance-back-btn').addEventListener('click', () => {
            if (guidanceStep > 0) guidanceStep--;
            showGuidanceQuestion(container, modal);
        });

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

        // 重新生成AI建议
        container.querySelector('.modification-input').innerHTML = `<p class="loading">🔄 ${currentLanguage === 'zh' ? 'AI正在根据你的意见重新生成...' : 'AI is regenerating based on your feedback...'}</p>`;
        await generateAIFeedback(container, modal, q, modification);
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
        const outlineHtml = `
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
        outlinePanel.innerHTML = outlineHtml;
        
        showNotification(
            currentLanguage === 'zh' 
                ? '✓ 详细大纲已生成' 
                : '✓ Detailed outline generated'
        );

        return outlineHtml;
        
    } catch (error) {
        console.error('详细大纲生成失败:', error);
        
        // 降级到基础大纲
        return await generateOutlineFromAnswers(userAnswers);
    }
}

async function generateOutlineFromAnswers(userAnswers = null) {
    // 显示加载状态
    outlinePanel.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在为你生成个性化大纲...' : 'AI is generating personalized outline...') + 
        '</p>';
    
    try {
        // 调用AI生成个性化大纲
        if (userAnswers) {
            const result = await aiService.generateGuidanceResponse(
                currentType,
                currentLanguage,
                userAnswers
            );
            
            const aiOutline = result.message;
            
            // 显示AI生成的大纲
            const outlineHtml = `
                <div class="ai-outline">
                    <h5>📋 ${currentLanguage === 'zh' ? 'AI个性化大纲' : 'AI Personalized Outline'}</h5>
                    <div class="outline-content">${aiOutline.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            outlinePanel.innerHTML = outlineHtml;
            
            showNotification(
                currentLanguage === 'zh' 
                    ? '✓ AI大纲已生成，根据你的需求定制' 
                    : '✓ AI outline generated based on your needs'
            );
            return outlineHtml;
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

    return outlineHTML;
}

function closeGuidanceModal() {
    document.getElementById('guidanceModal').style.display = 'none';
    guidanceStep = 0;
}

function openRawPromptModal() {
    const modal = document.getElementById('rawPromptModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeRawPromptModal() {
    const modal = document.getElementById('rawPromptModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
    let attemptCount = 0;
    const showLoadingMessage = (message) => {
        materialsList.innerHTML = `
            <p class="loading">🔄 ${message}</p>
        `;
    };

    try {
        // 先尝试完整的AI推荐
        showLoadingMessage(currentLanguage === 'zh' 
            ? `AI正在为"${topic}"分析和筛选相关素材...` 
            : `AI is analyzing and filtering materials for "${topic}"...`);

        // 使用带重试和退避策略的请求（3次重试）
        const result = await fetchMaterialsWithRetry({
            type: currentType,
            language: currentLanguage,
            topic,
            level: currentLevel,
            preferences: userMaterialPreferences,
            guidance: userGuidanceAnswers,
            context: mainEditor.value
        }, 3);

        // 步骤3：以卡片形式展示素材
        displayMaterialCards(result.message, topic);
        showNotification(currentLanguage === 'zh' ? '✓ AI素材推荐已生成' : '✓ AI materials generated');
        
    } catch (error) {
        console.error('素材推荐失败，开始使用fallback策略:', error);
        
        // 更细致的错误分类
        const errorMsg = error.message || String(error);
        const isNetworkError = /fetch|network|Failed to fetch/i.test(errorMsg);
        const isTimeoutError = /timeout|AbortError/i.test(errorMsg);
        const isServerError = /502|503|504|500/i.test(errorMsg);
        const isRateLimited = /429|rate|quota/i.test(errorMsg);
        
        let userMessage = '';
        if (isNetworkError) {
            userMessage = currentLanguage === 'zh' ? '网络连接可能存在问题，' : 'Network connection issue. ';
        } else if (isTimeoutError) {
            userMessage = currentLanguage === 'zh' ? 'AI服务响应较慢，' : 'AI response slow. ';
        } else if (isServerError) {
            userMessage = currentLanguage === 'zh' ? 'AI服务暂不可用，' : 'AI service temporarily unavailable. ';
        } else if (isRateLimited) {
            userMessage = currentLanguage === 'zh' ? 'AI服务请求过于频繁，' : 'Too many requests. ';
        }

        // Fallback策略1：尝试使用简化版AI推荐（更小的参数）
        try {
            showLoadingMessage(currentLanguage === 'zh' 
                ? '尝试使用简化版素材推荐...' 
                : 'Trying simplified material recommendation...');

            const simplifiedResult = await aiService.generateMaterials(
                currentType,
                currentLanguage,
                topic
            );
            
            displayMaterialCards(simplifiedResult.message, topic);
            showNotification(
                currentLanguage === 'zh' 
                    ? `✓ 已使用简化版素材推荐（${userMessage}已自动降级）` 
                    : `✓ Simplified materials loaded (${userMessage}auto-fallback)`
            );
            return;
            
        } catch (fallback1Error) {
            console.error('简化版推荐也失败:', fallback1Error);
        }

        // Fallback策略2：使用本地缓存（如果有）或显示本地素材库
        try {
            showLoadingMessage(currentLanguage === 'zh' 
                ? '使用本地素材库...' 
                : 'Loading local materials...');
            
            // 给用户一些反馈时间，避免闪烁
            await new Promise(r => setTimeout(r, 500));
            
            displayFallbackMaterials(topic);
            showNotification(
                currentLanguage === 'zh' 
                    ? '✓ 已为你准备本地素材库（AI暂时不可用）' 
                    : '✓ Using local materials library (AI unavailable)'
            );
            return;
            
        } catch (fallback2Error) {
            console.error('本地素材库加载失败:', fallback2Error);
        }

        // Fallback策略3：显示通用错误界面并提供多个操作选项
        const errorUI = `
            <div class="material-error" style="padding: 20px; text-align: center;">
                <p class="error-title">⚠️ ${currentLanguage === 'zh' ? '素材推荐暂不可用' : 'Materials temporarily unavailable'}</p>
                <p class="error-msg" style="margin: 12px 0; font-size: 13px; line-height: 1.6;">
                    ${userMessage}
                    ${currentLanguage === 'zh' 
                        ? '请选择以下操作之一继续写作' 
                        : 'Please choose an action below to continue'}
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px;">
                    <button class="retry-btn" onclick="showMaterials()" style="padding: 12px 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">🔄 ${currentLanguage === 'zh' ? '重试' : 'Retry'}</button>
                    <button class="local-btn" onclick="displayFallbackMaterials('${topic}')" style="padding: 12px 8px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">📚 ${currentLanguage === 'zh' ? '本地素材' : 'Local'}</button>
                </div>
                <p style="margin-top: 12px; font-size: 12px; color: var(--text-secondary);">
                    ${currentLanguage === 'zh' 
                        ? '💡 提示：你也可以手动输入或编辑文章，系统会随时准备好提供帮助' 
                        : '💡 Tip: You can manually write or edit. Help is always ready'}
                </p>
            </div>
        `;
        materialsList.innerHTML = errorUI;
        
        showNotification(
            currentLanguage === 'zh' 
                ? '⚠️ 素材推荐遇到问题，请稍后重试或使用本地素材' 
                : '⚠️ Material recommendation failed, please retry or use local materials',
            'warning',
            5000
        );
    }
}

// Helper: fetch materials with retries + exponential backoff + improved error handling
async function fetchMaterialsWithRetry(params, maxRetries = 3) {
    let attempt = 0;
    let lastError = null;
    
    while (attempt <= maxRetries) {
        try {
            // 根据重试次数调整超时时间
            const adjustedTimeoutMs = 22000 + (attempt * 3000);
            
            return await aiService.generateDetailedMaterials(
                params.type,
                params.language,
                params.topic,
                params.level,
                params.preferences,
                params.guidance,
                params.context,
                { timeoutMs: adjustedTimeoutMs, retries: 0 } // 在服务层已处理，此处不再重试
            );
        } catch (err) {
            lastError = err;
            attempt++;
            
            if (attempt <= maxRetries) {
                const delay = 800 * Math.pow(2, attempt); // 800ms, 1600ms, 3200ms...
                console.log(`素材推荐重试 ${attempt}/${maxRetries}，待机 ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastError || new Error('fetchMaterials failed after retries');
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
    // 更鲁棒的解析AI返回素材文本为结构化数据
    const materials = [];
    const lines = aiResponse.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let currentMaterial = null;

    const isNumbered = (s) => /^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/.test(s) || /^[\(\[]?\d+[\)\]]/.test(s) || /^[•\-\*]\s+/.test(s);

    for (const line of lines) {
        // 如果是新条目（编号、项目符号或类别开头）
        if (isNumbered(line) || /^类别[:：]/i.test(line) || /^category[:：]/i.test(line) || /^【.*】/.test(line)) {
            if (currentMaterial) materials.push(currentMaterial);
            // 去掉编号或前缀
            const content = line.replace(/^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/, '').replace(/^[•\-\*]\s+/, '').replace(/^类别[:：]\s*/i, '').replace(/^category[:：]\s*/i, '').replace(/^【|】$/g, '').trim();
            currentMaterial = {
                category: currentLanguage === 'zh' ? '素材' : 'Material',
                content: content,
                usage: '',
                scene: ''
            };
            continue;
        }

        // 使用示例
        if (/使用示例|Usage Example|引用[:：]|Quote[:：]/i.test(line)) {
            if (currentMaterial) currentMaterial.usage = line.replace(/.*(使用示例|Usage Example|引用[:：]|Quote[:：])[：:]?\s*/i, '');
            continue;
        }

        // 适用场景
        if (/适用|适用场景|场景|Suitable|Suitable for|Scene/i.test(line)) {
            if (currentMaterial) currentMaterial.scene = line.replace(/.*(适用|适用场景|场景|Suitable for|Scene)[：:]?\s*/i, '');
            continue;
        }

        // 明确类别标注
        if (/名言|警句|Quote|引用/i.test(line)) {
            if (currentMaterial) currentMaterial.category = currentLanguage === 'zh' ? '名言警句' : 'Famous Quote';
            if (!currentMaterial.content) currentMaterial.content = line;
            continue;
        }

        // 若已有 currentMaterial，则追加内容，否则新建一条
        if (currentMaterial) {
            currentMaterial.content = (currentMaterial.content + ' ' + line).trim();
        } else {
            currentMaterial = {
                category: currentLanguage === 'zh' ? '推荐素材' : 'Recommended Material',
                content: line,
                usage: '',
                scene: ''
            };
        }
    }

    if (currentMaterial) materials.push(currentMaterial);

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
        const result = await fetchMaterialsWithRetry({
            type: currentType,
            language: currentLanguage,
            topic,
            level: currentLevel,
            preferences: userMaterialPreferences,
            guidance: [],
            context: mainEditor.value
        }, 2);  // 2 次重试

        displayMaterialCards(result.message, topic);
        showNotification(currentLanguage === 'zh' ? '✓ 新素材已加载' : '✓ New materials loaded');
        
    } catch (error) {
        console.error('刷新素材失败:', error);
        // 发生错误时尝试本地回退
        showNotification(
            currentLanguage === 'zh' 
                ? '⚠️ 无法加载新素材，已使用本地素材库' 
                : '⚠️ Unable to load new materials, using local library',
            'warning'
        );
        displayFallbackMaterials(topic);
    }
}

// =========== 灵感提示和卡顿检测 ===========
function setupKeystrokeTracking() {
    let lastKeystroke = Date.now();
    let lastInspiration = Date.now(); // 追踪上次灵感提示的时间
    
    mainEditor.addEventListener('keydown', () => {
        lastKeystroke = Date.now();
        if (!writingStartTime) writingStartTime = Date.now();
    });

    // 每5秒更新一次统计信息（实时显示）
    setInterval(() => {
        updateStats();
    }, 5000);

    // 每60秒检测一次卡顿（增加间隔）
    setInterval(() => {
        const timeSinceLastKeystroke = Date.now() - lastKeystroke;
        const timeSinceLastInspiration = Date.now() - lastInspiration;
        // 60秒内无输入且距离上次灵感提示已超过2分钟
        if (timeSinceLastKeystroke > 60000 && timeSinceLastInspiration > 120000 && mainEditor.value.length > 0) {
            checkInspirationNeeded();
            lastInspiration = Date.now();
        }
    }, 60000);
}

// =========== 优化修补 ===========
// =========== 优化修补（引导式提问）===========
let userOptimizationAnswers = [];

function initializeRightPanelTabs() {
    switchRightPanel(currentRightPanelView);
}

function switchRightPanel(view) {
    currentRightPanelView = view;
    const viewOutlineBtn = document.getElementById('viewOutlineBtn');
    const viewOptimizationBtn = document.getElementById('viewOptimizationBtn');

    if (outlinePanel) {
        outlinePanel.style.display = view === 'outline' ? 'block' : 'none';
    }
    if (optimizationPanel) {
        optimizationPanel.style.display = view === 'optimization' ? 'block' : 'none';
    }

    if (viewOutlineBtn) viewOutlineBtn.classList.toggle('active', view === 'outline');
    if (viewOptimizationBtn) viewOptimizationBtn.classList.toggle('active', view === 'optimization');
}

function appendOptimizationRecord(question, answer, feedback) {
    optimizationRecords.unshift({
        type: currentType,
        language: currentLanguage,
        question,
        answer,
        feedback,
        timestamp: Date.now()
    });
    renderOptimizationRecords();
}

function renderOptimizationRecords() {
    if (!optimizationPanel) return;

    if (optimizationRecords.length === 0) {
        optimizationPanel.innerHTML = `<p class="placeholder">${currentLanguage === 'zh'
            ? '优化修补记录将显示在这里'
            : 'Optimization notes will appear here'}</p>`;
        return;
    }

    const html = optimizationRecords.map((item, idx) => `
        <div class="optimization-record-item">
            <p class="optimization-record-title">${currentLanguage === 'zh' ? `问题 ${optimizationRecords.length - idx}` : `Question ${optimizationRecords.length - idx}`}</p>
            <p class="optimization-record-question">🔍 ${item.question}</p>
            <p class="optimization-record-answer">💭 ${currentLanguage === 'zh' ? '我的想法：' : 'My thoughts:'} ${item.answer}</p>
            <p class="optimization-record-feedback">💡 ${currentLanguage === 'zh' ? '优化修补建议：' : 'Optimization suggestion:'} ${item.feedback}</p>
        </div>
    `).join('');

    optimizationPanel.innerHTML = `<div class="optimization-record-list">${html}</div>`;
}

async function startOptimization() {
    if (mainEditor.value.length === 0) {
        showNotification(
            currentLanguage === 'zh'
                ? '请先写入一些内容'
                : 'Please write some content first'
        );
        return;
    }

    const modal = document.getElementById('optimizationModal');
    const content = document.getElementById('optimizationContent');
    userOptimizationAnswers = [];
    
    // 显示加载状态
    content.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在分析你的文章，生成优化建议...' : 'AI is analyzing your article to generate optimization suggestions...') + 
        '</p>';
    modal.style.display = 'flex';

    try {
        // 调用AI生成针对性问题
        const result = await aiService.generateOptimizationQuestions(
            currentType,
            currentLanguage,
            mainEditor.value
        );
        
        const aiQuestions = result.message;
        
        // 将AI返回的问题按行分割，强制限制在3-5个
        const questionsList = parseOptimizationQuestions(aiQuestions);
        
        // 添加调试日志
        console.log(`✅ 优化修补问题已解析，共 ${questionsList.length} 个问题`);
        
        // 如果问题数量被调整了，可以给用户一个提示（可选）
        if (questionsList.length < 3 || questionsList.length > 5) {
            console.log(`⚠️ 问题数量已自动调整为 ${questionsList.length} 个`);
        }
        
        let questionIdx = 0;

        function showOptimizationQuestion() {
            if (questionIdx >= questionsList.length) {
                // 所有问题完成，生成总结
                showOptimizationSummary();
                return;
            }

            const q = questionsList[questionIdx];
            // 获取该问题之前的回答（如果用户返回上一步）
            const previousAnswer = userOptimizationAnswers[questionIdx]?.answer || '';
            
            content.innerHTML = `
                <div class="optimization-question">
                    <p class="question-label">${currentLanguage === 'zh' ? '🔍 问题' : '🔍 Question'} ${questionIdx + 1}/${questionsList.length}</p>
                    <p class="question-text">${q}</p>
                    <p class="question-hint">${currentLanguage === 'zh' 
                        ? '💭 请认真思考这个问题，并诚实地回答。这有助于你发现文章中的不足之处。' 
                        : '💭 Think carefully about this question and answer honestly. This helps you discover weaknesses in your article.'}</p>
                    <textarea class="optimization-answer" placeholder="${currentLanguage === 'zh' ? '在这里写下你的回答和思考...' : 'Write your answer and thoughts here...'}" rows="4">${previousAnswer}</textarea>
                    <div class="optimization-buttons">
                        ${questionIdx > 0 ? `
                            <button class="secondary-btn" id="previousQuestion">
                                ${currentLanguage === 'zh' ? '← 上一步' : '← Previous'}
                            </button>
                        ` : ''}
                        <button class="secondary-btn" id="skipQuestion">
                            ${currentLanguage === 'zh' ? '→ 跳过' : '→ Skip'}
                        </button>
                        <button class="primary-btn" id="submitAnswer">
                            ${currentLanguage === 'zh' ? '✓ 提交回答' : '✓ Submit Answer'}
                        </button>
                    </div>
                </div>
            `;

            // 上一步按钮
            if (questionIdx > 0) {
                document.getElementById('previousQuestion').addEventListener('click', () => {
                    questionIdx--;
                    // 移除当前问题及之后的所有回答
                    userOptimizationAnswers = userOptimizationAnswers.slice(0, questionIdx);
                    showOptimizationQuestion();
                });
            }

            // 提交回答按钮
            document.getElementById('submitAnswer').addEventListener('click', async () => {
                const answer = content.querySelector('.optimization-answer').value.trim();
                if (!answer) {
                    showNotification(currentLanguage === 'zh' ? '请输入回答' : 'Please enter an answer');
                    return;
                }
                
                // 更新或添加该问题的回答
                if (userOptimizationAnswers[questionIdx]) {
                    userOptimizationAnswers[questionIdx] = {
                        question: q,
                        answer: answer
                    };
                } else {
                    userOptimizationAnswers.push({
                        question: q,
                        answer: answer
                    });
                }
                
                // 显示AI针对回答的建议
                await showAnswerFeedback(q, answer, questionIdx, questionsList.length);
            });

            // 跳过按钮
            document.getElementById('skipQuestion').addEventListener('click', () => {
                questionIdx++;
                showOptimizationQuestion();
            });
        }

        // 解析编号反馈，将其分成三个部分
        function parseNumberedFeedback(feedback) {
            // 改进的反馈解析，支持多种格式
            const items = [];
            const lines = feedback.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let currentItem = { number: null, content: '' };
            
            // 检测是否以数字开头的行（支持多种格式）
            const isNumberedLine = (line) => {
                return /^[\d一二三四五六七八九十]+[\.\)、：:]\s*/.test(line) || 
                       /^[\(\[][\d一二三四五六七八九十]+[\)\]]\s*/.test(line);
            };
            
            // 提取数字编号
            const extractNumber = (line) => {
                const match = line.match(/^[\d一二三四五六七八九十]+/);
                if (match) return match[0];
                const match2 = line.match(/[\(\[]?([\d一二三四五六七八九十]+)[\)\]]/);
                if (match2) return match2[1];
                return null;
            };
            
            // 去除编号前缀
            const removePrefix = (line) => {
                return line.replace(/^[\d一二三四五六七八九十]+[\.\)、：:]\s*/, '')
                          .replace(/^[\(\[][\d一二三四五六七八九十]+[\)\]]\s*/, '')
                          .trim();
            };
            
            for (const line of lines) {
                if (isNumberedLine(line)) {
                    // 保存上一条
                    if (currentItem.content.trim()) {
                        items.push({ ...currentItem });
                    }
                    // 开始新的一条
                    currentItem = {
                        number: extractNumber(line),
                        content: removePrefix(line)
                    };
                } else if (currentItem.number !== null) {
                    // 追加到当前条目
                    currentItem.content += ' ' + line;
                } else {
                    // 没有编号的独立段落也作为一条
                    if (line.length > 10) {
                        items.push({ number: items.length + 1, content: line });
                    }
                }
            }
            
            // 添加最后一条
            if (currentItem.content.trim()) {
                items.push(currentItem);
            }
            
            // 如果没有解析出编号条目，将整个反馈作为一条
            if (items.length === 0) {
                items.push({ number: 1, content: feedback });
            }
            
            return items;
        }
        
        // 改名为 parseFeedbackItems，旧函数保留用于兼容
        function parseFeedbackItems(feedback) {
            return parseNumberedFeedback(feedback);
        }
        
        // 逐条展示反馈建议
        let feedbackItems = [];
        let currentFeedbackIdx = 0;
        
        function showSingleFeedbackItem() {
            if (currentFeedbackIdx >= feedbackItems.length) {
                // 所有反馈条目已处理完，进入下一个问题
                showNextQuestionPrompt();
                return;
            }
            
            const item = feedbackItems[currentFeedbackIdx];
            
            content.innerHTML = `
                <div class="logic-feedback">
                    <p class="feedback-label">${currentLanguage === 'zh' ? '💡 问题' : '💡 Question'} ${questionIdx + 1}/${questionsList.length} - ${currentLanguage === 'zh' ? '建议' : 'Suggestion'} ${currentFeedbackIdx + 1}/${feedbackItems.length}</p>
                    <div class="feedback-question">
                        <strong>${currentLanguage === 'zh' ? '问题：' : 'Question:'}</strong>
                        <p>${userOptimizationAnswers[questionIdx]?.question || ''}</p>
                    </div>
                    <div class="feedback-answer">
                        <strong>${currentLanguage === 'zh' ? '你的回答：' : 'Your answer:'}</strong>
                        <p>${userOptimizationAnswers[questionIdx]?.answer || ''}</p>
                    </div>
                    <div class="single-feedback-item">
                        <div class="feedback-item-header">
                            <span class="feedback-item-number">${item.number}</span>
                            <span class="feedback-item-label">${currentLanguage === 'zh' ? 'AI 建议' : 'AI Suggestion'}</span>
                        </div>
                        <div class="feedback-item-content">${item.content}</div>
                    </div>
                    <p class="feedback-hint">${currentLanguage === 'zh' 
                        ? '💡 提示：请认真思考这条建议，并判断是否需要根据它改进文章。' 
                        : '💡 Tip: Consider this suggestion carefully and decide if you need to improve your article accordingly.'}</p>
                    <div class="optimization-buttons">
                        ${currentFeedbackIdx > 0 ? `
                            <button class="secondary-btn" id="prevFeedback">
                                ${currentLanguage === 'zh' ? '← 上一条建议' : '← Previous'}
                            </button>
                        ` : `
                            <button class="secondary-btn" id="backToQuestion">
                                ${currentLanguage === 'zh' ? '← 重新回答问题' : '← Re-answer'}
                            </button>
                        `}
                        <button class="secondary-btn" id="skipFeedback">
                            ${currentLanguage === 'zh' ? '跳过此条' : 'Skip'}
                        </button>
                        <button class="primary-btn" id="nextFeedback">
                            ${currentFeedbackIdx < feedbackItems.length - 1 
                                ? (currentLanguage === 'zh' ? '下一条建议 →' : 'Next →')
                                : (currentLanguage === 'zh' ? '明白了，下一个问题 →' : 'Got it, Next →')
                            }
                        </button>
                    </div>
                </div>
            `;
            
            // 上一条建议按钮
            if (currentFeedbackIdx > 0) {
                document.getElementById('prevFeedback')?.addEventListener('click', () => {
                    currentFeedbackIdx--;
                    showSingleFeedbackItem();
                });
            } else {
                // 重新回答问题按钮
                document.getElementById('backToQuestion')?.addEventListener('click', () => {
                    showOptimizationQuestion();
                });
            }
            
            // 跳过此条按钮
            document.getElementById('skipFeedback')?.addEventListener('click', () => {
                currentFeedbackIdx++;
                showSingleFeedbackItem();
            });
            
            // 下一条/下一个问题按钮
            document.getElementById('nextFeedback')?.addEventListener('click', () => {
                currentFeedbackIdx++;
                showSingleFeedbackItem();
            });
        }
        
        function showNextQuestionPrompt() {
            content.innerHTML = `
                <div class="logic-feedback">
                    <p class="feedback-complete">✓ ${currentLanguage === 'zh' 
                        ? '已查看所有建议' 
                        : 'All suggestions reviewed'}</p>
                    <p class="feedback-summary">${currentLanguage === 'zh' 
                        ? `你已经完成了第 ${questionIdx + 1} 个问题的分析，查看了 ${feedbackItems.length} 条建议。` 
                        : `You've completed question ${questionIdx + 1} and reviewed ${feedbackItems.length} suggestions.`}</p>
                    <div class="optimization-buttons">
                        <button class="secondary-btn" id="reviewFeedbacks">
                            ${currentLanguage === 'zh' ? '← 重新查看建议' : '← Review Suggestions'}
                        </button>
                        <button class="primary-btn" id="proceedToNext">
                            ${currentLanguage === 'zh' ? '继续下一个问题 →' : 'Next Question →'}
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('reviewFeedbacks')?.addEventListener('click', () => {
                currentFeedbackIdx = 0;
                showSingleFeedbackItem();
            });
            
            document.getElementById('proceedToNext')?.addEventListener('click', () => {
                questionIdx++;
                showOptimizationQuestion();
            });
        }

        // 生成反馈内容的HTML，支持三部分格式（保留用于兼容）
        function generateFeedbackHTML(feedback) {
            // 使用新的解析逻辑
            const items = parseFeedbackItems(feedback);
            
            if (items.length > 1) {
                // 多条建议，使用卡片格式
                return `
                    <div class="feedback-sections">
                        ${items.map(item => `
                            <div class="feedback-section">
                                <div class="section-number">${item.number}</div>
                                <div class="section-content">${item.content}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                // 单条建议，使用原始格式
                return `<div class="feedback-content">${feedback.replace(/\n/g, '<br>')}</div>`;
            }
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

                // 记录到优化修补记录并切换到优化面板
                appendOptimizationRecord(question, answer, feedback);
                switchRightPanel('optimization');
                
                // 解析反馈为多条建议
                feedbackItems = parseFeedbackItems(feedback);
                currentFeedbackIdx = 0;
                
                console.log(`✅ 反馈已解析为 ${feedbackItems.length} 条建议`);
                
                // 开始逐条展示
                showSingleFeedbackItem();
                
            } catch (error) {
                console.error('反馈生成失败:', error);
                const fallbackFeedback = currentLanguage === 'zh'
                    ? '1. 回到原文，检查该问题对应段落是否有明确论据。\n2. 检查段落之间的过渡是否清晰自然。\n3. 验证相关表达是否准确可验证。'
                    : '1. Revisit the related paragraph and verify clear evidence.\n2. Check if transitions between paragraphs are clear and natural.\n3. Verify that relevant expressions are accurate and verifiable.';

                appendOptimizationRecord(question, answer, fallbackFeedback);
                switchRightPanel('optimization');
                
                // 解析回退反馈为多条建议
                feedbackItems = parseFeedbackItems(fallbackFeedback);
                currentFeedbackIdx = 0;
                
                // 开始逐条展示
                showSingleFeedbackItem();
            }
        }

        function showOptimizationSummary() {
            const answeredCount = userOptimizationAnswers.length;
            content.innerHTML = `
                <div class="optimization-complete">
                    <h3>✓ ${currentLanguage === 'zh' ? '逻辑检查完成' : 'Logic Check Complete'}</h3>
                    <p>${currentLanguage === 'zh' 
                        ? `你已经回答了 ${answeredCount} 个问题，认真思考了文章的逻辑。` 
                        : `You answered ${answeredCount} questions and thoughtfully reviewed your article's logic.`}</p>
                    <p class="summary-hint">${currentLanguage === 'zh' 
                        ? '💡 建议：现在回到文章，根据刚才的思考和AI建议，自己动手改进文章的逻辑和表达。' 
                        : '💡 Suggestion: Return to your article and improve its logic and expression based on your thoughts and AI suggestions.'}</p>
                    <div class="optimization-buttons">
                        <button class="primary-btn" id="closeOptimizationBtn">
                            ${currentLanguage === 'zh' ? '返回继续写作' : 'Return to Writing'}
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('closeOptimizationBtn').addEventListener('click', closeOptimizationModal);
        }

        showOptimizationQuestion();
        
    } catch (error) {
        console.error('优化修补失败:', error);
        
        // 降级到本地问题库（强制限制3-5个）
        const allQuestions = optimizationQuestions[currentType][currentLanguage];
        const MIN_QUESTIONS = 3;
        const MAX_QUESTIONS = 5;
        
        // 取前3-5个问题（本地库通常有5个）
        const questions = allQuestions.slice(0, Math.min(MAX_QUESTIONS, allQuestions.length));
        
        // 如果本地库不足3个，记录错误但仍继续
        if (questions.length < MIN_QUESTIONS) {
            console.error(`⚠️ 本地问题库只有 ${questions.length} 个问题，少于要求的 ${MIN_QUESTIONS} 个`);
        }
        
        console.log(`✅ 使用本地问题库，共 ${questions.length} 个问题`);
        
        let questionIdx = 0;

        function showOptimizationQuestion() {
            if (questionIdx >= questions.length) {
                content.innerHTML = `
                    <div class="optimization-complete">
                        <p>✓ ${currentLanguage === 'zh' 
                            ? '你已经完成了优化修补检查。根据这些问题反思并改进你的文章。' 
                            : 'Optimization complete. Reflect on these questions and improve your article.'}</p>
                        <button class="primary-btn" id="closeOptimizationBtn">
                            ${currentLanguage === 'zh' ? '返回写作' : 'Return to Writing'}
                        </button>
                    </div>
                `;
                document.getElementById('closeOptimizationBtn')?.addEventListener('click', closeOptimizationModal);
                return;
            }

                const q = questions[questionIdx];
            content.innerHTML = `
                <div class="optimization-question">
                    <p class="question-label">${currentLanguage === 'zh' ? '🔍 问题' : '🔍 Question'} ${questionIdx + 1}/${questions.length}</p>
                    <p class="question-text">${q}</p>
                    <textarea class="optimization-answer" placeholder="${currentLanguage === 'zh' ? '在这里记录你的思考...' : 'Record your thoughts here...'}"></textarea>
                    <div class="optimization-buttons">
                        <button class="secondary-btn" id="nextQuestion">
                            ${currentLanguage === 'zh' ? '下一个问题 →' : 'Next →'}
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('nextQuestion').addEventListener('click', () => {
                questionIdx++;
                showOptimizationQuestion();
            });
        }

        showOptimizationQuestion();
    }
}

function parseOptimizationQuestions(aiResponse) {
    // 改进解析：支持多种编号、符号、换行和短问题，强制返回3-5个问题
    const lines = aiResponse.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const questions = [];
    let current = '';

    const isStart = (s) => /^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/.test(s) || /^[\(\[]?\d+[\)\]]/.test(s) || /^[•\-\*]\s+/.test(s);

    for (const raw of lines) {
        const line = raw;
        if (isStart(line)) {
            if (current.trim()) {
                questions.push(current.trim());
            }
            current = line.replace(/^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/,'').replace(/^[•\-\*]\s*/,'');
            continue;
        }

        // 如果是较短直接的问句也可作为单独问题
        if (line.length < 40 && (line.endsWith('?') || line.endsWith('？'))) {
            if (current.trim()) {
                questions.push(current.trim());
                current = '';
            }
            questions.push(line.trim());
            continue;
        }

        // 否则累积到当前问题
        if (current) current += ' ' + line; else current = line;
    }

    if (current.trim()) questions.push(current.trim());

    // 清理编号前缀并过滤过短的杂项（保留问号或长度合理项）
    let cleaned = questions.map(q => q.replace(/^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/,'').trim())
        .filter(q => q.length > 6 && (q.includes('?') || q.includes('？') || q.length > 12));

    // 如果解析结果为空，尝试最后回退：按非空行拆分并去掉数字前缀
    if (cleaned.length === 0) {
        cleaned = aiResponse.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 6)
            .map(l => l.replace(/^[\d一二三四五六七八九十]+[\)\.|、．。:：]\s*/,'').trim())
            .filter(q => q.length > 6);
    }

    // 强制限制在3-5个问题之间
    const MIN_QUESTIONS = 3;
    const MAX_QUESTIONS = 5;
    
    // 如果问题太多，只取前5个最有价值的（通常是前面的问题）
    if (cleaned.length > MAX_QUESTIONS) {
        cleaned = cleaned.slice(0, MAX_QUESTIONS);
    }
    
    // 如果问题太少，从本地问题库补充
    if (cleaned.length < MIN_QUESTIONS) {
        const localQuestions = optimizationQuestions[currentType][currentLanguage];
        // 补充问题直到达到最少3个
        let idx = 0;
        while (cleaned.length < MIN_QUESTIONS && idx < localQuestions.length) {
            // 避免重复添加
            if (!cleaned.includes(localQuestions[idx])) {
                cleaned.push(localQuestions[idx]);
            }
            idx++;
        }
    }
    
    return cleaned;
}

function closeOptimizationModal() {
    document.getElementById('optimizationModal').style.display = 'none';
    userOptimizationAnswers = [];
}

// =========== 模板更新 ===========
function updateTemplate() {
    const template = essayTypes[currentType][currentLanguage];
    templateInfo.innerHTML = `<p>📝 ${template.name} - ${template.level} | ${template.description}</p>`;
    mainEditor.placeholder = template.placeholder;
    syncTargetSelector();
    updateStats();
}

function applyTargetWordsConfig() {
    essayTypes.argumentative.zh.targetWords = targetWordsConfig.argumentative;
    essayTypes.argumentative.en.targetWords = targetWordsConfig.argumentative;
    essayTypes.narrative.zh.targetWords = targetWordsConfig.narrative;
    essayTypes.narrative.en.targetWords = targetWordsConfig.narrative;
}

function updateTargetWords(value) {
    if (currentType !== 'argumentative' && currentType !== 'narrative') return;

    targetWordsConfig[currentType] = value;
    applyTargetWordsConfig();
    updateStats();
    showNotification(
        currentLanguage === 'zh'
            ? `✓ 已将${essayTypes[currentType][currentLanguage].name}目标字数设置为 ${value} 字`
            : `✓ Target words set to ${value}`
    );
}

function syncTargetSelector() {
    if (!targetSelectorWrap || !targetWordsSelect || !targetSelectorLabel) return;

    const canSetTarget = currentType === 'argumentative' || currentType === 'narrative';
    targetSelectorWrap.style.display = canSetTarget ? 'flex' : 'none';

    if (!canSetTarget) return;

    const targetWordOptionsByType = {
        argumentative: [600, 800, 1000, 1200],
        narrative: [200, 400, 600, 800, 1000]
    };

    const options = targetWordOptionsByType[currentType] || [];
    const defaultValue = currentType === 'argumentative' ? 800 : 600;
    let currentValue = targetWordsConfig[currentType] || defaultValue;

    if (!options.includes(currentValue)) {
        currentValue = defaultValue;
        targetWordsConfig[currentType] = defaultValue;
        applyTargetWordsConfig();
    }

    targetWordsSelect.innerHTML = options
        .map(value => `<option value="${value}">${value}</option>`)
        .join('');

    targetSelectorLabel.textContent = currentLanguage === 'zh' ? '目标字数' : 'Target words';
    targetWordsSelect.value = String(currentValue);
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
        targetWordsConfig,
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

// 写作完成：生成写作报告（调用AI，失败则本地生成）
async function finishWriting() {
    if (!mainEditor) return;
    if (!writingStartTime) writingStartTime = Date.now();
    const endTime = Date.now();
    const durationSec = Math.round((endTime - writingStartTime) / 1000);

    const text = mainEditor.value || '';
    const words = currentLanguage === 'zh'
        ? text.replace(/[^\u4e00-\u9fa5]/g, '').length
        : text.trim().split(/\s+/).filter(w => w).length;

    // 尝试调用AI生成智能报告，失败则提供本地报告
    try {
        // 准备AI报告payload
        const reportPayload = {
            type: currentType,
            language: currentLanguage,
            title: titleInput?.value || '',
            text,
            words,
            durationSec,
            saves: contentHistory.length,
            targetWords: essayTypes[currentType][currentLanguage].targetWords
        };

        // 尝试使用现有的 AI 接口生成总结或报告
        // 如果没有专门的 generateWritingReport，尝试用其他接口
        let aiReport = null;
        if (aiService && typeof aiService.generateSummary === 'function') {
            try {
                const result = await aiService.generateSummary(
                    currentType,
                    currentLanguage,
                    text
                );
                aiReport = result.message;
            } catch (e) {
                console.log('generateSummary unavailable, using fallback');
            }
        }

        closeAILoadingModal();

        if (aiReport) {
            // AI生成成功
            const aiReportHtml = `📊 ${currentLanguage === 'zh' ? '智能总结' : 'AI Summary'}:\n${aiReport}\n\n`;
            const local = generateLocalWritingReport(words, durationSec, contentHistory.length);
            aiOutput.innerHTML = `
                <div class="writing-report">
                    <h5>📄 ${currentLanguage === 'zh' ? '写作报告' : 'Writing Report'}</h5>
                    <div class="report-content"><strong>${currentLanguage === 'zh' ? 'AI智能分析：' : 'AI Analysis:'}</strong><br>${aiReportHtml.replace(/\n/g, '<br>')}<br><strong>${currentLanguage === 'zh' ? '详细统计: ' : 'Detailed Stats:'}</strong><br>${local.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            showNotification(currentLanguage === 'zh' ? '✓ AI智能写作报告已生成' : '✓ AI writing report generated');
        } else {
            // AI不可用，使用本地报告
            const local = generateLocalWritingReport(words, durationSec, contentHistory.length);
            aiOutput.innerHTML = `
                <div class="writing-report">
                    <h5>📄 ${currentLanguage === 'zh' ? '写作报告' : 'Writing Report'}</h5>
                    <div class="report-content">${local.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            showNotification(currentLanguage === 'zh' ? '✓ 写作报告已生成' : '✓ Writing report generated');
        }
    } catch (error) {
        console.error('写作报告生成异常:', error);
        closeAILoadingModal();
        const local = generateLocalWritingReport(words, durationSec, contentHistory.length);
        aiOutput.innerHTML = `
            <div class="writing-report">
                <h5>📄 ${currentLanguage === 'zh' ? '写作报告' : 'Writing Report'}</h5>
                <div class="report-content">${local.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        showNotification(currentLanguage === 'zh' ? '✓ 写作报告已生成' : '✓ Writing report generated');
    }
}

function generateLocalWritingReport(words, durationSec, saves) {
    const minutes = Math.max(1, Math.round(durationSec / 60));
    const speed = Math.round(words / minutes);
    const lines = [];
    
    if (currentLanguage === 'zh') {
        lines.push(`⏱️  写作时长：${minutes} 分钟 (${durationSec} 秒)`);
        lines.push(`📝 写作字数：${words} 字`);
        lines.push(`⚡ 平均速度：${speed} 字/分钟`);
        lines.push(`💾 保存次数：${saves}`);
        const targetWords = essayTypes[currentType][currentLanguage].targetWords;
        if (targetWords) {
            const progress = Math.round((words / targetWords) * 100);
            lines.push(`📊 完成度：${progress}%`);
        }
        lines.push('');
        lines.push('💡 简要建议：');
        lines.push('• 回顾文章结构，确保每段都有主题句和支撑。');
        lines.push('• 检查论据来源和引用格式。');
        lines.push('• 根据AI提示进行针对性修改，提升论证力度。');
    } else {
        lines.push(`⏱️  Writing time: ${minutes} minutes (${durationSec}s)`);
        lines.push(`📝 Word count: ${words} words`);
        lines.push(`⚡ Average speed: ${speed} words/min`);
        lines.push(`💾 Times saved: ${saves}`);
        const targetWords = essayTypes[currentType][currentLanguage].targetWords;
        if (targetWords) {
            const progress = Math.round((words / targetWords) * 100);
            lines.push(`📊 Completion: ${progress}%`);
        }
        lines.push('');
        lines.push('💡 Suggestions:');
        lines.push('• Review structure: ensure each paragraph has topic sentence & support.');
        lines.push('• Check source credibility and citation format.');
        lines.push('• Apply targeted revisions based on AI feedback.');
    }
    
    return lines.join('\n');
}

// 显示原始题目输入对话框

function loadSavedContent() {
    const saved = localStorage.getItem('currentContent');
    if (saved) {
        const content = JSON.parse(saved);
        currentType = content.type || 'argumentative';
        currentLevel = content.level || 'high-school';
        currentLanguage = content.language || 'zh';
        targetWordsConfig = content.targetWordsConfig || targetWordsConfig;
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
        clearTimeout(saveTimeout);

        titleInput.value = '';
        mainEditor.value = '';

        // 清空AI生成内容与右侧面板
        if (aiOutput) {
            aiOutput.innerHTML = `<p class="placeholder">${currentLanguage === 'zh'
                ? 'AI 建议将显示在这里<br>AI suggestions will appear here'
                : 'AI suggestions will appear here<br>AI 建议将显示在这里'}</p>`;
        }

        if (materialsList) {
            materialsList.innerHTML = '';
        }
        if (materialsPanel) {
            materialsPanel.style.display = 'none';
        }

        if (outlinePanel) {
            outlinePanel.innerHTML = '';
            outlinePanel.style.display = 'block';
        }

        if (optimizationPanel) {
            optimizationPanel.innerHTML = `<p class="placeholder">${currentLanguage === 'zh'
                ? '优化修补记录将显示在这里'
                : 'Optimization notes will appear here'}</p>`;
            optimizationPanel.style.display = 'none';
        }

        // 清空运行时状态
        userGuidanceAnswers = [];
        currentAISuggestion = '';
        guidanceStep = 0;
        userMaterialPreferences = [];
        userOptimizationAnswers = [];
        optimizationRecords = [];
        currentOutline = null;

        const guidanceContent = document.getElementById('guidanceContent');
        const logicContent = document.getElementById('logicContent');
        if (guidanceContent) guidanceContent.innerHTML = '';
        if (logicContent) logicContent.innerHTML = '';

        // 重置右侧视图
        if (typeof switchRightPanel === 'function') {
            switchRightPanel('outline');
        }

        // 清空持久化内容
        contentHistory = [];
        localStorage.removeItem('currentContent');
        localStorage.removeItem('contentHistory');

        document.getElementById('lastSaved').textContent = currentLanguage === 'zh' ? '从未' : 'Never';
        updateStats();
        showNotification(currentLanguage === 'zh' ? '✓ 已清空全部内容（含AI生成）' : '✓ All content cleared (including AI outputs)');
    }
}

// =========== 文体切换函数（含内容清除提示）===========
function changeEssayType(newType, newLevel, clickedBtn) {
    // 检查编辑器是否有内容
    const hasTitle = titleInput.value.trim().length > 0;
    const hasContent = mainEditor.value.trim().length > 0;
    const hasContent_overall = hasTitle || hasContent;

    // 如果没有内容，直接切换
    if (!hasContent_overall) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
        currentType = newType;
        currentLevel = newLevel;
        updateTemplate();
        return;
    }

    // 如果有内容，显示确认对话框
    const essayName = essayTypes[newType][currentLanguage].name;
    const confirmText = currentLanguage === 'zh'
        ? `修改文体会清除所有当前内容（包括标题和文本）。\n\n即将切换到：【${essayName}】\n\n是否确认修改？`
        : `Changing essay type will clear all current content (including title and text).\n\nAbout to switch to: [${essayName}]\n\nConfirm?`;

    if (confirm(confirmText)) {
        // 用户确认，执行修改
        clearTimeout(saveTimeout);

        // 清除内容
        titleInput.value = '';
        mainEditor.value = '';

        // 清空AI生成内容与右侧面板
        if (aiOutput) {
            aiOutput.innerHTML = `<p class="placeholder">${currentLanguage === 'zh'
                ? 'AI 建议将显示在这里'
                : 'AI suggestions will appear here'}</p>`;
        }

        if (materialsList) {
            materialsList.innerHTML = '';
        }
        if (materialsPanel) {
            materialsPanel.style.display = 'none';
        }

        if (outlinePanel) {
            outlinePanel.innerHTML = '';
            outlinePanel.style.display = 'block';
        }

        if (optimizationPanel) {
            optimizationPanel.innerHTML = `<p class="placeholder">${currentLanguage === 'zh'
                ? '优化修补记录将显示在这里'
                : 'Optimization notes will appear here'}</p>`;
            optimizationPanel.style.display = 'none';
        }

        // 清空运行时状态
        userGuidanceAnswers = [];
        currentAISuggestion = '';
        guidanceStep = 0;
        userMaterialPreferences = [];
        userOptimizationAnswers = [];
        optimizationRecords = [];
        currentOutline = null;
        rawPromptInput = '';

        const guidanceContent = document.getElementById('guidanceContent');
        const logicContent = document.getElementById('logicContent');
        if (guidanceContent) guidanceContent.innerHTML = '';
        if (logicContent) logicContent.innerHTML = '';

        // 重置右侧视图
        if (typeof switchRightPanel === 'function') {
            switchRightPanel('outline');
        }

        // 清空持久化内容
        contentHistory = [];
        localStorage.removeItem('currentContent');
        localStorage.removeItem('contentHistory');

        document.getElementById('lastSaved').textContent = currentLanguage === 'zh' ? '从未' : 'Never';

        // 修改文体
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
        currentType = newType;
        currentLevel = newLevel;

        updateStats();
        updateTemplate();

        showNotification(
            currentLanguage === 'zh'
                ? `✓ 已切换到【${essayName}】，所有内容已清除`
                : `✓ Switched to [${essayName}], all content cleared`,
            'success'
        );
    }
    // 用户取消，不做任何操作
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
function showNotification(message, type = 'success', duration = 2000) {
    const notification = document.createElement('div');
    
    // 根据类型设置背景色
    let backgroundColor = '#50c878'; // success
    if (type === 'error') {
        backgroundColor = '#ef4444'; // danger
    } else if (type === 'warning') {
        backgroundColor = '#f59e0b'; // warning
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
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
    }, duration);
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
    .guidance-step, .optimization-question {
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
    .optimization-answer {
        width: 100%;
        min-height: 120px;
        padding: 0.75rem;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        margin: 1rem 0;
        font-family: inherit;
    }
    .optimization-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .optimization-complete {
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
        '优化修补': 'optimization',
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
        'startOptimization',
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
