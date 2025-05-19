import {
  AuthenticatedRequestHandler,
  GameInstance,
  SessionUser,
} from "server/types";
import { request, Request, Response } from "express";
import { ChatMessage } from "server/types";
import { AuthenticatedRequest } from "server/types";
import { GameStatus } from "../../../enum/enums";
import { Op } from "sequelize";
import { Chatlog, Game, User } from "../../../db/schema";
import { io } from "server";

export const getMessagesHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  console.log("getMessagesHandler");
  console.log(req.body);

  const gameId = req.params.game_id;

  const user = req.session.user as SessionUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const game = (await Game.findByPk(gameId)) as GameInstance;

  if (!game) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // check if user is in game
  if (
    game.host_id !== user.id &&
    game.member_2_id !== user.id &&
    game.member_3_id !== user.id &&
    game.member_4_id !== user.id
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // check if game is playing or waiting
  if (
    game.status !== GameStatus.PLAYING &&
    game.status !== GameStatus.WAITING
  ) {
    res.status(401).json({ error: "Game has ended" });
    return;
  }

  const messages = await Chatlog.findAll({
    where: {
      game_id: gameId,
    },
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  });

  res.status(200).json({ messages });
};
