import { Response } from 'express';
import { Game } from '../../../db/schema';
import { GameStatus } from '../../../enum/enums';
import { AuthenticatedRequestHandler, AuthenticatedRequest, GameInstance, SessionUser } from '../../../types';

export const startGameHandler: AuthenticatedRequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { game_id } = req.body;
    const user = req.session.user as SessionUser;

    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const game = await Game.findOne({
        where: {
            id: game_id,
            host_id: user.id,
            status: GameStatus.WAITING,
        },
    }) as GameInstance;

    if (!game) {
        res.status(404).json({ error: 'Game not found or you are not the host' });
        return;
    }

    // Check if there are at least 2 players
    const playerCount = [game.member_2_id, game.member_3_id, game.member_4_id].filter(id => id !== null).length + 1; // +1 for host
    if (playerCount < 2) {
        res.status(400).json({ error: 'Need at least 2 players to start the game' });
        return;
    }

    await game.update({ 
        status: GameStatus.PLAYING,
        current_turn: game.host_id,
        turn_direction: 1
    });

 

    res.status(200).json({ game });
};

export default startGameHandler; 