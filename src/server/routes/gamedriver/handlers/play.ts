import { GameCard, CardDefinition, Game, GameMove } from "../../../db/schema";
import {
  AuthenticatedRequestHandler,
  GameInstance,
  SessionUser,
} from "../../../types";
import { AuthenticatedRequest } from "../../../types";
import { Response, Request, RequestHandler } from "express";
import {
  GameCardLocation,
  CardType,
  CardAction,
  CardColor,
  GameMoveType,
} from "../../../enum/enums";
import { Model } from "sequelize";

interface GameCardInstance extends Model {
  location: GameCardLocation;
  owner_id: number;
}

interface LastCardInstance extends Model {
  CardDefinition: {
    color: CardColor;
    value: number;
    action: CardAction;
  };
}

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

async function updateTurn(game: GameInstance, turn_direction: number) {
  let new_turn = game.current_turn + turn_direction;
  if (new_turn < 0) {
    new_turn = game.player_count - 1;
  } else if (new_turn >= game.player_count) {
    new_turn = 1;
  }
  game.update({
    current_turn: new_turn,
  });
}

export const playCardHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const game_id = req.params.game_id;
  const user_id = req.session.user?.id;

  const user = req.session.user as SessionUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const game = (await Game.findByPk(game_id)) as GameInstance;
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  console.log("Request body:", req.body);
  const body = req.body;
  console.log("Body:", body);
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
    order: [["created_at", "DESC"]],
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
    if (body.color === null || body.action !== null || body.value === null) {
      res.status(400).json({ error: "Invalid normal card" });
    }

    if (
      lastCard &&
      lastCard.CardDefinition.color !== body.color &&
      lastCard.CardDefinition.value !== body.value
    ) {
      res.status(400).json({ error: "Invalid card" });
    }
  } else if (body.type === CardType.ACTION) {
    if (body.action === null || body.value !== null) {
      res.status(400).json({ error: "Invalid action card" });
    }
    // card must match last card
    if (
      lastCard &&
      lastCard.CardDefinition.color !== body.color &&
      lastCard.CardDefinition.action !== body.action
    ) {
      res.status(400).json({ error: "Invalid card" });
    }

    // update turn direction
    if (body.action === CardAction.REVERSE) {
      // update order -/+1
      if (game.turn_direction === 1) {
        game.update({
          turn_direction: -1,
        });
      } else if (game.turn_direction === -1) {
        game.update({
          turn_direction: 1,
        });
      }
    }
  }

  // update game move
  await createGameMove(req.body);

  // add card to discard pile
  gameCard.update({
    location: GameCardLocation.DISCARD_PILE,
  });

  // update turn
  await updateTurn(game, game.turn_direction);

  res.status(200).json({ message: "Card played" });
};
