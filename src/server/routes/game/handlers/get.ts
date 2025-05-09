import { Request, Response } from "express";
import { Game, User, GamePlayer } from "../../../db/schema";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import { Model } from "sequelize";

interface GameInstance extends Model {
  id: number;
  host: UserInstance;
  gamePlayers: GamePlayerInstance[];
  status: GameStatus;
  created_at: Date;
}

interface UserInstance extends Model {
  id: number;
  username: string;
}

interface GamePlayerInstance extends Model {
  id: number;
  user: UserInstance;
}

export async function getGamesHandler(req: Request, res: Response) {
  try {
    // Get all active games (WAITING or PLAYING)
    const games = (await Game.findAll({
      where: {
        status: {
          [Op.in]: [GameStatus.WAITING, GameStatus.PLAYING],
        },
      },
      include: [
        {
          model: User,
          as: "host",
          attributes: ["id", "username"],
        },
        {
          model: GamePlayer,
          as: "gamePlayers",
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    })) as GameInstance[];

    // Transform the data to match the client's expected format
    const formattedGames = games.map((game) => ({
      id: game.id,
      hostUsername: game.host.username,
      playerCount: game.gamePlayers.length,
      maxPlayers: 4, // Fixed at 4 players for UNO
      status: game.status,
      createdAt: game.created_at,
    }));

    res.json(formattedGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}
