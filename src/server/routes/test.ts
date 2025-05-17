import { Router } from 'express';
import { Request, Response } from "express";
import type { Server} from "socket.io";

import { AuthenticatedRequest, AuthenticatedRequestHandler } from '../types';
import { requireAuth } from '../middleware/auth';
import { socket } from '../../client/socket';

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

router.get("/socket", (request: Request, response: Response) =>{
    const io: Server = request.app.get("io");

    //@ts-ignore
    io.emit("test", { user: request.session.user});
    // @ts-ignore
    io.to(request.session.user.id).emit("test", { secret: "hi" });

    response.json({ message: "socket event emitted" });
});

export default router; 