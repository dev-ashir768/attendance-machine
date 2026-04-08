"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rateLimitMap = new Map();
const rateLimiter = (options) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const currentTime = Date.now();
        let record = rateLimitMap.get(ip);
        if (!record || currentTime > record.resetTime) {
            record = { count: 1, resetTime: currentTime + options.windowMs };
        }
        else {
            record.count++;
        }
        rateLimitMap.set(ip, record);
        if (record.count > options.max) {
            return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
        next();
    };
};
exports.rateLimiter = rateLimiter;
