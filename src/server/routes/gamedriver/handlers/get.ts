import {
  GameCard,
  CardDefinition,
  Game,
  GamePlayer,
  GameMove,
} from "../../../db/schema";
import {
  AuthenticatedRequestHandler,
  GameInstance,
  SessionUser,
} from "../../../types";
import { AuthenticatedRequest } from "../../../types";
import { Response } from "express";
import { GameCardLocation } from "../../../enum/enums";
import { Model } from "sequelize";

interface GameCardInstance extends Model {
  id: number;
  location: GameCardLocation;
  CardDefinition: CardDefinitionInstance;
}

interface CardDefinitionInstance extends Model {
  type: string;
  action: string | null;
  color: string;
  value: number | null;
}

interface GamePlayerInstance extends Model {
  username: string;
  user_id: number;
}

interface GameMoveInstance extends Model {
  game_id: number;
  player_id: number;
  card_id: number;
  move_type: string;
  color: string;
}

export const getUserCardsHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { game_id, user_id } = req.params;

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

  const userCards = (await GameCard.findAll({
    where: { game_id, owner_id: user_id, location: GameCardLocation.HAND },
    order: [["updated_at", "DESC"]],
    include: [
      {
        model: CardDefinition,
        required: true,
      },
    ],
  })) as GameCardInstance[];

  // get the last card in the discard pile
  const currentDiscardPileCard = (await GameCard.findOne({
    where: { game_id, location: GameCardLocation.DISCARD_PILE },
    order: [["updatedAt", "DESC"]],
    include: [
      {
        model: CardDefinition,
        required: true,
      },
    ],
  })) as GameCardInstance | null;

  const lastMove = (await GameMove.findOne({
    where: { game_id },
    order: [["updated_at", "DESC"]],
  })) as GameMoveInstance;

  if (!userCards) {
    res.status(400).json({ error: "User cards not found" });
    return;
  }

  // Format cards as single objects
  const formattedUserCards = userCards.map((card) => ({
    id: card.id,
    type: card.CardDefinition.type,
    action: card.CardDefinition.action,
    color: card.CardDefinition.color,
    value: card.CardDefinition.value,
    location: card.location,
  }));

  const formattedDiscardCard = currentDiscardPileCard
    ? {
        id: currentDiscardPileCard.id,
        type: currentDiscardPileCard.CardDefinition.type,
        action: currentDiscardPileCard.CardDefinition.action,
        color: currentDiscardPileCard.CardDefinition.color,
        value: currentDiscardPileCard.CardDefinition.value,
        location: currentDiscardPileCard.location,
      }
    : null;

  const currentTurnPlayer = (await GamePlayer.findOne({
    where: { game_id, seat_number: game.current_turn },
  })) as GamePlayerInstance;

  res.json({
    user: formattedUserCards,
    discard: formattedDiscardCard,
    currentTurn: currentTurnPlayer,
  });
};
