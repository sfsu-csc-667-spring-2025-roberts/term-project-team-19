import { Response } from "express";
import { CardDefinition, Game, GameCard } from "../../../db/schema";
import { GameCardLocation, GameStatus } from "../../../enum/enums";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
  GameInstance,
  SessionUser,
  CardDefinitionInstance,
} from "../../../types";
import { initializeCards } from "../../../db/init_cards";

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

  // Create a deck with 2 of each card (standard UNO deck)
  const deck = [...cardDefinitions, ...cardDefinitions];

  // Shuffle the deck
  const shuffledDeck = shuffleArray(deck);

  // Get game details to find all players
  const game = (await Game.findByPk(game_id)) as GameInstance;
  const players = [
    // get all players from the game
    game.host_id,
    game.member_2_id,
    game.member_3_id,
    game.member_4_id,
  ].filter((id) => id !== null);

  // create an empty dictionary of players with their cards
  let playerHands: { [key: number]: number } = {};

  for (let player of players) {
    playerHands[player] = 0;
  }

  let currentPlayer = 0;

  let gameCards = [];

  for (let i = 0; i < shuffledDeck.length; i++) {
    if (i === 0) {
      gameCards.push({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.DISCARD_PILE,
        owner_id: null,
      });
    }

    // add remaining cards to the discard pile
    if (currentPlayer === -1) {
      gameCards.push({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.DISCARD_PILE,
        owner_id: null,
      });
    }

    // add cards to the player's hand
    else if (playerHands[currentPlayer] < 7) {
      gameCards.push({
        game_id,
        card_definition_id: shuffledDeck[i].id,
        location: GameCardLocation.HAND,
        owner_id: currentPlayer,
      });
      playerHands[currentPlayer]++;

      // if the player has 7 cards
      if (
        playerHands[currentPlayer] == 7 &&
        currentPlayer + 1 < players.length
      ) {
        currentPlayer++;
      } else {
        currentPlayer = -1;
      }
    }
  }

  // Bulk create all game cards
  await GameCard.bulkCreate(gameCards);
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
