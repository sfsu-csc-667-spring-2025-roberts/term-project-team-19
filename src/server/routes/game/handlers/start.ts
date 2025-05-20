import { Response } from "express";
import {
  CardDefinition,
  Game,
  GameCard,
  GamePlayer,
  User,
} from "../../../db/schema";
import { CardType, GameCardLocation, GameStatus } from "../../../enum/enums";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  GameInstance,
  SessionUser,
  CardDefinitionInstance,
} from "../../../types";
import { initializeCards } from "../../../db/init_cards";
import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createGameCards = async (game_id: number) => {
  // Get all card definitions
  const cardDefinitions =
    (await CardDefinition.findAll()) as CardDefinitionInstance[];

  // Create a deck with 3 of each card (standard UNO deck)
  const deck = [...cardDefinitions, ...cardDefinitions, ...cardDefinitions];

  // Shuffle the deck
  const shuffledDeck = shuffleArray(deck);

  // Get game details to find all players
  const game = (await Game.findByPk(game_id)) as GameInstance;
  const player_ids = [
    // get all players from the game
    game.host_id,
    game.member_2_id,
    game.member_3_id,
    game.member_4_id,
  ].filter((id) => id !== null);

  let i = 0;
  for (let player_id of player_ids) {
    let cards = 0;
    while (cards < 7) {
      await GameCard.create({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.HAND,
        owner_id: player_id,
      });
      cards++;
      i++;
    }
  }

  // add the first normal card to the discard pile
  while (i < shuffledDeck.length) {
    if (shuffledDeck[i].type === CardType.NORMAL) {
      await GameCard.create({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.DISCARD_PILE,
      });
      break;
    } else {
      await GameCard.create({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.DECK,
      });
    }
    i++;
  }

  // add remaining cards to the deck
  for (let j = i + 1; j < shuffledDeck.length; j++) {
    await GameCard.create({
      game_id,
      card_definition_id: shuffledDeck[j].id,
      location: GameCardLocation.DECK,
    });
  }
};

export const startGameHandler: AuthenticatedRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.params.game_id) {
    res.status(400).json({ error: "Game ID is required" });
    return;
  }
  const game_id = parseInt(req.params.game_id);

  const user = req.session.user as SessionUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const game = (await Game.findOne({
    where: {
      id: game_id,
      host_id: user.id,
      status: GameStatus.WAITING,
    },
  })) as GameInstance;

  if (!game) {
    res.status(404).json({ error: "Game not found or you are not the host" });
    return;
  }

  // Check if there are at least 2 players
  const playerCount =
    [game.member_2_id, game.member_3_id, game.member_4_id].filter(
      (id) => id !== null,
    ).length + 1; // +1 for host
  if (playerCount < 2) {
    res
      .status(400)
      .json({ error: "Need at least 2 players to start the game" });
    return;
  }

  // Initialize cards
  await createGameCards(game_id);

  // get all players from the game
  const players = [
    game.host_id,
    game.member_2_id,
    game.member_3_id,
    game.member_4_id,
  ].filter((id) => id !== null);

  // assign seat numbers to players
  for (let i = 0; i < players.length; i++) {
    let player = await GamePlayer.findOne({
      where: {
        game_id: game_id,
        user_id: players[i],
      },
    });
    if (player) {
      await player.update({
        seat_number: i + 1,
      });
    }
  }

  await game.update({
    status: GameStatus.PLAYING,
    current_turn: user.id,
    turn_direction: 1,
  });

  user.game_id = game_id;
  req.session.user = user;
  req.session.save();

  res.status(200).json({ game });
};

export default startGameHandler;
