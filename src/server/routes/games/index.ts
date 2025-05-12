import { Router, Response } from "express";
import { Game, GamePlayer, User } from "../../db/schema";
import { requireAuth } from "../../middleware/auth";
import { AuthenticatedRequest, AuthenticatedRequestHandler } from "../../types";
import { Model, InferAttributes, InferCreationAttributes } from "sequelize";
import { GameStatus } from "../../enum/enums";

interface GameAttributes {
  id: number;
  host_id: number;
  status: GameStatus;
  current_turn: number | null;
  created_at: Date;
  updated_at: Date;
  player_count: number;
  turn_direction: number;
}

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

interface GamePlayerAttributes {
  id: number;
  game_id: number;
  user_id: number;
  seat_number: number;
  created_at: Date;
  updated_at: Date;
}

interface GameInstance extends Model<GameAttributes>, GameAttributes {
  host?: Model<UserAttributes>;
  gamePlayers?: Model<GamePlayerAttributes>[];
}

const router = Router();

// Get all games
router.get("/", requireAuth, (async (req, res: Response) => {
  console.log("Session:", JSON.stringify(req.session.user, null, 2));
  try {
    const games = (await Game.findAll({
      include: [
        {
          model: User,
          as: "host",
          attributes: ["username"],
        },
        {
          model: GamePlayer,
          as: "gamePlayers",
          attributes: ["id", "user_id"],
          include: [
            {
              model: User,
              as: "User",
              attributes: ["username"],
            },
          ],
        },
      ],
    })) as GameInstance[];

    console.log(games);
    const formattedGames = games.map((game) => ({
      id: game.id,
      hostUsername: game.host?.get("username"),
      playerCount: game.gamePlayers?.length || 0,
      maxPlayers: 4, // Default max players
      status: game.status,
      players: game.gamePlayers?.map((player) => ({
        id: player.get("user_id"),
        username: (player as any).User?.get("username"),
      })),
    }));

    res.json(formattedGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}) as AuthenticatedRequestHandler);

// Create a new game
router.post("/", requireAuth, (async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { maxPlayers = 4 } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const game = (await Game.create({
      host_id: userId,
      status: GameStatus.WAITING,
      current_turn: userId,
    })) as GameInstance;

    // Add host as first player
    await GamePlayer.create({
      game_id: game.id,
      user_id: userId,
      seat_number: 1,
    });

    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
}) as AuthenticatedRequestHandler);

// Join a game
router.post("/:gameId/join", requireAuth, (async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { gameId } = req.params;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const game = (await Game.findByPk(gameId, {
      include: [
        {
          model: GamePlayer,
          as: "gamePlayers",
        },
      ],
    })) as GameInstance | null;

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.status !== GameStatus.WAITING) {
      return res.status(400).json({ error: "Game is not accepting players" });
    }

    if ((game.gamePlayers?.length || 0) >= 4) {
      return res.status(400).json({ error: "Game is full" });
    }

    // Check if player is already in the game
    const existingPlayer = game.gamePlayers?.find(
      (p) => p.get("user_id") === userId,
    );
    if (existingPlayer) {
      return res.status(400).json({ error: "Already in this game" });
    }

    // Add player to game
    await GamePlayer.create({
      game_id: game.id,
      user_id: userId,
      seat_number: (game.gamePlayers?.length || 0) + 1,
    });

    res.status(200).json({ message: "Joined game successfully" });
  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ error: "Failed to join game" });
  }
}) as AuthenticatedRequestHandler);

export default router;
