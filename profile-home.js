const AUTH_USERS_KEY = 'rwAuthUsers';
const AUTH_SESSION_KEY = 'rwAuthSession';
const AUTH_APP_NAMESPACE = 'readingWriting';

const profileState = {
    avatar: '',
    nickname: '',
    realName: '',
    gender: '',
    grade: '',
    writingStyle: ''
};

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function getCurrentScope() {
    const session = readJson(AUTH_SESSION_KEY, null);
    if (session?.userId) {
        const users = readJson(AUTH_USERS_KEY, []);
        const found = users.find(user => user.id === session.userId);
        if (found) return found.id;
    }
    return 'guest';
}

function getScopedStorageKey(baseKey) {
    return `${AUTH_APP_NAMESPACE}:${getCurrentScope()}:${baseKey}`;
}

function getScopedStorageValue(baseKey) {
    return localStorage.getItem(getScopedStorageKey(baseKey));
}

function setScopedStorageValue(baseKey, value) {
    localStorage.setItem(getScopedStorageKey(baseKey), value);
}

function showProfileFeedbackModal({ title, message, type = 'success' }) {
    const modal = document.getElementById('profileFeedbackModal');
    const dialog = document.querySelector('.profile-feedback-dialog');
    const titleEl = document.getElementById('profileFeedbackTitle');
    const messageEl = document.getElementById('profileFeedbackMessage');

    if (!modal || !dialog || !titleEl || !messageEl) return;

    dialog.classList.remove('is-success', 'is-error');
    dialog.classList.add(type === 'error' ? 'is-error' : 'is-success');
    titleEl.textContent = title || (type === 'error' ? '保存失败' : '保存成功');
    messageEl.textContent = message || '';
    modal.style.display = 'flex';
}

function closeProfileFeedbackModal() {
    const modal = document.getElementById('profileFeedbackModal');
    if (modal) modal.style.display = 'none';
}

let profileTipTimer = null;
function showProfileTipBar(message, duration = 1800) {
    if (!message) return;

    let tip = document.getElementById('profileTipBar');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'profileTipBar';
        tip.className = 'profile-tip-bar';
        document.body.appendChild(tip);
    }

    tip.textContent = message;
    tip.classList.add('show');

    if (profileTipTimer) {
        clearTimeout(profileTipTimer);
    }

    profileTipTimer = window.setTimeout(() => {
        tip.classList.remove('show');
    }, duration);
}

function convertFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('头像读取失败，请重试'));
        reader.readAsDataURL(file);
    });
}

function loadImageElement(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('头像图片格式不支持'));
        img.src = dataUrl;
    });
}

async function compressAvatarFile(file) {
    if (!file || !String(file.type || '').startsWith('image/')) {
        throw new Error('请选择图片文件作为头像');
    }

    const dataUrl = await convertFileToDataUrl(file);
    const img = await loadImageElement(dataUrl);
    const maxSide = 512;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('浏览器不支持头像处理');
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 优先转 JPEG 降低体积，必要时回退原图 dataURL。
    const compressed = canvas.toDataURL('image/jpeg', 0.82);
    return compressed.length < dataUrl.length ? compressed : dataUrl;
}

function updateAvatarDisplay(avatarUrl) {
    const imgEl = document.getElementById('profileAvatar');
    const fallbackEl = document.getElementById('profileAvatarFallback');
    if (!imgEl || !fallbackEl) return;

    if (avatarUrl) {
        imgEl.src = avatarUrl;
        imgEl.style.display = 'block';
        fallbackEl.style.display = 'none';
    } else {
        imgEl.removeAttribute('src');
        imgEl.style.display = 'none';
        fallbackEl.style.display = 'inline';
    }
}

function loadUserProfile() {
    const saved = getScopedStorageValue('userProfile');
    if (!saved) return;

    try {
        const loaded = JSON.parse(saved);
        profileState.avatar = String(loaded.avatar || '');
        profileState.nickname = String(loaded.nickname || '');
        profileState.realName = String(loaded.realName || '');
        profileState.gender = String(loaded.gender || '');
        profileState.grade = String(loaded.grade || '');
        profileState.writingStyle = String(loaded.writingStyle || '');
    } catch {}
}

function fillProfileForm() {
    document.getElementById('nicknameInput').value = profileState.nickname;
    document.getElementById('realNameInput').value = profileState.realName;
    document.getElementById('genderInput').value = profileState.gender;
    document.getElementById('gradeInput').value = profileState.grade;
    document.getElementById('styleInput').value = profileState.writingStyle;
    updateAvatarDisplay(profileState.avatar);
}

function saveProfile() {
    profileState.nickname = String(document.getElementById('nicknameInput').value || '').trim();
    profileState.realName = String(document.getElementById('realNameInput').value || '').trim();
    profileState.gender = String(document.getElementById('genderInput').value || '').trim();
    profileState.grade = String(document.getElementById('gradeInput').value || '').trim();
    profileState.writingStyle = String(document.getElementById('styleInput').value || '').trim();

    try {
        setScopedStorageValue('userProfile', JSON.stringify(profileState));
        showProfileFeedbackModal({
            title: '保存成功',
            message: '个人资料已保存。',
            type: 'success'
        });
    } catch (error) {
        console.error('保存个人资料失败:', error);
        showProfileFeedbackModal({
            title: '保存失败',
            message: '头像可能过大，请更换更小图片后重试。',
            type: 'error'
        });
    }
}

function getAbilityScore(abilities, key) {
    return Math.max(0, Math.min(100, Number(abilities?.[key] || 0)));
}

function buildAbilityRadarChart(abilities, abilityLabels) {
    const keys = ['structure', 'argumentation', 'language', 'materials', 'logic', 'reflection'];
    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 104;
    const angleStep = (Math.PI * 2) / keys.length;
    const startAngle = -Math.PI / 2;
    const values = keys.map(key => getAbilityScore(abilities, key));

    const levelPolygons = [20, 40, 60, 80, 100]
        .map((level) => {
            const points = keys.map((_, index) => {
                const angle = startAngle + index * angleStep;
                const x = cx + Math.cos(angle) * radius * (level / 100);
                const y = cy + Math.sin(angle) * radius * (level / 100);
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ');
            return `<polygon class="radar-level" points="${points}"></polygon>`;
        }).join('');

    const axisLines = keys.map((_, index) => {
        const angle = startAngle + index * angleStep;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}"></line>`;
    }).join('');

    const radarPoints = keys.map((_, index) => {
        const angle = startAngle + index * angleStep;
        const pointRadius = radius * (values[index] / 100);
        const x = cx + Math.cos(angle) * pointRadius;
        const y = cy + Math.sin(angle) * pointRadius;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    const radarDots = keys.map((_, index) => {
        const angle = startAngle + index * angleStep;
        const pointRadius = radius * (values[index] / 100);
        const x = cx + Math.cos(angle) * pointRadius;
        const y = cy + Math.sin(angle) * pointRadius;
        return `<circle class="radar-dot" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.2"></circle>`;
    }).join('');

    const labels = keys.map((key, index) => {
        const angle = startAngle + index * angleStep;
        const x = cx + Math.cos(angle) * (radius + 24);
        const y = cy + Math.sin(angle) * (radius + 24);
        const anchor = Math.cos(angle) > 0.2 ? 'start' : (Math.cos(angle) < -0.2 ? 'end' : 'middle');
        return `<text class="radar-label" x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="${anchor}">${abilityLabels[key] || key} ${values[index]}</text>`;
    }).join('');

    const avg = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

    return `
        <div class="ability-radar-wrap">
            <svg class="ability-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="六维能力雷达图">
                ${levelPolygons}
                ${axisLines}
                <polygon class="radar-shape" points="${radarPoints}"></polygon>
                ${radarDots}
                ${labels}
            </svg>
            <p class="ability-radar-meta">六维平均分：<strong>${avg}</strong></p>
        </div>
    `;
}

function renderGrowthArchive() {
    const container = document.getElementById('growthArchiveContent');
    const saved = getScopedStorageValue('growthProfile');
    if (!saved) {
        container.innerHTML = '<p class="muted">暂无成长档案。请先在主页面完成写作并生成报告。</p>';
        return;
    }

    let growthProfile = null;
    try {
        growthProfile = JSON.parse(saved);
    } catch {
        container.innerHTML = '<p class="muted">成长档案读取失败。</p>';
        return;
    }

    const essays = Array.isArray(growthProfile.essays) ? growthProfile.essays : [];
    if (essays.length === 0) {
        container.innerHTML = '<p class="muted">暂无成长档案。请先在主页面完成写作并生成报告。</p>';
        return;
    }

    const abilities = growthProfile.abilities || {};
    const milestones = Array.isArray(growthProfile.milestones) ? growthProfile.milestones : [];
    const recentEssays = essays.slice(-3).reverse();

    const abilityLabels = {
        structure: '结构',
        argumentation: '论证/描写',
        language: '语言',
        materials: '素材',
        logic: '逻辑/情节',
        reflection: '反思/立意'
    };

    const radarHtml = buildAbilityRadarChart(abilities, abilityLabels);

    const avgScore = Math.round(essays.reduce((sum, essay) => sum + Number(essay.totalScore || 0), 0) / essays.length);
    const bestScore = Math.max(...essays.map(essay => Number(essay.totalScore || 0)));

    let essayItemsHtml = '';
    recentEssays.forEach((essay) => {
        const date = new Date(essay.timestamp).toLocaleDateString('zh-CN');
        essayItemsHtml += `
            <div class="growth-item recent-writing-entry" role="button" tabindex="0" aria-label="打开最近写作继续编辑">
                <strong>${essay.title || '未命名'}</strong>
                <p class="muted">得分 ${essay.totalScore || 0} · ${essay.wordCount || 0} 字 · ${date}</p>
            </div>
        `;
    });

    const latestMilestone = milestones.length > 0 ? milestones[milestones.length - 1] : null;

    container.innerHTML = `
        <div class="growth-grid">
            <div class="growth-item">
                <strong>累计文章</strong>
                <p class="muted">${essays.length} 篇</p>
            </div>
            <div class="growth-item">
                <strong>平均分 / 最高分</strong>
                <p class="muted">${avgScore} / ${bestScore}</p>
            </div>
        </div>

        <div class="growth-item">
            <strong>六维能力</strong>
            <div>${radarHtml}</div>
        </div>

        ${latestMilestone ? `<div class="growth-item"><strong>最近里程碑</strong><p class="muted">${latestMilestone.description || '-'}</p></div>` : ''}

        <div>
            <strong class="recent-writing-link" role="button" tabindex="0" aria-label="打开最近写作继续编辑">最近写作</strong>
            <div class="section-body">${essayItemsHtml}</div>
        </div>
    `;
}

function readLastWritingContentForResume() {
    const currentContentRaw = getScopedStorageValue('currentContent');
    if (currentContentRaw) {
        try {
            const content = JSON.parse(currentContentRaw);
            if (String(content?.text || '').trim()) {
                return {
                    type: content.type || 'argumentative',
                    level: content.level || 'high-school',
                    language: content.language || 'zh',
                    title: content.title || '',
                    text: content.text || '',
                    targetWordsConfig: content.targetWordsConfig,
                    timestamp: content.timestamp || new Date().toISOString()
                };
            }
        } catch {}
    }

    const latestReportRaw = getScopedStorageValue('latestWritingReport');
    if (latestReportRaw) {
        try {
            const report = JSON.parse(latestReportRaw);
            const reportText = String(report?.articleContent || '').trim();
            if (reportText) {
                return {
                    type: report.type || 'argumentative',
                    level: 'high-school',
                    language: report.language || 'zh',
                    title: report.title || '',
                    text: reportText,
                    timestamp: new Date().toISOString()
                };
            }
        } catch {}
    }

    return null;
}

function openMainWritingWithLastContent() {
    const lastWriting = readLastWritingContentForResume();
    if (!lastWriting) {
        showProfileFeedbackModal({
            title: '暂无可恢复内容',
            message: '未找到上次写作正文，请先在主写作界面保存内容后再试。',
            type: 'error'
        });
        return;
    }

    setScopedStorageValue('currentContent', JSON.stringify(lastWriting));
    showProfileTipBar('已在新窗口打开并恢复上次内容');

    window.setTimeout(() => {
        const opened = window.open('index.html', '_blank', 'noopener');
        if (!opened) {
            window.location.href = 'index.html';
        }
    }, 180);
}

function renderLatestReport() {
    const container = document.getElementById('latestReportContent');
    const saved = getScopedStorageValue('latestWritingReport');

    if (!saved) {
        container.innerHTML = '<p class="muted">暂无写作报告。请先在主页面点击“完成并生成报告”。</p>';
        return;
    }

    let report = null;
    try {
        report = JSON.parse(saved);
    } catch {
        container.innerHTML = '<p class="muted">写作报告读取失败。</p>';
        return;
    }

    const updatedTime = report.updatedAt ? new Date(report.updatedAt).toLocaleString('zh-CN') : '未知时间';
    const title = report.title || '未命名作文';

    container.innerHTML = `
        <p class="report-meta">标题：${title} ｜ 更新时间：${updatedTime}</p>
        <div class="report-html">${String(report.html || '').trim() || '<p class="muted">报告内容为空</p>'}</div>
    `;
}

function bindEvents() {
    const avatarInput = document.getElementById('profileAvatarInput');
    const resetAvatarBtn = document.getElementById('resetAvatarBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const closePageBtn = document.getElementById('closePageBtn');
    const closeProfileFeedbackBtn = document.getElementById('closeProfileFeedbackBtn');
    const confirmProfileFeedbackBtn = document.getElementById('confirmProfileFeedbackBtn');
    const profileFeedbackModal = document.getElementById('profileFeedbackModal');

    if (avatarInput) {
        avatarInput.addEventListener('change', async (event) => {
            const file = event.target?.files?.[0];
            if (!file) return;

            try {
                const compressed = await compressAvatarFile(file);
                profileState.avatar = compressed;
                updateAvatarDisplay(profileState.avatar);
            } catch (error) {
                console.error('头像处理失败:', error);
                showProfileFeedbackModal({
                    title: '头像处理失败',
                    message: error.message || '请更换图片后重试。',
                    type: 'error'
                });
            }

            event.target.value = '';
        });
    }

    if (resetAvatarBtn) {
        resetAvatarBtn.addEventListener('click', () => {
            profileState.avatar = '';
            updateAvatarDisplay('');
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }

    if (closePageBtn) {
        closePageBtn.addEventListener('click', () => {
            if (window.opener) {
                window.close();
                return;
            }
            window.location.href = 'index.html';
        });
    }

    if (closeProfileFeedbackBtn) {
        closeProfileFeedbackBtn.addEventListener('click', closeProfileFeedbackModal);
    }

    if (confirmProfileFeedbackBtn) {
        confirmProfileFeedbackBtn.addEventListener('click', closeProfileFeedbackModal);
    }

    if (profileFeedbackModal) {
        profileFeedbackModal.addEventListener('click', (event) => {
            if (event.target === profileFeedbackModal) {
                closeProfileFeedbackModal();
            }
        });
    }

    document.addEventListener('click', (event) => {
        const trigger = event.target?.closest?.('.recent-writing-entry, .recent-writing-link');
        if (!trigger) return;
        openMainWritingWithLastContent();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const trigger = event.target?.closest?.('.recent-writing-entry, .recent-writing-link');
        if (!trigger) return;
        event.preventDefault();
        openMainWritingWithLastContent();
    });

    window.addEventListener('storage', (event) => {
        if (!event.key) return;
        if (event.key.endsWith(':growthProfile')) renderGrowthArchive();
        if (event.key.endsWith(':latestWritingReport')) renderLatestReport();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    fillProfileForm();
    renderGrowthArchive();
    renderLatestReport();
    bindEvents();
});
