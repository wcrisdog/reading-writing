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
            targetWords: 3000,
            placeholder: '进行学术研究和论证...\n\n论文结构：\n1. 研究背景和意义\n2. 理论分析和方法\n3. 实证研究和发现\n4. 结论和展望',
            sections: ['摘要', '引言', '文献综述', '理论框架', '研究方法', '结果分析', '讨论', '结论']
        },
        en: {
            name: 'Academic Paper',
            level: 'University/Graduate',
            description: 'A rigorous scholarly paper with evidence-based arguments',
            targetWords: 3000,
            placeholder: 'Conduct academic research...\n\nStructure:\n1. Research background\n2. Literature review\n3. Methodology\n4. Results and analysis\n5. Conclusion',
            sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion']
        }
    }
};

// =========== 启动引导问题库 ===========
const guidanceQuestions = {
    argumentative: {
        zh: [
            { step: 1, question: '你的中心论点是什么？请简要说明你要表达的核心观点。', options: ['社会热点话题', '学科概念', '人生哲学', '其他'] },
            { step: 2, question: '你倾向于使用哪种论证方式？', options: ['案例论证', '理论论证', '对比论证', '混合方式'] },
            { step: 3, question: '你的文章预计读者是谁？', options: ['同龄人', '老师', '学术界', '大众'] }
        ],
        en: [
            { step: 1, question: 'What is your main argument? Please state your core viewpoint.', options: ['Social issues', 'Academic concepts', 'Philosophy', 'Others'] },
            { step: 2, question: 'Which argumentation method do you prefer?', options: ['Case studies', 'Theoretical', 'Comparative', 'Mixed'] },
            { step: 3, question: 'Who is your intended audience?', options: ['Peers', 'Teacher', 'Academic', 'General public'] }
        ]
    },
    narrative: {
        zh: [
            { step: 1, question: '你想讲述什么类型的故事？', options: ['个人成长经历', '感人事迹', '社会观察', '其他'] },
            { step: 2, question: '故事的主要人物是谁？', options: ['自己', '家人朋友', '陌生人', '群体'] },
            { step: 3, question: '你希望着重表达什么情感？', options: ['温暖与感动', '坚持与奋斗', '思考与启发', '其他'] }
        ],
        en: [
            { step: 1, question: 'What type of story do you want to tell?', options: ['Personal growth', 'Touching story', 'Social observation', 'Others'] },
            { step: 2, question: 'Who is the main character?', options: ['Myself', 'Family/Friends', 'Strangers', 'Groups'] },
            { step: 3, question: 'What emotion do you want to convey?', options: ['Warmth', 'Perseverance', 'Inspiration', 'Others'] }
        ]
    },
    academic: {
        zh: [
            { step: 1, question: '你的研究课题是什么？', options: ['社会科学', '自然科学', '工程技术', '其他'] },
            { step: 2, question: '研究主要采用什么方法？', options: ['文献分析', '实验研究', '问卷调查', '案例研究', '混合方法'] },
            { step: 3, question: '论文的主要创新点是什么？', options: ['理论创新', '方法创新', '应用创新', '其他'] }
        ],
        en: [
            { step: 1, question: 'What is your research topic?', options: ['Social Science', 'Natural Science', 'Engineering', 'Others'] },
            { step: 2, question: 'What research methods will you use?', options: ['Literature review', 'Experiment', 'Survey', 'Case study', 'Mixed methods'] },
            { step: 3, question: 'What is the innovation in your paper?', options: ['Theory', 'Methodology', 'Application', 'Others'] }
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

// =========== 灵感检测和提示 ===========
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

// =========== DOM 元素 ===========
const mainEditor = document.getElementById('mainEditor');
const titleInput = document.getElementById('titleInput');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const paraCount = document.getElementById('paraCount');
const templateInfo = document.getElementById('templateInfo');
const aiOutput = document.getElementById('aiOutput');
const outlinePanel = document.getElementById('outlinePanel');
const materialsList = document.getElementById('materialsList');
const materialsPanel = document.getElementById('materialsPanel');

// =========== 初始化 ===========
document.addEventListener('DOMContentLoaded', () => {
    loadSavedContent();
    updateTemplate();
    setupEventListeners();
    updateStats();
    setupKeystrokeTracking();
});

// =========== 事件监听设置 ===========
function setupEventListeners() {
    // 写作类型切换
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
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
            currentLanguage = e.target.value;
            updateTemplate();
        });
    });

    // 文本编辑
    mainEditor.addEventListener('input', () => {
        updateStats();
        lastActivityTime = Date.now();
        if (autoSaveEnabled) {
            debouncedSave();
        }
    });

    titleInput.addEventListener('input', () => {
        if (autoSaveEnabled) {
            debouncedSave();
        }
    });

    // 新功能按钮
    document.getElementById('launchGuidance').addEventListener('click', startGuidance);
    document.getElementById('getMaterials').addEventListener('click', showMaterials);
    document.getElementById('getInspiration').addEventListener('click', checkInspirationNeeded);
    document.getElementById('logicRepair').addEventListener('click', startLogicRepair);

    // 模态框关闭
    document.getElementById('closeModal')?.addEventListener('click', closeGuidanceModal);
    document.getElementById('closeLogicModal')?.addEventListener('click', closeLogicModal);

    // 工具按钮
    document.getElementById('saveBtn').addEventListener('click', saveContent);
    document.getElementById('clearBtn').addEventListener('click', clearContent);
    document.getElementById('exportBtn').addEventListener('click', exportContent);
    document.getElementById('autoSaveToggle').addEventListener('click', toggleAutoSave);

    // 点击模态框背景关闭
    document.getElementById('guidanceModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'guidanceModal') closeGuidanceModal();
    });
    document.getElementById('logicModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'logicModal') closeLogicModal();
    });
}

// =========== 启动引导功能 ===========
let userGuidanceAnswers = [];

function startGuidance() {
    const modal = document.getElementById('guidanceModal');
    const content = document.getElementById('guidanceContent');
    guidanceStep = 0;
    userGuidanceAnswers = [];
    showGuidanceQuestion(content, modal);
}

function showGuidanceQuestion(container, modal) {
    const questions = guidanceQuestions[currentType][currentLanguage];
    if (guidanceStep >= questions.length) {
        // 收集完所有答案，生成大纲
        generateOutlineFromAnswers(userGuidanceAnswers);
        closeGuidanceModal();
        return;
    }

    const q = questions[guidanceStep];
    let html = `
        <div class="guidance-step">
            <p class="step-label">${currentLanguage === 'zh' ? '问题 ' : 'Question '} ${guidanceStep + 1}/${questions.length}</p>
            <p class="question-text">${q.question}</p>
            <div class="options-container">
    `;

    q.options.forEach((option, idx) => {
        html += `
            <button class="option-btn" data-step="${guidanceStep}" data-option="${option}">
                ${option}
            </button>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // 选项点击事件
    container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.dataset.option;
            userGuidanceAnswers.push({
                question: q.question,
                answer: answer
            });
            guidanceStep++;
            showGuidanceQuestion(container, modal);
        });
    });

    modal.style.display = 'flex';
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

// =========== 素材推荐 ===========
async function showMaterials() {
    // 显示加载状态
    materialsList.innerHTML = '<p class="loading">🔄 ' + (currentLanguage === 'zh' ? 'AI正在为你推荐素材...' : 'AI is recommending materials...') + '</p>';
    materialsPanel.style.display = 'block';

    try {
        // 获取当前文章的主题（从标题或内容推断）
        const topic = titleInput.value || (currentLanguage === 'zh' ? '写作主题' : 'writing topic');
        
        // 调用AI服务
        const result = await aiService.generateMaterials(currentType, currentLanguage, topic);
        
        // 解析AI返回的素材
        const aiResponse = result.message;
        
        // 显示AI推荐的素材
        materialsList.innerHTML = `
            <div class="ai-materials">
                <div class="material-content">${aiResponse.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        showNotification(
            currentLanguage === 'zh'
                ? '✓ AI素材推荐已生成'
                : '✓ AI materials generated'
        );
        
    } catch (error) {
        console.error('素材推荐失败:', error);
        
        // 降级到本地素材库
        const materials = materialLibrary[currentType][currentLanguage].materials;
        let html = '<p class="fallback-notice">⚠️ ' + 
            (currentLanguage === 'zh' ? '使用本地素材库（AI暂时不可用）' : 'Using local materials (AI unavailable)') + 
            '</p>';

        materials.forEach(group => {
            html += `
                <div class="material-group">
                    <h5>${group.category}</h5>
                    <ul>
            `;
            group.examples.forEach(example => {
                html += `<li>"${example}"</li>`;
            });
            html += `</ul></div>`;
        });

        materialsList.innerHTML = html;
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
        
        // 调用AI服务
        const result = await aiService.generateInspiration(
            currentType, 
            currentLanguage, 
            text, 
            wordCount, 
            targetWords
        );
        
        const aiTip = result.message;
        const progress = (wordCount / targetWords * 100).toFixed(0);
        
        aiOutput.innerHTML = `
            <p class="suggestion">💡 ${aiTip}</p>
            <p class="progress-info">📊 ${
                currentLanguage === 'zh'
                    ? `当前进度: ${wordCount}/${targetWords} 字 (${progress}%)`
                    : `Progress: ${wordCount}/${targetWords} words (${progress}%)`
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
    
    // 显示加载状态
    content.innerHTML = '<p class="loading">🔄 ' + 
        (currentLanguage === 'zh' ? 'AI正在分析你的文章逻辑...' : 'AI is analyzing your article logic...') + 
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
        const questionsList = aiQuestions.split('\n').filter(q => q.trim().length > 0);
        let questionIdx = 0;

        function showLogicQuestion() {
            if (questionIdx >= questionsList.length) {
                content.innerHTML = `
                    <div class="logic-complete">
                        <p>${currentLanguage === 'zh' 
                            ? '✓ AI逻辑修补问题已全部展示。请根据这些问题反思并改进你的文章。' 
                            : '✓ All AI logic repair questions shown. Reflect and improve your article.'}</p>
                    </div>
                `;
                return;
            }

            const q = questionsList[questionIdx];
            content.innerHTML = `
                <div class="logic-question">
                    <p class="question-label">${currentLanguage === 'zh' ? '问题' : 'Question'} ${questionIdx + 1}/${questionsList.length}</p>
                    <p class="question-text">${q}</p>
                    <textarea class="logic-answer" placeholder="${currentLanguage === 'zh' ? '在这里记录你的思考...' : 'Record your thoughts here...'}"></textarea>
                    <div class="logic-buttons">
                        <button class="secondary-btn" id="nextQuestion">
                            ${currentLanguage === 'zh' ? '下一个问题' : 'Next'}
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
        
    } catch (error) {
        console.error('逻辑修补失败:', error);
        
        // 降级到本地问题库
        const questions = logicRepairQuestions[currentType][currentLanguage];
        let questionIdx = 0;

        function showLogicQuestion() {
            if (questionIdx >= questions.length) {
                content.innerHTML = `
                    <div class="logic-complete">
                        <p>${currentLanguage === 'zh' ? '✓ 你已经完成了逻辑修补检查。' : '✓ Logic repair complete.'}</p>
                    </div>
                `;
                return;
            }

            const q = questions[questionIdx];
            content.innerHTML = `
                <div class="logic-question">
                    <p class="question-text">${q}</p>
                    <textarea class="logic-answer" placeholder="${currentLanguage === 'zh' ? '在这里记录你的想法...' : 'Record your thoughts here...'}"></textarea>
                    <div class="logic-buttons">
                        <button class="secondary-btn" id="nextQuestion">
                            ${currentLanguage === 'zh' ? '下一个问题' : 'Next'}
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

function closeLogicModal() {
    document.getElementById('logicModal').style.display = 'none';
}

// =========== 模板更新 ===========
function updateTemplate() {
    const template = essayTypes[currentType][currentLanguage];
    templateInfo.innerHTML = `<p>📝 ${template.name} - ${template.level} | ${template.description}</p>`;
    mainEditor.placeholder = template.placeholder;
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

    charCount.textContent = chars;
    wordCount.textContent = words;
    paraCount.textContent = paragraphs;
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
