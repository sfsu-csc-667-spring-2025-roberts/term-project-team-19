import { Response } from "express";
import { Game, User } from "../../../db/schema";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  GameInstance,
  SessionUser,
} from "../../../types";

export const joinGameHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  console.log("joinGameHandler");
  if (!req.params.game_id) {
    res.status(400).json({ error: "Game ID is required" });
    return;
  }
  const game_id = parseInt(req.params.game_id);

  const user = req.session.user as SessionUser;
  let db_user = await User.findByPk(user.id);

  if (!user) {
    res.status(401).json({ error: "Unauthorized No user provided" });
    return;
  }
  if (!db_user) {
    res.status(401).json({ error: "Unauthorized No user provided" });
    return;
  }

  const game = (await Game.findOne({
    where: {
      id: game_id,
      status: GameStatus.WAITING,
    },
  })) as GameInstance;

  if (!game) {
    res.status(404).json({ error: "Game not found or not accepting players" });
    return;
  }

  // Check if user is already in a game
  const existingGame = (await Game.findOne({
    where: {
      [Op.or]: [
        { host_id: user.id },
        { member_2_id: user.id },
        { member_3_id: user.id },
        { member_4_id: user.id },
      ],
      status: {
        [Op.or]: [GameStatus.WAITING, GameStatus.PLAYING],
      },
    },
  })) as GameInstance;

  if (existingGame) {
    res.status(400).json({ error: "User is already in an active game" });
    return;
  }

  // Find first available member slot
  if (!game.member_2_id) {
    await game.update({ member_2_id: user.id });
  } else if (!game.member_3_id) {
    await game.update({ member_3_id: user.id });
  } else if (!game.member_4_id) {
    await game.update({ member_4_id: user.id });
  } else {
    res.status(400).json({ error: "Game is full" });
    return;
  }

  await db_user.update({ game_id: game.id });

  user.game_id = game.id;
  req.session.user = user;
  req.session.save();

  res.status(200).json({ game });
};

export default joinGameHandler;
