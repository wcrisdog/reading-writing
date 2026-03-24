import { readFile } from 'node:fs/promises';

const RAG_DATA_URL = new URL('../../data/rag-materials.json', import.meta.url);
const CJK_RE = /[\u4e00-\u9fff]{2,}/g;
const WORD_RE = /[a-z0-9]{2,}/g;

let cachedCorpus = null;

function tokenize(text) {
    if (!text) {
        return [];
    }

    const normalized = String(text).toLowerCase();
    const tokens = new Set();

    const wordMatches = normalized.match(WORD_RE) || [];
    for (const token of wordMatches) {
        tokens.add(token);
    }

    const cjkBlocks = normalized.match(CJK_RE) || [];
    for (const block of cjkBlocks) {
        if (block.length <= 2) {
            tokens.add(block);
            continue;
        }

        for (let i = 0; i < block.length - 1; i += 1) {
            tokens.add(block.slice(i, i + 2));
        }
    }

    return [...tokens];
}

function scoreDocument(doc, queryTokens, essayType, requestType) {
    const docText = [
        doc.title,
        doc.content,
        ...(Array.isArray(doc.tags) ? doc.tags : []),
        doc.source
    ].join(' ');

    const docTokens = new Set(tokenize(docText));
    let overlap = 0;

    for (const token of queryTokens) {
        if (docTokens.has(token)) {
            overlap += 1;
        }
    }

    let score = overlap;

    if (doc.essayType === essayType) {
        score += 3;
    } else if (doc.essayType === 'generic') {
        score += 1;
    }

    const tags = Array.isArray(doc.tags) ? doc.tags : [];
    if (requestType === 'contextual-inspiration' && tags.includes('结构')) {
        score += 1;
    }

    return score;
}

async function loadCorpus() {
    if (cachedCorpus) {
        return cachedCorpus;
    }

    const raw = await readFile(RAG_DATA_URL, 'utf-8');
    const parsed = JSON.parse(raw);
    cachedCorpus = Array.isArray(parsed) ? parsed : [];
    return cachedCorpus;
}

export async function retrieveRelevantChunks({
    query,
    essayType,
    requestType,
    topK = 3
}) {
    const corpus = await loadCorpus();
    const queryTokens = tokenize(query);

    const scored = corpus
        .map((doc) => ({
            doc,
            score: scoreDocument(doc, queryTokens, essayType, requestType)
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    const chunks = scored.map((item, idx) => ({
        id: item.doc.id,
        rank: idx + 1,
        score: item.score,
        title: item.doc.title,
        source: item.doc.source,
        content: item.doc.content
    }));

    return {
        chunks,
        queryTokenCount: queryTokens.length
    };
}

export function buildRagSystemPrompt(chunks, language = 'zh') {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        return '';
    }

    const references = chunks
        .map((chunk) => `[R${chunk.rank}] ${chunk.title} | ${chunk.source}\n${chunk.content}`)
        .join('\n\n');

    if (language === 'en') {
        return `Use the following retrieved references as the first-priority evidence and style anchor.\nIf references conflict with generic knowledge, prioritize references.\nDo not fabricate citations outside retrieved references.\n\nRetrieved references:\n${references}`;
    }

    return `请优先使用以下检索到的参考片段来生成回答。\n若与通用知识冲突，以检索片段为准。\n不要编造未出现在检索片段中的引用来源。\n\n检索参考：\n${references}`;
}
