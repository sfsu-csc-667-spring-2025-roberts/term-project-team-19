import sequelize from './config';
import { User, Game, GamePlayer, Chatlog, Friendship, CardDefinition, GameCard, GameMove } from './schema';

export async function initializeDatabase() {
    try {
        console.log('Attempting to connect to database...');
        // Test the connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Log current database name
        const [results] = await sequelize.query('SELECT current_database();');
        console.log('Connected to database:', results[0]);

        // Sync all models
        console.log('Starting schema sync...');
        console.log('Models to sync:', {
            User: User.tableName,
            Game: Game.tableName,
            GamePlayer: GamePlayer.tableName,
            Chatlog: Chatlog.tableName,
            Friendship: Friendship.tableName,
            CardDefinition: CardDefinition.tableName,
            GameCard: GameCard.tableName,
            GameMove: GameMove.tableName
        });

        // Sync without force to preserve data
        await sequelize.sync({ 
            force: false,
            logging: (msg) => console.log('Sequelize:', msg)
        });
        console.log('Database schema synced successfully.');

        // Verify tables exist
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Available tables:', tables.map((t: any) => t.table_name));

        console.log('Database initialization completed successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
        throw error;
    }
}

// Only run initialization if this file is run directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Initialization completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to initialize database:', error);
            process.exit(1);
        });
}