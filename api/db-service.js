// 数据库服务 - MongoDB 连接和操作
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable not set');
    }

    try {
        const client = new MongoClient(mongoUri, {
            maxPoolSize: 10,
        });

        await client.connect();
        const db = client.db('reading_writing');

        cachedClient = client;
        cachedDb = db;

        console.log('✅ Connected to MongoDB');
        return { client, db };
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}

// 保存反馈数据
export async function saveFeedback(feedbackRecord) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const result = await collection.insertOne({
            ...feedbackRecord,
            createdAt: new Date(),
            updated: false
        });

        return {
            success: true,
            feedbackId: result.insertedId.toString()
        };
    } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
    }
}

// 获取用户所有反馈
export async function getUserFeedbacks(userId) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const feedbacks = await collection
            .find({ userId: userId })
            .sort({ timestamp: -1 })
            .toArray();

        return feedbacks;
    } catch (error) {
        console.error('Error fetching user feedbacks:', error);
        throw error;
    }
}

// 获取所有反馈（分页）
export async function getAllFeedbacks(page = 1, limit = 20) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const skip = (page - 1) * limit;
        const feedbacks = await collection
            .find({})
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await collection.countDocuments();

        return {
            feedbacks,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
}

// 获取反馈统计
export async function getFeedbackStats(userId = null) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const query = userId ? { userId } : {};

        const stats = await collection.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    likes: {
                        $sum: { $cond: [{ $eq: ['$feedback.sentiment', 'like'] }, 1, 0] }
                    },
                    dislikes: {
                        $sum: { $cond: [{ $eq: ['$feedback.sentiment', 'dislike'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    likes: 1,
                    dislikes: 1,
                    likeRatio: {
                        $cond: [
                            { $eq: ['$total', 0] },
                            0,
                            { $round: [{ $divide: ['$likes', '$total'] }, 2] }
                        ]
                    }
                }
            }
        ]).toArray();

        return stats[0] || { total: 0, likes: 0, dislikes: 0, likeRatio: 0 };
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}

// 获取内容类型分布
export async function getContentTypeDistribution(userId = null) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const query = userId ? { userId } : {};

        const distribution = await collection.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$feedback.contentType',
                    count: { $sum: 1 },
                    likes: {
                        $sum: { $cond: [{ $eq: ['$feedback.sentiment', 'like'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        return distribution;
    } catch (error) {
        console.error('Error fetching content distribution:', error);
        throw error;
    }
}

// 获取用户分布
export async function getUserDistribution() {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('feedbacks');

        const distribution = await collection.aggregate([
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        username: '$username'
                    },
                    feedbackCount: { $sum: 1 },
                    likes: {
                        $sum: { $cond: [{ $eq: ['$feedback.sentiment', 'like'] }, 1, 0] }
                    }
                }
            },
            { $sort: { feedbackCount: -1 } }
        ]).toArray();

        return distribution;
    } catch (error) {
        console.error('Error fetching user distribution:', error);
        throw error;
    }
}
