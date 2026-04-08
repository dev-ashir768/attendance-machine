import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: { windowMs: number; max: number }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const currentTime = Date.now();

    let record = rateLimitMap.get(ip);
    if (!record || currentTime > record.resetTime) {
      record = { count: 1, resetTime: currentTime + options.windowMs };
    } else {
      record.count++;
    }

    rateLimitMap.set(ip, record);

    if (record.count > options.max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    next();
  };
};
