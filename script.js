// Application State
let currentMode = 'composition';
let currentLanguage = 'zh';
let autoSaveEnabled = true;
let contentHistory = [];

// Template Configurations
const templates = {
    composition: {
        zh: {
            name: '800字作文',
            info: '📝 800字作文模式 - 建议字数: 800字左右',
            placeholder: '开始书写你的作文...\n\n提示：\n1. 明确主题，立意清晰\n2. 结构完整：开头、正文、结尾\n3. 语言流畅，逻辑连贯\n4. 适当使用修辞手法',
            targetWords: 800
        },
        en: {
            name: '800-Word Essay',
            info: '📝 800-Word Essay Mode - Recommended: Around 800 words',
            placeholder: 'Start writing your essay...\n\nTips:\n1. Clear theme and purpose\n2. Complete structure: introduction, body, conclusion\n3. Smooth language and logical flow\n4. Use appropriate rhetorical devices',
            targetWords: 800
        }
    },
    diary: {
        zh: {
            name: '日记本',
            info: '📖 日记模式 - 记录你的日常生活和心情',
            placeholder: '今天是个特别的日子...\n\n你可以写下：\n- 今天发生的事情\n- 你的感受和想法\n- 对未来的期待\n- 任何想要记录的内容',
            targetWords: 300
        },
        en: {
            name: 'Diary',
            info: '📖 Diary Mode - Record your daily life and feelings',
            placeholder: 'Today is a special day...\n\nYou can write about:\n- What happened today\n- Your feelings and thoughts\n- Expectations for the future\n- Anything you want to record',
            targetWords: 300
        }
    },
    free: {
        zh: {
            name: '自由写作',
            info: '✍️ 自由写作模式 - 无拘无束，自由表达',
            placeholder: '在这里自由地写作...\n\n没有限制，没有框架\n让思想自由流淌\n记录下你想表达的一切',
            targetWords: 0
        },
        en: {
            name: 'Free Writing',
            info: '✍️ Free Writing Mode - Express yourself freely',
            placeholder: 'Write freely here...\n\nNo restrictions, no framework\nLet your thoughts flow\nRecord everything you want to express',
            targetWords: 0
        }
    }
};

// AI Suggestions Database
const aiSuggestions = {
    zh: {
        writing: [
            '💡 建议：开篇可以用一个引人入胜的问题或场景来吸引读者。',
            '💡 建议：在段落之间添加过渡句，使文章更流畅。',
            '💡 建议：尝试使用具体的例子来支持你的观点。',
            '💡 建议：结尾可以呼应开头，形成完整的结构。',
            '💡 建议：使用更多的感官描写，让读者身临其境。'
        ],
        improvement: [
            '✨ 改进建议：这段话可以更精炼。考虑删除重复的内容。',
            '✨ 改进建议：动词可以更具体，让表达更生动。',
            '✨ 改进建议：句式可以更多样化，避免单调。',
            '✨ 改进建议：添加更多细节描写，使内容更丰富。'
        ],
        grammar: [
            '✓ 语法检查：检查标点符号的使用是否规范。',
            '✓ 语法检查：注意主谓一致性。',
            '✓ 语法检查：确保句子结构完整。',
            '✓ 语法检查：检查是否有错别字。'
        ],
        ideas: [
            '🎯 思路扩展：可以从不同角度探讨这个主题。',
            '🎯 思路扩展：考虑添加对比论证，使论点更有说服力。',
            '🎯 思路扩展：可以引用名言或数据来支持观点。',
            '🎯 思路扩展：尝试从个人经历出发，使文章更真实。'
        ]
    },
    en: {
        writing: [
            '💡 Suggestion: Start with an engaging question or scene to attract readers.',
            '💡 Suggestion: Add transition sentences between paragraphs for better flow.',
            '💡 Suggestion: Try using specific examples to support your points.',
            '💡 Suggestion: Echo the opening in your conclusion for a complete structure.',
            '💡 Suggestion: Use more sensory descriptions to immerse readers.'
        ],
        improvement: [
            '✨ Improvement: This paragraph could be more concise. Consider removing repetitive content.',
            '✨ Improvement: Use more specific verbs for vivid expression.',
            '✨ Improvement: Vary sentence structure to avoid monotony.',
            '✨ Improvement: Add more details to enrich the content.'
        ],
        grammar: [
            '✓ Grammar Check: Review punctuation usage.',
            '✓ Grammar Check: Check subject-verb agreement.',
            '✓ Grammar Check: Ensure complete sentence structure.',
            '✓ Grammar Check: Look for spelling errors.'
        ],
        ideas: [
            '🎯 Idea Expansion: Explore this topic from different angles.',
            '🎯 Idea Expansion: Consider using comparative arguments for stronger points.',
            '🎯 Idea Expansion: Quote famous sayings or data to support your views.',
            '🎯 Idea Expansion: Draw from personal experience for authenticity.'
        ]
    }
};

// DOM Elements
const mainEditor = document.getElementById('mainEditor');
const titleInput = document.getElementById('titleInput');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const paraCount = document.getElementById('paraCount');
const templateInfo = document.getElementById('templateInfo');
const aiOutput = document.getElementById('aiOutput');
const lastSaved = document.getElementById('lastSaved');
const autoSaveStatus = document.getElementById('autoSaveStatus');
const autoSaveStatusEn = document.getElementById('autoSaveStatusEn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSavedContent();
    updateTemplate();
    setupEventListeners();
    updateStats();
});

// Setup Event Listeners
function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
            updateTemplate();
        });
    });

    // Language switching
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            updateTemplate();
        });
    });

    // Text editing
    mainEditor.addEventListener('input', () => {
        updateStats();
        if (autoSaveEnabled) {
            debouncedSave();
        }
    });

    titleInput.addEventListener('input', () => {
        if (autoSaveEnabled) {
            debouncedSave();
        }
    });

    // AI buttons
    document.getElementById('getSuggestion').addEventListener('click', () => {
        showAISuggestion('writing');
    });

    document.getElementById('improveText').addEventListener('click', () => {
        showAISuggestion('improvement');
    });

    document.getElementById('checkGrammar').addEventListener('click', () => {
        showAISuggestion('grammar');
    });

    document.getElementById('expandIdeas').addEventListener('click', () => {
        showAISuggestion('ideas');
    });

    // Tool buttons
    document.getElementById('saveBtn').addEventListener('click', saveContent);
    document.getElementById('clearBtn').addEventListener('click', clearContent);
    document.getElementById('exportBtn').addEventListener('click', exportContent);
    document.getElementById('autoSaveToggle').addEventListener('click', toggleAutoSave);
}

// Update Template
function updateTemplate() {
    const template = templates[currentMode][currentLanguage];
    templateInfo.innerHTML = `<p>${template.info}</p>`;
    mainEditor.placeholder = template.placeholder;
}

// Update Statistics
function updateStats() {
    const text = mainEditor.value;
    const chars = text.length;
    
    // Count words (handle both Chinese and English)
    let words;
    if (currentLanguage === 'zh') {
        // For Chinese, count characters excluding spaces and punctuation
        words = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    } else {
        // For English, count words separated by spaces
        words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }
    
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0).length;
    
    charCount.textContent = chars;
    wordCount.textContent = words;
    paraCount.textContent = paragraphs;
}

// AI Suggestion
function showAISuggestion(type) {
    const suggestions = aiSuggestions[currentLanguage][type];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    aiOutput.innerHTML = `<p class="suggestion">${randomSuggestion}</p>`;
    
    // Add contextual suggestions based on content
    if (mainEditor.value.length > 0) {
        const wordCount = currentLanguage === 'zh' 
            ? mainEditor.value.replace(/[^\u4e00-\u9fa5]/g, '').length
            : mainEditor.value.trim().split(/\s+/).length;
        
        const targetWords = templates[currentMode][currentLanguage].targetWords;
        
        if (targetWords > 0) {
            const progress = (wordCount / targetWords * 100).toFixed(0);
            const progressText = currentLanguage === 'zh'
                ? `<br><br>📊 当前进度: ${wordCount}/${targetWords} 字 (${progress}%)`
                : `<br><br>📊 Current Progress: ${wordCount}/${targetWords} words (${progress}%)`;
            aiOutput.innerHTML += progressText;
        }
    }
}

// Save Content
function saveContent() {
    const content = {
        mode: currentMode,
        language: currentLanguage,
        title: titleInput.value,
        text: mainEditor.value,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentContent', JSON.stringify(content));
    
    // Save to history
    contentHistory.unshift(content);
    if (contentHistory.length > 10) {
        contentHistory.pop();
    }
    localStorage.setItem('contentHistory', JSON.stringify(contentHistory));
    
    const now = new Date().toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
    lastSaved.textContent = now;
    
    showNotification(currentLanguage === 'zh' ? '✓ 已保存' : '✓ Saved');
}

// Debounced Save
let saveTimeout;
function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveContent, 2000);
}

// Load Saved Content
function loadSavedContent() {
    const saved = localStorage.getItem('currentContent');
    if (saved) {
        const content = JSON.parse(saved);
        currentMode = content.mode || 'composition';
        currentLanguage = content.language || 'zh';
        titleInput.value = content.title || '';
        mainEditor.value = content.text || '';
        
        // Update UI
        document.querySelector(`[data-mode="${currentMode}"]`).classList.add('active');
        document.querySelector(`input[value="${currentLanguage}"]`).checked = true;
        
        updateStats();
        updateTemplate();
    }
    
    // Load history
    const history = localStorage.getItem('contentHistory');
    if (history) {
        contentHistory = JSON.parse(history);
    }
}

// Clear Content
function clearContent() {
    const confirmText = currentLanguage === 'zh' 
        ? '确定要清空内容吗？此操作不可撤销。'
        : 'Are you sure you want to clear all content? This cannot be undone.';
    
    if (confirm(confirmText)) {
        titleInput.value = '';
        mainEditor.value = '';
        updateStats();
        showNotification(currentLanguage === 'zh' ? '✓ 已清空' : '✓ Cleared');
    }
}

// Export Content
function exportContent() {
    const title = titleInput.value || (currentLanguage === 'zh' ? '未命名文档' : 'Untitled Document');
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

// Toggle Auto Save
function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    const statusZh = autoSaveEnabled ? '开启' : '关闭';
    const statusEn = autoSaveEnabled ? 'ON' : 'OFF';
    autoSaveStatus.textContent = statusZh;
    autoSaveStatusEn.textContent = statusEn;
    
    showNotification(
        currentLanguage === 'zh' 
            ? `自动保存已${statusZh}` 
            : `Auto-save ${statusEn}`
    );
}

// Show Notification
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

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
