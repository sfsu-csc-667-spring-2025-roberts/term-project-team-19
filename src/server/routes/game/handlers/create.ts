import { Request, Response } from 'express';
import { Game, User } from '../../../db/schema';
import { GameStatus } from '../../../enum/enums';
import { Op } from 'sequelize';
import { GameInstance, UserInstance, AuthenticatedRequestHandler, AuthenticatedRequest, SessionUser } from '../../../types';

export const createGameHandler: AuthenticatedRequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.session.user as SessionUser;

    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { host_id } = req.body;

    // check if game exists where user is either host or member
    const game = await Game.findOne({
        where: {
            [Op.or]: [
                { host_id },
                { member_2_id: host_id },
                { member_3_id: host_id },
                { member_4_id: host_id }
            ],
            status: {
                [Op.or]: [GameStatus.WAITING, GameStatus.PLAYING],
            },
        },
    });

    if (game) {
        res.status(400).json({ error: 'User is already in an active game' });
        return;
    }
    
    const newGame = await Game.create({
        host_id,
    });

    res.status(201).json({ game: newGame });
};

export default createGameHandler;