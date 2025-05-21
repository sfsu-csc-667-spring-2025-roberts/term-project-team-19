import { CardColor, GameCardLocation } from "server/enum/enums";

import { Model } from "sequelize";
import { CardType } from "server/enum/enums";

import { CardAction } from "server/enum/enums";

export interface GameCardInstance extends Model {
  id: number;
  game_id: number;
  card_definition_id: number;
  location: GameCardLocation;
  owner_id: number | null;
  CardDefinition: CardDefinitionInstance;
}

export interface GameCardInstance extends Model {
  id: number;
  game_id: number;
  card_definition_id: number;
  location: GameCardLocation;
  owner_id: number | null;
  CardDefinition: CardDefinitionInstance;
}

export interface LastCardInstance extends Model {
  CardDefinition: {
    color: CardColor;
    value: number;
    action: CardAction;
  };
}

export interface CardDefinitionInstance extends Model {
  id: number;
  name: string;
  type: CardType;
  color: string;
  value: number;
  action: CardAction;
}
