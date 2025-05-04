import { Paper, styled } from '@mui/material';
import { Card as CardType, CardColor, CardType as CardTypes } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
}

const StyledCard = styled(Paper)<{ color: CardColor; disabled?: boolean }>(({ theme, color, disabled }) => ({
  width: '120px',
  height: '180px',
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: color === CardColor.NONE ? '#000' : color,
  color: '#fff',
  fontSize: '2rem',
  fontWeight: 'bold',
  border: '4px solid white',
  borderRadius: '10px',
  position: 'relative',
  opacity: disabled ? 0.7 : 1,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: disabled ? 'none' : 'translateY(-10px)',
  },
}));

const CardCircle = styled('div')({
  width: '80px',
  height: '80px',
  backgroundColor: 'white',
  borderRadius: '50%',
  transform: 'rotate(-45deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const CardContent = styled('div')({
  transform: 'rotate(45deg)',
  color: '#000',
});

export default function Card({ card, onClick, disabled }: CardProps) {
  const getDisplayValue = () => {
    if (card.type === CardTypes.WILD) {
      return card.action === 'draw_four' ? '+4' : '★';
    }
    if (card.type === CardTypes.ACTION) {
      switch (card.action) {
        case 'draw_two':
          return '+2';
        case 'skip':
          return '⊘';
        case 'reverse':
          return '↺';
        default:
          return '';
      }
    }
    return card.value.toString();
  };

  return (
    <StyledCard
      color={card.color}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      elevation={3}
    >
      <CardCircle>
        <CardContent>{getDisplayValue()}</CardContent>
      </CardCircle>
    </StyledCard>
  );
} 