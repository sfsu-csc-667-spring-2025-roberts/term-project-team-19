import { CardDefinition } from './schema';
import { CardType, CardColor, CardAction } from '../enum/enums';

export const initializeCards = async () => {
    try {
        // Create number cards (0-9) for each color
        const colors = [CardColor.RED, CardColor.GREEN, CardColor.BLUE, CardColor.YELLOW];
        const cards = [];

        // Add number cards (0-9) for each color
        for (const color of colors) {
            // Add one zero card
            cards.push({
                type: CardType.NORMAL,
                color: color,
                value: 0,
                action: null
            });

            // Add two of each number 1-9
            for (let value = 1; value <= 9; value++) {
                cards.push(
                    {
                        type: CardType.NORMAL,
                        color: color,
                        value: value,
                        action: null
                    },
                    {
                        type: CardType.NORMAL,
                        color: color,
                        value: value,
                        action: null
                    }
                );
            }

            // Add two of each action card (Draw Two, Skip, Reverse)
            const actionCards = [
                { action: CardAction.DRAW_TWO },
                { action: CardAction.SKIP },
                { action: CardAction.REVERSE }
            ];

            for (const { action } of actionCards) {
                cards.push(
                    {
                        type: CardType.ACTION,
                        color: color,
                        value: null,
                        action: action
                    },
                    {
                        type: CardType.ACTION,
                        color: color,
                        value: null,
                        action: action
                    }
                );
            }
        }

        // Add Wild cards (4 of each)
        const wildCards = [
            { action: CardAction.DRAW_FOUR },
            { action: null }
        ];

        for (const { action } of wildCards) {
            for (let i = 0; i < 4; i++) {
                cards.push({
                    type: CardType.WILD,
                    color: CardColor.NONE,
                    value: null,
                    action: action
                });
            }
        }

        // Bulk create all cards
        await CardDefinition.bulkCreate(cards);
        console.log('Successfully created UNO deck');
    } catch (error) {
        console.error('Error creating UNO deck:', error);
        throw error;
    }
};

// Only run this file directly
if (require.main === module) {
    initializeCards()
        .then(() => {
            console.log('Card initialization completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to initialize cards:', error);
            process.exit(1);
        });
} 