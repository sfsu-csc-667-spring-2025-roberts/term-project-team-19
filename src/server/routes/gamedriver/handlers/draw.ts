import {
  AuthenticatedRequestHandler,
  GameInstance,
  GamePlayerInstance,
} from "../../../types";
import { Game, GameMove, GamePlayer } from "../../../db/schema";
import { AuthenticatedRequest } from "../../../types";
import { Response } from "express";
import { handleDraw, updateTurn } from "./utils";
import { GameMoveType } from "../../../enum/enums";

export const drawCardHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const game_id = req.params.game_id;
  const user_id = req.session.user?.id;

  const game = (await Game.findByPk(game_id, {
    include: [
      {
        model: GamePlayer,
        as: "gamePlayers",
      },
    ],
  })) as GameInstance;

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  if (!game.gamePlayers.some((player) => player.user_id === user_id)) {
    res.status(401).json({ error: "You are not in this game" });
    return;
  }

  const user = (await GamePlayer.findOne({
    where: {
      user_id: user_id,
      game_id: game_id,
    },
  })) as unknown as GamePlayerInstance;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  console.log("user: ", user);

  handleDraw(game, user, 1);

  // make game move
  await GameMove.create({
    game_id: game_id,
    player_id: user_id,
    card_id: null,
    move_type: GameMoveType.DRAW,
  });

  // update turn
  await updateTurn(game, game.turn_direction, { action: null });

  res.status(200).json({ message: "Card drawn" });
  return;
};
