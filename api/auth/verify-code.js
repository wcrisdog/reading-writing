import {
    assertAllowedPurpose,
    assertPostMethod,
    normalizeEmailTarget,
    normalizeSmsTarget,
    readJsonBody,
    setCorsHeaders,
    validateEmailTarget,
    validateSmsTarget,
    verifyEmailChallengeToken,
    verifySmsChallengeToken
} from './_verification-utils.js';

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (!assertPostMethod(req, res)) return;

    try {
        const payload = readJsonBody(req);
        const { channel, target, purpose, code, challengeToken } = payload;

        assertAllowedPurpose(purpose);

        if (!String(code || '').trim()) {
            return res.status(400).json({ error: '请输入验证码' });
        }

        if (channel === 'email') {
            const normalizedTarget = normalizeEmailTarget(target);
            if (!validateEmailTarget(normalizedTarget)) {
                return res.status(400).json({ error: '请输入正确的邮箱地址' });
            }

            const signingSecret = process.env.VERIFICATION_CODE_SIGNING_SECRET;
            if (!signingSecret) {
                return res.status(500).json({ error: '邮件验证码服务未配置签名密钥' });
            }

            const result = verifyEmailChallengeToken({
                token: challengeToken,
                target: normalizedTarget,
                purpose,
                code,
                secret: signingSecret
            });

            if (!result.valid) {
                return res.status(400).json({ error: result.reason || '邮箱验证码校验失败' });
            }

            return res.status(200).json({ success: true });
        }

        if (channel === 'sms') {
            const normalizedTarget = normalizeSmsTarget(target);
            if (!validateSmsTarget(normalizedTarget)) {
                return res.status(400).json({ error: '请输入正确的手机号' });
            }

            const signingSecret = process.env.VERIFICATION_CODE_SIGNING_SECRET;
            if (!signingSecret) {
                return res.status(500).json({ error: '验证码服务未配置签名密钥' });
            }

            const result = verifySmsChallengeToken({
                token: challengeToken,
                target: normalizedTarget,
                purpose,
                code,
                secret: signingSecret
            });

            if (!result.valid) {
                return res.status(400).json({ error: result.reason || '短信验证码不正确或已失效' });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Unsupported verification channel' });
    } catch (error) {
        console.error('校验验证码失败:', error);
        return res.status(500).json({
            error: error.message || '校验验证码失败'
        });
    }
}
