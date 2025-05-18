import { Request, Response } from "express";
import { Game, User } from "../../../db/schema";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import {
  GameInstance,
  UserInstance,
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  SessionUser,
} from "../../../types";

export const endGameHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.params.game_id) {
    res.status(400).json({ error: "Game ID is required" });
    return;
  }
  const game_id = parseInt(req.params.game_id);

  const user = req.session.user as SessionUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (user.game_id !== game_id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const game = (await Game.findOne({
    where: {
      id: game_id,
      [Op.or]: [
        { host_id: user.id },
        { member_2_id: user.id },
        { member_3_id: user.id },
        { member_4_id: user.id },
      ],
    },
  })) as GameInstance;

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  await game.update({
    status: GameStatus.FINISHED,
  });

  for (const player of [
    game.host_id,
    game.member_2_id,
    game.member_3_id,
    game.member_4_id,
  ]) {
    if (player) {
      const db_user = await User.findByPk(player);
      if (db_user) {
        await db_user.update({ game_id: null });
      }
    }
  }

  user.game_id = 0;
  req.session.user = user;
  req.session.save();

  res.status(200).json({ message: "Game ended successfully" });
};
