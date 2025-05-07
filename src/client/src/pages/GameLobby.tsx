import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Refresh as RefreshIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GameLobbyItem, GameStatus } from '../types/game';

export default function GameLobby() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [games, setGames] = useState<GameLobbyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchGames();
  }, [refreshKey]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ maxPlayers }),
      });

      if (response.ok) {
        const game = await response.json();
        setCreateDialogOpen(false);
        navigate(`/game/${game.id}`);
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleJoinGame = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UNO Game Lobby
          </Typography>
          <Typography sx={{ mr: 2 }}>Welcome, {user?.username}!</Typography>
          <IconButton color="inherit" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="md" 
        sx={{ 
          mt: 4, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)' // Subtract AppBar height
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 3,
          width: '100%',
          maxWidth: 600
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Game Lobby
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ 
              minWidth: 200,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Create New Game
          </Button>

          <Paper 
            elevation={3} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <List>
              {loading ? (
                <ListItem>
                  <ListItemText 
                    primary="Loading games..." 
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              ) : games.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No games available. Create one!" 
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              ) : (
                games.map((game) => (
                  <ListItem 
                    key={game.id} 
                    divider
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2
                    }}
                  >
                    <ListItemText
                      primary={`Host: ${game.hostUsername}`}
                      secondary={`Players: ${game.playerCount}/${game.maxPlayers} | Status: ${game.status}`}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinGame(game.id)}
                      disabled={
                        game.status !== GameStatus.WAITING ||
                        game.playerCount >= game.maxPlayers
                      }
                      sx={{ ml: 2 }}
                    >
                      Join Game
                    </Button>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>
      </Container>

      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        PaperProps={{
          sx: {
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>Create New Game</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Max Players</InputLabel>
            <Select
              value={maxPlayers}
              label="Max Players"
              onChange={(e) => setMaxPlayers(e.target.value as number)}
            >
              <MenuItem value={2}>2 Players</MenuItem>
              <MenuItem value={3}>3 Players</MenuItem>
              <MenuItem value={4}>4 Players</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateGame} 
            variant="contained" 
            color="primary"
            sx={{ minWidth: 100 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 