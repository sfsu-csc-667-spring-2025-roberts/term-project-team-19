import sequelize from './config';
import { User, Game, GamePlayer, Chatlog, Friendship, CardDefinition, GameCard, GameMove } from './schema';
import { initializeCards } from './init_cards';

async function initializeDatabase() {
    try {
        console.log('Attempting to connect to database...');
        // Test the connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Log current database name
        const [results] = await sequelize.query('SELECT current_database();');

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

        // Sync with detailed logging
        await sequelize.sync({ 
            force: true,
            logging: (msg) => console.log('Sequelize:', msg)
        });
        console.log('Database schema synced successfully.');

        // Initialize card definitions
        console.log('Initializing card definitions...');
        await initializeCards();
        console.log('Card definitions initialized successfully.');

        // Verify tables were created
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Created tables:', tables.map((t: any) => t.table_name));

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
    } finally {
        // Close the connection
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Run the initialization
initializeDatabase()
    .then(() => {
        console.log('Initialization completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });