import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import GameBoard from '../components/GameBoard';
import { Game, GamePlayer, Card, GameStatus, CardColor, CardType } from '../types/game';
import { io, Socket } from 'socket.io-client';

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
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const currentPlayer = game.players[0]; // For development, always use first player
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:3000');
    socketRef.current.emit('joinGame', gameId);

    socketRef.current.on('cardPlayed', ({ card, playerId }) => {
      // Update game state in UI (for demo, just set top card)
      setGame(prevGame => ({
        ...prevGame,
        topCard: card,
      }));
    });

    socketRef.current.on('chatMessage', ({ message, playerId }) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [gameId]);

  const handlePlayCard = (card: Card) => {
    // Local UI update: remove card from hand and set as top card
    setGame(prevGame => {
      const updatedPlayers = prevGame.players.map(player =>
        player.id === currentPlayer.id
          ? { ...player, cards: player.cards.filter(c => c && c.id !== card.id) }
          : player
      );
      return {
        ...prevGame,
        players: updatedPlayers,
        topCard: card,
      };
    });
    // Emit playCard event to backend
    socketRef.current?.emit('playCard', { gameId, card, playerId: currentPlayer.id });
    console.log('Playing card:', card);
  };

  const handleDrawCard = () => {
    // TODO: Implement draw card logic and API call
    console.log('Drawing card');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === '') return;
    // Only emit to server, do NOT update local state here
    socketRef.current?.emit('sendChat', { gameId, message: chatInput, playerId: currentPlayer.id });
    setChatInput('');
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
          
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column' }}>
            <h3>Chat</h3>
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: '#222',
                  color: '#fff',
                  p: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  maxWidth: '80%',
                  alignSelf: 'flex-start',
                  wordBreak: 'break-word'
                }}
              >
                {msg}
              </Box>
            ))}
          </Box>
          <Box component="form" onSubmit={handleSendChat} sx={{ display: 'flex', mt: 2 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, marginRight: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '8px 16px' }}>Send</button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 