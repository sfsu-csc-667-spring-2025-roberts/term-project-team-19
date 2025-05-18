import { Response } from "express";
import { Game, User } from "../../../db/schema";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import { io } from "../../../index";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  GameInstance,
  SessionUser,
} from "../../../types";

export const leaveGameHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.params.game_id) {
    res.status(400).json({ error: "Game ID is required" });
    return;
  }
  const game_id = parseInt(req.params.game_id);

  const user = req.session.user as SessionUser;
  let db_user = await User.findByPk(user.id);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!db_user) {
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

  switch (user.id) {
    case game.host_id:
      await game.destroy();
      break;
    case game.member_2_id:
      await game.update({ member_2_id: null });
      break;
    case game.member_3_id:
      await game.update({ member_3_id: null });
      break;
    case game.member_4_id:
      await game.update({ member_4_id: null });
      break;
  }

  io.to(`game_${game.id}`).emit("playerLeft", {
    userId: user.id,
    username: user.username,
  });

  await db_user.update({ game_id: null });
  user.game_id = 0;
  req.session.user = user;
  req.session.save();

  res.status(200).json({ message: "Game left successfully" });
};
