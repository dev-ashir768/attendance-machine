import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const authenticateDevice = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized device' });
  }
  
  // Future: Could extract machine IP and validate against DB whitelist
  next();
};
