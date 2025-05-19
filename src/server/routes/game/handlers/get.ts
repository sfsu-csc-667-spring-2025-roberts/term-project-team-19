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
  user_id: number;
  username: string;
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
              as: "user",
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
      players: game.gamePlayers.map((player) => ({
        id: player.user.id,
        username: player.user.username,
      })),
    }));

    console.log("formattedGames: ", formattedGames);

    res.json(formattedGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}

export async function getGameHandler(req: Request, res: Response) {
  try {
    console.log("GET GAME HANDLER");
    console.log("ID", req.params.game_id);
    console.log("--------------------------------");
    const gameId = parseInt(req.params.game_id);

    if (!gameId) {
      res.status(400).json({ error: "Game ID is required" });
      return;
    }

    // Get the specific game
    const game = (await Game.findOne({
      where: {
        id: gameId,
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
              as: "user",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    })) as GameInstance;

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    // Transform the data to match the client's expected format
    const formattedGame = {
      id: game.id,
      hostUsername: game.host.username,
      hostId: game.host.id,
      players: game.gamePlayers.map((player) => ({
        id: player.user.id,
        username: player.user.username,
      })),
      playerCount: game.gamePlayers.length,
      maxPlayers: 4, // Fixed at 4 players for UNO
      status: game.status,
      createdAt: game.created_at,
    };

    res.json(formattedGame);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
}
