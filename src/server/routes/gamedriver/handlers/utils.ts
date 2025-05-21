import { Model } from "sequelize";
import { CardDefinition, GameCard } from "../../../db/schema";
import {
  CardAction,
  CardColor,
  CardType,
  GameCardLocation,
} from "../../../enum/enums";
import { GameInstance, GamePlayerInstance } from "../../../types";

import {
  GameCardInstance,
  LastCardInstance,
  CardDefinitionInstance,
} from "../../../types/gamedriver";

export async function handleWildCard(gameCard: GameCardInstance, body: any) {
  console.log("Playing wild card");
  if (body.color === null) {
    console.log("No color provided");
    return false;
  }

  const color = body.color;
  const coloredWildCard = (await CardDefinition.findOne({
    where: {
      type: CardType.WILD,
      color: color,
    },
  })) as CardDefinitionInstance;

  if (!coloredWildCard) {
    return false;
  }

  console.log("Updating game card");
  gameCard.update({
    card_definition_id: coloredWildCard.id,
  });
  console.log("Game card updated", gameCard);
  return true;
}

export async function handleNormalCard(
  gameCard: GameCardInstance,
  lastCard: LastCardInstance,
  body: any,
) {
  console.log("Playing normal card");
  if (body.color === null || body.action !== null || body.value === null) {
    console.log("Invalid normal card");
    return false;
  }
  // card must match last card
  if (
    lastCard &&
    lastCard.CardDefinition.color !== body.color &&
    lastCard.CardDefinition.value !== body.value
  ) {
    console.log("card does not match last card");
    console.log(
      "lastCard:",
      lastCard.CardDefinition.color,
      lastCard.CardDefinition.value,
    );
    return false;
  }
  return true;
}

export async function handleActionCard(
  game: GameInstance,
  gameCard: GameCardInstance,
  lastCard: LastCardInstance,
  body: any,
) {
  console.log("Playing action card");
  if (body.action === null || body.value !== null) {
    console.log("Invalid action card");
    return false;
  }
  // card must match last card
  if (
    lastCard &&
    lastCard.CardDefinition.color !== body.color &&
    lastCard.CardDefinition.action !== body.action
  ) {
    console.log("card does not match last card");
    console.log(
      "lastCard:",
      lastCard.CardDefinition.color,
      lastCard.CardDefinition.action,
    );
    console.log("body:", body.color, body.action);
    return false;
  }

  // update turn direction
  if (body.action === CardAction.REVERSE) {
    await handleReverse(game, game.turn_direction);
  }
  if (body.action === CardAction.DRAW_FOUR) {
    const nextPlayer = await getNextPlayer(game);
    if (!nextPlayer || !nextPlayer.seat_number) {
      console.log("Next player not found");
      return false;
    }
    await handleDraw(game, nextPlayer, 4);
  }
  if (body.action === CardAction.DRAW_TWO) {
    const nextPlayer = await getNextPlayer(game);
    if (!nextPlayer || !nextPlayer.seat_number) {
      console.log("Next player not found");
      return false;
    }
    await handleDraw(game, nextPlayer, 2);
  }
  return true;
}

async function handleReverse(game: GameInstance, turn_direction: number) {
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

async function handleDraw(
  game: GameInstance,
  player: GamePlayerInstance,
  num_cards: number,
) {
  // get num_cards from deck
  console.log("Drawing cards");
  console.log(`Player: ${player.user_id}`);
  const deck = await GameCard.findAll({
    where: {
      game_id: game.id,
      location: GameCardLocation.DECK,
    },
  });
  for (let i = 0; i < num_cards; i++) {
    const card = deck[i];
    card.update({
      location: GameCardLocation.HAND,
      owner_id: player.user_id,
    });
  }
}

async function getNextPlayer(game: GameInstance) {
  const currentPlayer = game.gamePlayers.find(
    (player) => player.seat_number === game.current_turn,
  );
  if (!currentPlayer || !currentPlayer.seat_number) {
    return null;
  }
  console.log(`Current player: ${currentPlayer.user_id}`);
  let next_seat = currentPlayer.seat_number + game.turn_direction;

  if (next_seat < 1) {
    next_seat = game.gamePlayers.length;
  } else if (next_seat > game.gamePlayers.length) {
    next_seat = 1;
  }

  const nextPlayer = game.gamePlayers.find(
    (player) => player.seat_number === next_seat && player.game_id === game.id,
  );
  if (!nextPlayer || !nextPlayer.seat_number) {
    return null;
  }
  console.log(`Next player: ${nextPlayer.user_id}`);
  return nextPlayer;
}

export async function updateTurn(
  game: GameInstance,
  turn_direction: number,
  body: any,
) {
  console.log("Updating turn");
  console.log("Turn direction:", turn_direction);
  console.log("Current turn:", game.current_turn);
  // if gameCard is reverse and there are 2 players, keep the same turn
  if (body.action === CardAction.REVERSE && game.gamePlayers.length === 2) {
    return;
  }

  let new_turn = null;

  // if gameCard is skip new_turn += game.current_turn + (turn_direction * 2)
  if (body.action === CardAction.SKIP) {
    console.log("Skipping turn");
    // next turn twice
    new_turn = nextTurn(
      game.current_turn,
      turn_direction,
      game.gamePlayers.length,
    );
    new_turn = nextTurn(new_turn, turn_direction, game.gamePlayers.length);
  } else {
    new_turn = nextTurn(
      game.current_turn,
      turn_direction,
      game.gamePlayers.length,
    );
  }
  game.update({
    current_turn: new_turn,
  });
  console.log("Updated turn:", game.current_turn);
}

function nextTurn(
  current_turn: number,
  turn_direction: number,
  num_players: number,
) {
  let new_turn = current_turn + turn_direction;

  if (new_turn < 1) {
    new_turn = num_players;
  } else if (new_turn > num_players) {
    new_turn = 1;
  }
  return new_turn;
}
