import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
    try {
      token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Not authorized, token missing from header' });
        return;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = (decoded as any).id;
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};
