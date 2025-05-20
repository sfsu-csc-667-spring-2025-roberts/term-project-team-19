import { Request, Response } from "express";
import { Game, GamePlayer, User } from "../../../db/schema";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import { io } from "../../../index"; // Add this import
import {
  GameInstance,
  UserInstance,
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  SessionUser,
} from "../../../types";

export const createGameHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = req.session.user as SessionUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let db_user = await User.findByPk(user.id);
  if (!db_user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const host_id = user.id;

  // check if game exists where user is host
  const game = await Game.findOne({
    where: {
      host_id: host_id,
      status: {
        [Op.or]: [GameStatus.WAITING, GameStatus.PLAYING],
      },
    },
  });

  if (game) {
    console.log("user cannot host multiple games");
    res.status(400).json({ error: "User cannot host multiple games" });
    return;
  }

  const newGame = (await Game.create({
    host_id: host_id,
    status: GameStatus.WAITING,
    max_players: 4,
    player_count: 1,
  })) as GameInstance;

  // add user to game
  await GamePlayer.create({
    game_id: newGame.id,
    user_id: host_id,
    player_id: host_id,
  });

  // await db_user.update({ game_id: newGame.id });
  //user.game_id = newGame.id;
  req.session.user = user;
  req.session.save();

  res.status(201).json({ game: newGame });
};

export default createGameHandler;
