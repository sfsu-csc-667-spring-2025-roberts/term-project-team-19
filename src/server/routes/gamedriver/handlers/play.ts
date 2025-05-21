import {
  GameCard,
  CardDefinition,
  Game,
  GameMove,
  GamePlayer,
} from "../../../db/schema";
import { AuthenticatedRequestHandler, GameInstance } from "../../../types";
import { AuthenticatedRequest } from "../../../types";
import { Response, Request, RequestHandler } from "express";
import {
  handleActionCard,
  handleNormalCard,
  handleWildCard,
  updateTurn,
} from "./utils";
import { GameCardInstance, LastCardInstance } from "../../../types/gamedriver";
import {
  GameMoveType,
  GameCardLocation,
  CardType,
  CardAction,
} from "../../../enum/enums";

async function createGameMove(data: any) {
  // create game move
  const gameMove = await GameMove.create({
    game_id: data.game_id,
    player_id: data.user_id,
    card_id: data.game_card_id,
    move_type: GameMoveType.PLAY,
    color: data.color,
  });
  return gameMove;
}

export const playCardHandler: AuthenticatedRequestHandler = async (
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

  const body = req.body;
  // get game card
  const gameCard = (await GameCard.findByPk(
    body.game_card_id,
  )) as GameCardInstance;
  if (!gameCard) {
    res.status(404).json({ error: "Game card not found" });
    return;
  }

  // get last card in discard pile
  const lastCard = (await GameCard.findOne({
    where: {
      game_id: game_id,
      location: GameCardLocation.DISCARD_PILE,
    },
    order: [["updatedAt", "DESC"]],
    include: [
      {
        model: CardDefinition,
        required: true,
      },
    ],
  })) as LastCardInstance;

  // card must be in the hand
  if (gameCard.location !== GameCardLocation.HAND) {
    res.status(400).json({ error: "Game card is not in the hand" });
    return;
  }

  // card must be in the hand
  if (gameCard.owner_id !== user_id) {
    res.status(400).json({ error: "Game card is not in the hand" });
    return;
  }

  // handle normal cards
  if (body.type === CardType.NORMAL) {
    const success = await handleNormalCard(gameCard, lastCard, body);
    if (!success) {
      res.status(400).json({ error: "Invalid normal card" });
      return;
    }
  }
  // handle wild cards
  else if (body.type === CardType.WILD) {
    const success = await handleWildCard(gameCard, body);
    if (!success) {
      res.status(400).json({ error: "Invalid wild card" });
      return;
    }
  }
  // handle action cards
  else if (body.type === CardType.ACTION) {
    const success = await handleActionCard(game, gameCard, lastCard, body);
    if (!success) {
      res.status(400).json({ error: "Invalid action card" });
      return;
    }
  }

  // update game move
  await createGameMove(req.body);

  // add card to discard pile
  gameCard.update({
    location: GameCardLocation.DISCARD_PILE,
  });

  console.log("Game card:", req.body);

  // update turn
  await updateTurn(game, game.turn_direction, req.body);

  res.status(200).json({ message: "Card played" });
  return;
};
