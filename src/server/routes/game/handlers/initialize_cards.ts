import { Response } from 'express';
import { Game, CardDefinition, GameCard } from '../../../db/schema';
import { GameStatus, GameCardLocation } from '../../../enum/enums';
import { AuthenticatedRequestHandler, AuthenticatedRequest, GameInstance, SessionUser } from '../../../types';
import { Model } from 'sequelize';

interface CardDefinitionInstance extends Model {
    id: number;
    type: string;
    action: string | null;
    color: string;
    value: number | null;
}

export const initializeGameCardsHandler: AuthenticatedRequestHandler = async (req: AuthenticatedRequest, res: Response) => {
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

    try {
        // Get all card definitions
        const cardDefinitions = await CardDefinition.findAll() as CardDefinitionInstance[];
        
        // Create game cards for each definition
        const gameCards = cardDefinitions.map(cardDef => ({
            game_id: game_id,
            card_definition_id: cardDef.id,
            location: GameCardLocation.DISCARD_PILE, // Initially all cards are in the discard pile
            owner_id: null
        }));

        // Bulk create game cards
        await GameCard.bulkCreate(gameCards);

        res.status(200).json({ message: 'Game cards initialized successfully' });
    } catch (error) {
        console.error('Error initializing game cards:', error);
        res.status(500).json({ error: 'Failed to initialize game cards' });
    }
};

export default initializeGameCardsHandler; 