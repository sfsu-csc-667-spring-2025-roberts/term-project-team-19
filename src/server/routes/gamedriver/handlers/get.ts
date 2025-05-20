import { GameCard, CardDefinition } from "../../../db/schema";
import { AuthenticatedRequestHandler, SessionUser } from "../../../types";
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

  const userCards = (await GameCard.findAll({
    where: { game_id, owner_id: user_id },
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
    order: [["created_at", "DESC"]],
    include: [
      {
        model: CardDefinition,
        required: true,
      },
    ],
  })) as GameCardInstance | null;

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

  res.json({ user: formattedUserCards, discard: formattedDiscardCard });
};
