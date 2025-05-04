import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import GameBoard from '../components/GameBoard';
import { Game, GamePlayer, Card, GameStatus, CardColor, CardType } from '../types/game';

// Mock data for development
const mockGame: Game = {
  id: 1,
  hostId: 1,
  status: GameStatus.PLAYING,
  currentTurn: 1,
  players: [
    {
      id: 1,
      userId: 1,
      username: 'Player 1',
      seatNumber: 1,
      cards: [
        { id: 1, type: CardType.NORMAL, color: CardColor.RED, value: 7 },
        { id: 2, type: CardType.ACTION, color: CardColor.BLUE, value: 0, action: 'draw_two' },
        { id: 3, type: CardType.WILD, color: CardColor.NONE, value: 0, action: 'draw_four' },
      ],
    },
    {
      id: 2,
      userId: 2,
      username: 'Player 2',
      seatNumber: 2,
      cards: Array(5).fill(null),
    },
    {
      id: 3,
      userId: 3,
      username: 'Player 3',
      seatNumber: 3,
      cards: Array(3).fill(null),
    },
  ],
  topCard: { id: 4, type: CardType.NORMAL, color: CardColor.RED, value: 5 },
  direction: 'clockwise',
};

export default function GameRoom() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game>(mockGame);
  const currentPlayer = game.players[0]; // For development, always use first player

  const handlePlayCard = (card: Card) => {
    // TODO: Implement card playing logic and API call
    console.log('Playing card:', card);
  };

  const handleDrawCard = () => {
    // TODO: Implement draw card logic and API call
    console.log('Drawing card');
  };

  useEffect(() => {
    // TODO: Implement WebSocket connection and game state updates
    console.log('Game room mounted, game ID:', gameId);
  }, [gameId]);

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        <Box flex={1}>
          <GameBoard
            game={game}
            currentPlayer={currentPlayer}
            onPlayCard={handlePlayCard}
            onDrawCard={handleDrawCard}
          />
        </Box>
        
        <Paper
          sx={{
            width: 300,
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <h3>Game Info</h3>
            <div>Game ID: {gameId}</div>
            <div>Current Turn: {game.players.find(p => p.id === game.currentTurn)?.username}</div>
            <div>Direction: {game.direction}</div>
          </Box>
          
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <h3>Chat</h3>
            {/* TODO: Implement chat component */}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 