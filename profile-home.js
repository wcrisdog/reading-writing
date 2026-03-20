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

    setScopedStorageValue('userProfile', JSON.stringify(profileState));
    alert('个人资料已保存');
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

    let abilityHtml = '';
    Object.entries(abilities).forEach(([key, score]) => {
        const numericScore = Math.max(0, Math.min(100, Number(score || 0)));
        abilityHtml += `
            <div class="ability-row">
                <span>${abilityLabels[key] || key}</span>
                <div class="ability-track"><div class="ability-fill" style="width:${numericScore}%"></div></div>
                <strong>${numericScore}</strong>
            </div>
        `;
    });

    const avgScore = Math.round(essays.reduce((sum, essay) => sum + Number(essay.totalScore || 0), 0) / essays.length);
    const bestScore = Math.max(...essays.map(essay => Number(essay.totalScore || 0)));

    let essayItemsHtml = '';
    recentEssays.forEach((essay) => {
        const date = new Date(essay.timestamp).toLocaleDateString('zh-CN');
        essayItemsHtml += `
            <div class="growth-item">
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
            <div>${abilityHtml}</div>
        </div>

        ${latestMilestone ? `<div class="growth-item"><strong>最近里程碑</strong><p class="muted">${latestMilestone.description || '-'}</p></div>` : ''}

        <div>
            <strong>最近写作</strong>
            <div class="section-body">${essayItemsHtml}</div>
        </div>
    `;
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

    if (avatarInput) {
        avatarInput.addEventListener('change', (event) => {
            const file = event.target?.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                profileState.avatar = String(reader.result || '');
                updateAvatarDisplay(profileState.avatar);
            };
            reader.readAsDataURL(file);
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
