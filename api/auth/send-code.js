import {
    assertAllowedPurpose,
    assertPostMethod,
    createEmailChallengeToken,
    createSmsChallengeToken,
    generateVerificationCode,
    normalizeEmailTarget,
    normalizeSmsTarget,
    readJsonBody,
    sendEmailCode,
    sendSmsCode,
    setCorsHeaders,
    validateEmailTarget,
    validateSmsTarget
} from './_verification-utils.js';

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (!assertPostMethod(req, res)) return;

    try {
        const payload = readJsonBody(req);
        const { channel, target, purpose } = payload;

        assertAllowedPurpose(purpose);

        const signingSecret = process.env.VERIFICATION_CODE_SIGNING_SECRET;
        if (!signingSecret) {
            return res.status(500).json({ error: '验证码服务未配置签名密钥' });
        }

        if (channel === 'email') {
            const normalizedTarget = normalizeEmailTarget(target);
            if (!validateEmailTarget(normalizedTarget)) {
                return res.status(400).json({ error: '请输入正确的邮箱地址' });
            }

            const code = generateVerificationCode();
            const challengeToken = createEmailChallengeToken({
                target: normalizedTarget,
                purpose,
                code,
                secret: signingSecret
            });

            await sendEmailCode({
                to: normalizedTarget,
                code,
                purpose
            });

            return res.status(200).json({
                success: true,
                channel,
                target: normalizedTarget,
                expiresIn: 300,
                challengeToken
            });
        }

        if (channel === 'sms') {
            const normalizedTarget = normalizeSmsTarget(target);
            if (!validateSmsTarget(normalizedTarget)) {
                return res.status(400).json({ error: '请输入正确的手机号' });
            }

            const code = generateVerificationCode();
            const challengeToken = createSmsChallengeToken({
                target: normalizedTarget,
                purpose,
                code,
                secret: signingSecret
            });

            await sendSmsCode({
                to: normalizedTarget,
                code,
                purpose
            });

            return res.status(200).json({
                success: true,
                channel,
                target: normalizedTarget,
                expiresIn: 300,
                challengeToken
            });
        }

        return res.status(400).json({ error: 'Unsupported verification channel' });
    } catch (error) {
        console.error('发送验证码失败:', error);
        return res.status(500).json({
            error: error.message || '发送验证码失败'
        });
    }
}
