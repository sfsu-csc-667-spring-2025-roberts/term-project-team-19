import { Router } from 'express';
import signupRouter from './signup';
import { signinHandler, signoutHandler } from './signin';
import { requireAuth } from '../../middleware/auth';

const authRouter = Router();
const router = Router();

// Auth check endpoint
router.get('/check', requireAuth, (req, res) => {
  res.json(req.session.user);
});

authRouter.post('/signup', signupRouter);
authRouter.post('/signin', signinHandler);
authRouter.post('/signout', signoutHandler);

// Mount all auth routes
router.use('/', authRouter);

export default router; 