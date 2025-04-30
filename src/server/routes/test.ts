import { Router } from 'express';
import { AuthenticatedRequest, AuthenticatedRequestHandler } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();

const testHandler: AuthenticatedRequestHandler = (req, res) => {
    const user = req.session.user;
    res.json({
        message: 'This is a protected route',
        user: {
            id: user?.id,
            username: user?.username,
            email: user?.email
        }
    });
};

router.get('/test', requireAuth, testHandler);

export default router; 