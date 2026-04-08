import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: any; // Define properly later
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
