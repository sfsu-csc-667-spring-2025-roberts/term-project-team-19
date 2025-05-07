import { Box, Paper, styled } from '@mui/material';
import { Game, GamePlayer, Card as CardType } from '../types/game';
import Card from './Card';

interface GameBoardProps {
  game: Game;
  currentPlayer: GamePlayer;
  onPlayCard: (card: CardType) => void;
  onDrawCard: () => void;
}

const GameBoardContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
}));

const PlayArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(4),
}));

const PlayerHand = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2),
  overflowX: 'auto',
}));

const OpponentArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(2),
}));

const OpponentHand = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: theme.palette.text.primary,
}));

export default function GameBoard({ game, currentPlayer, onPlayCard, onDrawCard }: GameBoardProps) {
  const otherPlayers = game.players.filter(player => player.id !== currentPlayer.id);

  const canPlayCard = (card: CardType) => {
    if (!game.topCard) return true;
    if (card.color === game.topCard.color) return true;
    if (card.value === game.topCard.value) return true;
    if (card.type === 'wild') return true;
    return false;
  };

  return (
    <GameBoardContainer>
      <OpponentArea>
        {otherPlayers.map(player => (
          <OpponentHand key={player.id}>
            <div>{player.username}</div>
            <div>{player.cards.length} cards</div>
          </OpponentHand>
        ))}
      </OpponentArea>

      <PlayArea>
        {game.topCard && (
          <Card card={game.topCard} disabled />
        )}
        <Paper
          sx={{
            width: 120,
            height: 180,
            backgroundColor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={onDrawCard}
        >
          Draw Card
        </Paper>
      </PlayArea>

      <PlayerHand>
        {currentPlayer.cards.map((card, index) => (
          <Card
            key={`${card.id}-${index}`}
            card={card}
            onClick={() => canPlayCard(card) && onPlayCard(card)}
            disabled={!canPlayCard(card)}
          />
        ))}
      </PlayerHand>
    </GameBoardContainer>
  );
} 