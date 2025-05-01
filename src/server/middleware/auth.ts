import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
}; 