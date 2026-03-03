// Core application logic for the writing guidance platform

// State
let tips = [
    "每天尝试写一点，即使只是一句话，久而久之你会发现进步。",
    "写作前先列出要点，这有助于保持文章结构清晰。",
    "不要害怕修改，初稿只是为理解想法而写的草稿。",
    "读别人的好文章可以激发灵感，但要找到自己的声音。",
    "在写作过程中不断问自己：这句话真正表达了什么？",
];
let currentTipIndex = 0;

let inspirationIdeas = {
    opening: [
        "从一个令人惊讶的事实开始，可以立即吸引读者注意力。",
        "讲一个小故事或个人经历，拉近与读者的距离。",
        "提出一个问题，让读者开始思考。",
        "运用一句名言或俗语，让读者产生共鸣。",
    ],
    middle: [
        "使用对比来强调你的观点，例如‘过去……现在……’。",
        "用例子或数据来支持你的主论点。",
        "插入读者可能熟悉的小故事，以增强代入感。",
        "分解复杂概念，用简单语言解释每一步。",
    ],
    closing: [
        "总结主要观点并提出一个有力的呼吁行动。",
        "用一个发人深省的问题结束，让读者继续思考。",
        "引用一句与主题相关的名言作为结尾。",
        "设想未来的情景，给读者留下想象空间。",
    ],
    transition: [
        "使用标志词如‘另外’，‘接下来’，‘再者’等让段落衔接更自然。",
        "在段落之间回顾前文要点并引出新话题。",
        "通过问题引导，例如‘那么，我们该如何……？’来连接段落。",
        "短句过渡，比复杂语句更容易被理解。",
    ],
    voice: [
        "尝试模仿不同的写作风格，然后再发展成自己的风格。",
        "考虑目标读者的文化和背景，以决定语气是正式还是亲切。",
        "在写作中使用第一人称可以建立亲密感，第三人称更客观。",
    ],
    engagement: [
        "在文章中加入问题，让读者参与思考。",
        "使用生动的描述和感官语言激发想象力。",
        "通过列出实际步骤让读者觉得内容可执行。",
        "引用真实案例增加可信度。",
    ],
};

// Project management
let projects = [];

function startNewProject() {
    document.getElementById("project-editor").style.display = "flex";
}

function closeProjectEditor() {
    document.getElementById("project-form").reset();
    document.getElementById("project-editor").style.display = "none";
}

function createNewProject() {
    const name = document.getElementById("project-name").value.trim();
    const desc = document.getElementById("project-description").value.trim();
    const deadline = document.getElementById("project-deadline").value;

    if (!name) {
        showNotification("请输入项目标题", "error");
        return;
    }

    const project = { id: Date.now(), name, desc, deadline };
    projects.unshift(project);
    renderRecentProjects();
    showNotification("项目创建成功！");
    closeProjectEditor();
}

function renderRecentProjects() {
    const container = document.getElementById("recent-projects");
    container.innerHTML = "";
    if (projects.length === 0) {
        container.innerHTML = `<p class=\"empty-state\">还没有项目，开始创建一个吧！</p>`;
        return;
    }

    projects.forEach((p) => {
        const div = document.createElement("div");
        div.className = "project-item";
        div.innerHTML = `
            <h4>${p.name}</h4>
            <p>${p.desc || "（无描述）"}</p>
            <small>${p.deadline ? "截止：" + p.deadline : ""}</small>
        `;
        container.appendChild(div);
    });
}

function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.className = `notification ${type}`;
    notif.style.display = "block";
    setTimeout(() => {
        notif.style.display = "none";
    }, 3000);
}

// Tips handling
function showNextTip() {
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    document.getElementById("daily-tip").textContent = tips[currentTipIndex];
}

// -- 编辑器启动引导逻辑 --
let session = null;

const guidanceFlows = {
    "议论文": {
        initial: [
            "你这篇文章的核心观点是什么？可以用一句话概括吗？",
            "你打算从哪几个角度来论证这个观点？想到几个就说几个。",
        ],
        followup: [
            "如果有人说你的观点不对，你觉得他会从哪个角度反驳？",
            "你有没有特别想使用的素材？",
            "你打算用什么样的例子来支撑第一个角度？",
        ],
    },
    "记叙文": {
        initial: [
            "你准备讲述的事件或故事是什么？",
            "这个故事里有哪些关键人物或地点？",
        ],
        followup: [
            "哪个瞬间让你印象最深？",
            "你希望读者从这个故事中获得什么情感或启示？",
            "你打算使用怎样的细节来描绘场景？",
        ],
    },
    "学术论文": {
        initial: [
            "你的研究问题是什么？",
            "为了回答这个问题，你打算采用什么方法？",
        ],
        followup: [
            "如果审稿人质疑你的假设，你会怎样回应？",
            "你有哪些数据或文献已经有了？",
            "你的结论可能有哪些实际应用？",
        ],
    },
};

function startWritingSession() {
    const type = document.getElementById("doc-type-select").value;
    if (!type) {
        showNotification("请选择文体", "warning");
        return;
    }
    session = {
        type,
        stage: 1,
        qIndex: 0,
        answers: [],
        list: [],
        awaitingConfirmation: false,
    };
    // clear previous chat
    document.getElementById("guidance-content").innerHTML = "";
    document.getElementById("writing-area").value = "";
    // switch to editor tab
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"));
    document.querySelector(".nav-btn[data-tab=editor]").classList.add("active");
    document.getElementById("editor").classList.add("active");

    appendChat("system", `你选择了【${type}】，我们来开始吧。`);
    askNextGuidanceQuestion();
}

function askNextGuidanceQuestion() {
    if (!session) return;
    const flow = guidanceFlows[session.type];
    let q;
    if (session.stage === 1) {
        q = flow.initial[session.qIndex];
    } else {
        q = flow.followup[session.qIndex];
    }
    if (q) {
        appendChat("system", q);
    }
}

function handleGuidanceSubmit() {
    if (!session) return;
    const inputEl = document.getElementById("guidance-input");
    let answer = inputEl.value.trim();
    if (!answer) return;
    appendChat("user", answer);
    inputEl.value = "";

    if (session.stage === 1 && session.qIndex === 1) {
        // parse list from second question answer
        let parts = answer.split(/[，,；;、\s]+/).map(s=>s.trim()).filter(Boolean);
        session.list = parts;
        session.awaitingConfirmation = true;
        appendChat("system", `你提到的要点有：${parts.join('、')}。如需修改或补充请继续输入，否则输入“确定”。`);
        return; // wait for confirmation before advancing
    }

    if (session.awaitingConfirmation) {
        if (answer === "确定") {
            session.awaitingConfirmation = false;
            // move to next stage
            session.stage = 2;
            session.qIndex = 0;
            appendChat("system", "我们来进行第二轮深度提问。请根据提示回答。");
            askNextGuidanceQuestion();
            return;
        } else {
            // interpret as updated list
            let parts = answer.split(/[，,；;、\s]+/).map(s=>s.trim()).filter(Boolean);
            session.list = parts;
            appendChat("system", `已更新要点：${parts.join('、')}。如需继续修改请再输入，否则输入“确定”。`);
            return;
        }
    }

    if (answer !== "确定") {
        session.answers.push(answer);
    }

    // advance normally
    session.qIndex++;
    const flow = guidanceFlows[session.type];
    let finishFirst = session.stage === 1 && session.qIndex >= flow.initial.length;
    if (finishFirst) {
        // if user somehow skipped confirmation, still move
        session.stage = 2;
        session.qIndex = 0;
        appendChat("system", "我们来进行第二轮深度提问。请根据提示回答。");
        askNextGuidanceQuestion();
    } else if (session.stage === 2 && session.qIndex >= flow.followup.length) {
        generateOutlineFromSession();
    } else {
        askNextGuidanceQuestion();
    }
}

function appendChat(role, text) {
    const container = document.getElementById("guidance-content");
    const div = document.createElement("div");
    div.className = role === "user" ? "user-msg" : "system-msg";
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function generateOutlineFromSession() {
    if (!session) return;
    let sections = [];
    if (session.type === "议论文") {
        session.list.forEach((angle, idx) => {
            sections.push({
                title: angle,
                material: "建议引用相关案例或数据",
                length: "约200字",
                keyPoints: "阐述观点并反驳可能的反对意见",
            });
        });
    } else if (session.type === "记叙文") {
        session.list.forEach((item, idx) => {
            sections.push({
                title: `段落 ${idx + 1} - ${item}`,
                material: "丰富人物和环境描写",
                length: "适当分段，保持节奏",
                keyPoints: "突出情感和事件发展",
            });
        });
    } else if (session.type === "学术论文") {
        session.list.forEach((item, idx) => {
            sections.push({
                title: `部分 ${idx + 1} - ${item}`,
                material: "引用数据或文献",
                length: "约500字",
                keyPoints: "描述方法/结果/讨论",
            });
        });
    }
    appendChat("system", "根据你的回答，系统为你准备了基础大纲：");
    sections.forEach((sec, i) => {
        appendChat(
            "system",
            `${i + 1}. ${sec.title} （${sec.length}）
            适用素材：${sec.material}
            关键点：${sec.keyPoints}`
        );
    });
    appendChat("system", "如需继续修改或开始写作，可直接在编辑区进行。祝你写作顺利！");
}

// Outline generation logic
function generateOutline() {
    const topic = document.getElementById("article-topic").value.trim();
    const type = document.getElementById("article-type").value;
    const depth = document.getElementById("outline-depth").value;
    const audience = document.getElementById("target-audience").value.trim();
    const keyPoints = document.getElementById("key-points").value
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

    if (!topic) {
        showNotification("请输入文章主题", "warning");
        return;
    }

    // simple simulated algorithm for outline creation
    let sections = [];
    let baseCount = depth === "simple" ? 3 : depth === "detailed" ? 8 : 5;
    for (let i = 1; i <= baseCount; i++) {
        sections.push({
            title: `${topic} - 部分 ${i}`,
            description: `描述第 ${i} 部分的内容`
        });
    }
    if (keyPoints.length > 0) {
        keyPoints.forEach((kp, idx) => {
            if (idx < sections.length) {
                sections[idx].description += `，包括：${kp}`;
            }
        });
    }

    const outline = {
        topic,
        type,
        depth,
        audience,
        sections
    };

    displayOutline(outline);
}

function displayOutline(out) {
    const outContainer = document.getElementById("outline-output");
    const guidanceContainer = document.getElementById("outline-guidance");
    const list = document.getElementById("generated-outline");

    list.innerHTML = "";
    out.sections.forEach((sec, idx) => {
        const li = document.createElement("div");
        li.className = "outline-item";
        li.innerHTML = `
            <div class=\"outline-item-title\">${idx + 1}. ${sec.title}</div>
            <div class=\"outline-item-desc\">${sec.description}</div>
        `;
        list.appendChild(li);
    });

    guidanceContainer.textContent = `基于 '${out.topic}' 这一主题，试图确保每个部分都逐步展开，清楚地说明关键信息并链接前后内容。`;    

    outContainer.style.display = "block";
}

function editOutline() {
    document.getElementById("outline-output").style.display = "none";
}

function downloadOutline() {
    // 数据下载示例
    const blob = new Blob([document.getElementById("generated-outline").innerText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outline.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function startWritingFromOutline() {
    showNotification("开始写作 - 功能尚未实现");
}

// Material recommendation logic
function recommendMaterials() {
    const topic = document.getElementById("material-topic").value.trim();
    const type = document.getElementById("material-type").value;
    const difficulty = document.getElementById("material-difficulty").value;

    if (!topic) {
        showNotification("请输入写作主题", "warning");
        return;
    }

    // simulate recommendation
    let items = [];
    for (let i = 1; i <= 6; i++) {
        items.push({
            title: `${topic} 资源 ${i}`,
            desc: `这是与 '${topic}' 相关的示例素材 ${i}。`,
            tags: [type || "综合", difficulty || "中级"],
            scene: `适用于第${i}个分论点`,
            example: `你可以这样引用：这里引用一个示例${i}。`,
        });
    }

    displayMaterials(items);
}

let userMaterialPrefs = [];
let currentMaterials = [];

function displayMaterials(list) {
    currentMaterials = list.slice();
    const output = document.getElementById("materials-output");
    const grid = document.getElementById("materials-list");
    grid.innerHTML = "";

    list.forEach((m, idx) => {
        const card = document.createElement("div");
        card.className = "material-card";
        card.innerHTML = `
            <h4>${m.title}</h4>
            <p>${m.desc}</p>
            <p class=\"material-scene\"><strong>适用场景：</strong>${m.scene}</p>
            <p class=\"material-example\"><strong>使用示例：</strong>${m.example}</p>
            <div>${m.tags.map(t=>`<span class=\"material-tag\">${t}</span>`).join('')}</div>
        `;
        card.addEventListener('click', () => selectMaterial(idx, card));
        grid.appendChild(card);
    });

    output.style.display = "block";
}

function selectMaterial(index, cardElement) {
    const item = currentMaterials[index];
    if (!item) return;
    userMaterialPrefs.push(item);
    cardElement.style.border = "2px solid var(--success-color)";
    showNotification("已添加到偏好素材");
}

function refreshMaterials() {
    // simply rerun last recommendation
    const topic = document.getElementById("material-topic").value.trim();
    if (!topic) return;
    recommendMaterials();
}

// Inspiration & inactivity handling
let writeTimer = null;

function resetInactivityTimer() {
    clearTimeout(writeTimer);
    // use shorter delay for demo (e.g. 15s) but logic mentions 3min
    writeTimer = setTimeout(triggerInspiration, 180000);
}

function triggerInspiration() {
    const area = document.getElementById("writing-area");
    const text = area.value;
    if (text.trim().length === 0) {
        appendChat('system', '似乎你还没开始写，想要一些开头灵感吗？');
        return;
    }
    // take last 200 chars
    const snippet = text.slice(-200);
    appendChat('system', `你在这里停下来了："${snippet}"。
            也许可以尝试这样继续：`);
    // provide a generic idea
    const randomIdeas = inspirationIdeas.middle.concat(inspirationIdeas.transition);
    const rand = randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
    appendChat('system', rand);
}

function triggerInspirationManually() {
    const random = Object.keys(inspirationIdeas);
    const key = random[Math.floor(Math.random() * random.length)];
    appendChat('system', '你请求了灵感：');
    appendChat('system', inspirationIdeas[key][Math.floor(Math.random() * inspirationIdeas[key].length)]);
}

// 优化修补功能
function optimizeText() {
    const text = document.getElementById("writing-area").value;
    if (!text.trim()) {
        showNotification("请先输入文本以便优化", "warning");
        return;
    }
    let questions = [];
    // 表达优化
    const matches = text.match(/很好/g);
    if (matches && matches.length > 2) {
        questions.push("这段话用了几个“很好”，可以用更丰富的词汇替换吗？");
    }
    // 论据补充
    if (/很多|一些/.test(text)) {
        questions.push("你提到“很多”，可以举一个具体的例子让论证更有说服力吗？");
    }
    // 结构调整
    const paras = text.split(/\n+/).filter(p=>p.trim());
    if (paras.length > 1) {
        const total = text.length;
        if (paras[0].length > total * 0.5) {
            questions.push("开头部分较长，考虑压缩引言，给正文更多篇幅吗？");
        }
    }
    // 逻辑完善
    if (/这很/.test(text)) {
        questions.push("你写到“这很...”，能具体说明是在哪些方面吗？");
    }

    if (questions.length === 0) {
        questions.push("暂时没有特别明显的问题，建议再阅读一遍检查细节。");
    }

    appendChat('system', "以下是优化建议，请根据提示思考：");
    questions.forEach(q => appendChat('system', q));
}

// Inspiration prompts
function getInspirationForProblem(problem) {
    const ideas = inspirationIdeas[problem];
    if (!ideas) return;
    const content = document.getElementById("inspiration-content");
    const randIdx = Math.floor(Math.random() * ideas.length);
    content.innerHTML = `<p>${ideas[randIdx]}</p>`;
    document.getElementById("inspiration-output").style.display = "block";
    currentInspirationProblem = problem;
}

let currentInspirationProblem = null;

function getNewInspirationIdea() {
    if (!currentInspirationProblem) return;
    getInspirationForProblem(currentInspirationProblem);
}

// Lessons
let lessons = {
    clarity: {
        title: "清晰表达",
        body: `
            <p>写作的第一步是清晰。确保你的句子表达出的意义直接，避免冗长和模糊。
            你可以在写作前先用口语说明一遍内容，然后再写下来。</p>
            <ul>
                <li>使用简洁的词语。</li>
                <li>保持句子短小。</li>
                <li>多次阅读并检查歧义。</li>
            </ul>
        `,
    },
    structure: {
        title: "文章结构",
        body: `
            <p>良好的结构让读者易于跟随。常见结构包括：</p>
            <ol>
                <li>引言 - 提出主题并吸引读者。</li>
                <li>主体 - 展开论点，支持信息。</li>
                <li>结论 - 总结要点或发出行动号召。</li>
            </ol>
            <p>你也可以使用问题 - 回答方式来组织内容。</p>
        `,
    },
    style: {
        title: "写作风格",
        body: `
            <p>风格是指你使用语言的方式。
            可以是正式、幽默、简洁、描写性等。找到适合你的风格并保持一致。
            试着阅读不同类型的作者并模仿，然后慢慢发展自己的声音。</p>
        `,
    },
    persuasion: {
        title: "说服性写作",
        body: `
            <p>说服性写作需要逻辑与证据。
            使用事实数据、专家意见和真实案例支持你的观点。</p>
            <ul>
                <li>明确你的立场。</li>
                <li>预见反对意见并回应它们。</li>
                <li>使用强烈的结尾来呼吁行动。</li>
            </ul>
        `,
    },
    storytelling: {
        title: "故事叙述",
        body: `
            <p>好的故事有角色、冲突和转折。
            即使是非 fiction 文章，也可以通过讲故事来增强趣味性。</p>
            <ul>
                <li>描述场景和情感。</li>
                <li>使用对话和细节。</li>
            </ul>
        `,
    },
    editing: {
        title: "编辑修订",
        body: `
            <p>写作完成后是编辑阶段。
            把注意力放在语法、重复、逻辑流畅性和词语选择上。
            让文本休息一段时间后再回来看，效果更佳。</p>
        `,
    },
    vocabulary: {
        title: "词汇扩展",
        body: `
            <p>广泛阅读是提升词汇最有效的方法。
            你可以记录新词并练习在句子中使用它们。
            但要避免使用生僻词让读者迷惑。</p>
        `,
    },
    grammar: {
        title: "语法应用",
        body: `
            <p>正确的语法使文章更专业。
            可以借助语法工具检测错误，同时学习常见规则如时态、一致性等。</p>
        `,
    },
    feedback: {
        title: "反馈应用",
        body: `
            <p>从他人那里获取反馈是进步的关键。
            重点关注可改进的具体建议并付诸实践。
            不要仅接受赞美，也不要对批评过于敏感。</p>
        `,
    },
};

function showLesson(key) {
    const lesson = lessons[key];
    if (!lesson) return;
    document.getElementById("lesson-title").textContent = lesson.title;
    document.getElementById("lesson-body").innerHTML = lesson.body;
    document.getElementById("lesson-content").style.display = "block";
}

function closeLessonContent() {
    document.getElementById("lesson-content").style.display = "none";
}

// Navigation
const navButtons = document.querySelectorAll(".nav-btn");
navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.tab;
        document.getElementById(tab).classList.add("active");
        if (tab === 'editor') {
            resetInactivityTimer();
        } else {
            clearTimeout(writeTimer);
        }
    });
});

// Initialize
window.onload = function () {
    document.getElementById("daily-tip").textContent = tips[currentTipIndex];
    const guideInput = document.getElementById('guidance-input');
    if (guideInput) {
        guideInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleGuidanceSubmit();
                e.preventDefault();
            }
        });
    }
};
