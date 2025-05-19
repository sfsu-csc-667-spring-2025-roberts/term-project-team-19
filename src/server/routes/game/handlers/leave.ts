import { Response } from "express";
import { Game, User, GamePlayer } from "../../../db/schema";
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
  console.log("leaveGameHandler");
  console.log("req.params.game_id", req.params.game_id);
  console.log("req.session.user", req.session.user);
  console.log("req.session.user.id", req.session.user?.id);
  console.log("req.session.user.username", req.session.user?.username);
  console.log("================================================");
  if (!req.params.game_id) {
    res.status(400).json({ error: "Game ID is required" });
    return;
  }
  const game_id = parseInt(req.params.game_id);

  const user = req.session.user as SessionUser;
  let db_user = await User.findByPk(user.id);

  if (!user) {
    console.log("user not found");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!db_user) {
    console.log("db_user not found");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const game = (await Game.findOne({
    where: {
      status: {
        [Op.or]: [GameStatus.WAITING, GameStatus.PLAYING],
      },
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

  // Remove the GamePlayer record
  await GamePlayer.destroy({
    where: {
      game_id: game_id,
      user_id: user.id,
    },
  });

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
    default:
      res.status(401).json({ error: "Unauthorized" });
      return;
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
