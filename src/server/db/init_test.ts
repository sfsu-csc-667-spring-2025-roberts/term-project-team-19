import sequelize from "./config";
import {
  User,
  Game,
  GamePlayer,
  Chatlog,
  Friendship,
  CardDefinition,
  GameCard,
  GameMove,
} from "./schema";
import { initializeCards } from "./init_cards";
import { hashPassword } from "../../helpers/password";

export const initializeTestUsers = async () => {
  const hashedPassword = await hashPassword("password123");
  try {
    // Create test users
    const testUsers = [
      {
        username: "testuser1",
        email: "testuser1@example.com",
        password: hashedPassword,
      },
      {
        username: "testuser2",
        email: "testuser2@example.com",
        password: hashedPassword,
      },
    ];

    // Create users in the database
    for (const user of testUsers) {
      await User.create({
        username: user.username,
        email: user.email,
        password_hash: hashedPassword,
      });
    }
  } catch (error) {
    console.error("Error initializing test users:", error);
    throw error;
  }
};

export async function initializeDatabase() {
  try {
    console.log("Attempting to connect to database...");
    // Test the connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Log current database name
    const [results] = await sequelize.query("SELECT current_database();");
    console.log("Connected to database:", results[0]);

    // Sync all models
    console.log("Starting schema sync...");
    console.log("Models to sync:", {
      User: User.tableName,
      Game: Game.tableName,
      GamePlayer: GamePlayer.tableName,
      Chatlog: Chatlog.tableName,
      Friendship: Friendship.tableName,
      CardDefinition: CardDefinition.tableName,
      GameCard: GameCard.tableName,
      GameMove: GameMove.tableName,
    });

    // Drop all tables
    await sequelize.query('DROP TABLE IF EXISTS "GamePlayers" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Games" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Chatlogs" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Friendships" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "CardDefinitions" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "GameCards" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "GameMoves" CASCADE;');

    // Sync without force to preserve data
    await sequelize.sync({
      force: false,
      logging: (msg) => console.log("Sequelize:", msg),
    });
    console.log("Database schema synced successfully.");

    // Initialize card definitions
    console.log("Initializing card definitions...");
    await initializeCards();
    console.log("Card definitions initialized successfully.");

    // Initialize test users
    console.log("Initializing test users...");
    await initializeTestUsers();
    console.log("Test users initialized successfully.");

    // Verify tables were created
    const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
    console.log(
      "Available tables:",
      tables.map((t: any) => t.table_name),
    );

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// Only run initialization if this file is run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Initialization completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    });
}
