import crypto from 'node:crypto';

const ALLOWED_PURPOSES = new Set(['login', 'register']);

export function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Content-Type');
}

export function assertPostMethod(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return false;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return false;
    }

    return true;
}

export function readJsonBody(req) {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
        return JSON.parse(req.body || '{}');
    }
    return req.body;
}

export function normalizeEmailTarget(value) {
    return String(value || '').trim().toLowerCase();
}

export function normalizeSmsTarget(value) {
    const raw = String(value || '').trim();
    const digits = raw.replace(/\D/g, '');

    if (!digits) return '';
    if (raw.startsWith('+')) return `+${digits}`;
    if (digits.startsWith('00')) return `+${digits.slice(2)}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+86${digits}`;
    if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    return raw;
}

export function validateEmailTarget(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmailTarget(value));
}

export function validateSmsTarget(value) {
    return /^\+\d{8,15}$/.test(normalizeSmsTarget(value));
}

export function assertAllowedPurpose(purpose) {
    if (!ALLOWED_PURPOSES.has(purpose)) {
        throw new Error('Unsupported verification purpose');
    }
}

export function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    return Buffer.from(`${normalized}${'='.repeat(padLength)}`, 'base64').toString('utf8');
}

function signPayload(serializedPayload, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(serializedPayload)
        .digest('base64url');
}

export function createVerificationChallengeToken({ channel, target, purpose, code, secret, ttlMs = 5 * 60 * 1000 }) {
    const nonce = crypto.randomBytes(12).toString('hex');
    const payload = {
        channel,
        target,
        purpose,
        expiresAt: Date.now() + ttlMs,
        nonce,
        codeHash: crypto.createHash('sha256').update(`${nonce}:${code}`).digest('hex')
    };
    const serializedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = signPayload(serializedPayload, secret);
    return `${serializedPayload}.${signature}`;
}

export function verifyVerificationChallengeToken({ channel, token, target, purpose, code, secret }) {
    if (!token) {
        return { valid: false, reason: '缺少验证码凭证' };
    }

    const [serializedPayload, signature] = String(token).split('.');
    if (!serializedPayload || !signature) {
        return { valid: false, reason: '验证码凭证格式错误' };
    }

    const expectedSignature = signPayload(serializedPayload, secret);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
        return { valid: false, reason: '验证码凭证签名无效' };
    }

    const payload = JSON.parse(base64UrlDecode(serializedPayload));
    if (payload.channel !== channel) {
        return { valid: false, reason: '验证码凭证类型错误' };
    }

    if (payload.target !== target || payload.purpose !== purpose) {
        return { valid: false, reason: '验证码凭证与当前请求不匹配' };
    }

    if (payload.expiresAt < Date.now()) {
        return { valid: false, reason: '验证码已过期，请重新发送' };
    }

    const inputHash = crypto.createHash('sha256').update(`${payload.nonce}:${String(code).trim()}`).digest('hex');
    const inputBuffer = Buffer.from(inputHash);
    const storedBuffer = Buffer.from(payload.codeHash);

    if (inputBuffer.length !== storedBuffer.length || !crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
        return { valid: false, reason: '邮箱验证码不正确' };
    }

    return { valid: true };
}

export function createEmailChallengeToken({ target, purpose, code, secret, ttlMs = 5 * 60 * 1000 }) {
    return createVerificationChallengeToken({
        channel: 'email',
        target,
        purpose,
        code,
        secret,
        ttlMs
    });
}

export function verifyEmailChallengeToken({ token, target, purpose, code, secret }) {
    return verifyVerificationChallengeToken({
        channel: 'email',
        token,
        target: normalizeEmailTarget(target),
        purpose,
        code,
        secret
    });
}

export function createSmsChallengeToken({ target, purpose, code, secret, ttlMs = 5 * 60 * 1000 }) {
    return createVerificationChallengeToken({
        channel: 'sms',
        target,
        purpose,
        code,
        secret,
        ttlMs
    });
}

export function verifySmsChallengeToken({ token, target, purpose, code, secret }) {
    return verifyVerificationChallengeToken({
        channel: 'sms',
        token,
        target: normalizeSmsTarget(target),
        purpose,
        code,
        secret
    });
}

export async function sendEmailCode({ to, code, purpose }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
        throw new Error('邮件服务未配置，请设置 RESEND_API_KEY 和 RESEND_FROM_EMAIL');
    }

    const subject = purpose === 'register' ? '注册验证码' : '登录验证码';
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #0f172a;">
            <h2 style="margin: 0 0 12px;">智引文思验证码</h2>
            <p style="margin: 0 0 16px; line-height: 1.7;">你正在${purpose === 'register' ? '注册' : '登录'}智引文思，验证码如下：</p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 18px 0; color: #4f46e5;">${code}</div>
            <p style="margin: 0; line-height: 1.7; color: #475569;">验证码 5 分钟内有效。如非本人操作，请忽略本邮件。</p>
        </div>
    `;
    const text = `你正在${purpose === 'register' ? '注册' : '登录'}智引文思，验证码为 ${code}，5 分钟内有效。`; 

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`邮件发送失败: ${errorText}`);
    }

    return response.json();
}

export async function sendSmsCode({ to, code, purpose }) {
    const apiKey = process.env.UNISMS_API_KEY;
    const apiSecret = process.env.UNISMS_API_SECRET;
    const apiUrl = process.env.UNISMS_API_URL || 'https://api.unisms.io/v1/sms/messages';
    const signature = process.env.UNISMS_SIGNATURE || '';

    if (!apiKey) {
        throw new Error('短信服务未配置，请设置 UNISMS_API_KEY');
    }

    const authHeader = apiSecret
        ? `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
        : `Bearer ${apiKey}`;

    const text = purpose === 'register'
        ? `【${signature || '智引文思'}】注册验证码：${code}，5分钟内有效。`
        : `【${signature || '智引文思'}】登录验证码：${code}，5分钟内有效。`;

    const payload = {
        recipients: [to],
        text
    };

    if (signature) {
        payload.signature = signature;
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            Authorization: authHeader,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`UniSMS 发送失败: ${errorText}`);
    }

    return response.json();
}