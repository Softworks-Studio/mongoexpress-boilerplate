import dotenv from 'dotenv';
dotenv.config();

export const CONSTANTS = {
    PORT: process.env.PORT || 3000,
    PROJECT_NAME: 'mongoexpress-boilerplate',
    API_VERSION: 'v1',
    API_PREFIX: '/api',
    CORS: {

        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
}
