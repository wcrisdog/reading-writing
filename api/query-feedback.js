// API: 获取反馈数据和统计
import {
    getUserFeedbacks,
    getAllFeedbacks,
    getFeedbackStats,
    getContentTypeDistribution,
    getUserDistribution
} from './db-service.js';

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { action, userId, page = '1', limit = '20' } = req.query;

        switch (action) {
            case 'user-feedbacks':
                // 获取某个用户的所有反馈
                if (!userId) {
                    return res.status(400).json({ error: 'userId is required' });
                }
                const userFeedbacks = await getUserFeedbacks(userId);
                return res.status(200).json({
                    success: true,
                    data: userFeedbacks,
                    count: userFeedbacks.length
                });

            case 'all-feedbacks':
                // 获取所有反馈（分页）
                const allFeedbacks = await getAllFeedbacks(parseInt(page), parseInt(limit));
                return res.status(200).json({
                    success: true,
                    data: allFeedbacks
                });

            case 'user-stats':
                // 获取用户统计（全局或单个用户）
                const stats = await getFeedbackStats(userId || null);
                return res.status(200).json({
                    success: true,
                    data: stats
                });

            case 'content-distribution':
                // 内容类型分布
                const distribution = await getContentTypeDistribution(userId || null);
                return res.status(200).json({
                    success: true,
                    data: distribution
                });

            case 'user-distribution':
                // 用户反馈分布
                const userDist = await getUserDistribution();
                return res.status(200).json({
                    success: true,
                    data: userDist
                });

            default:
                return res.status(400).json({
                    error: 'Invalid action',
                    availableActions: [
                        'user-feedbacks',
                        'all-feedbacks',
                        'user-stats',
                        'content-distribution',
                        'user-distribution'
                    ]
                });
        }
    } catch (error) {
        console.error('❌ Query error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
