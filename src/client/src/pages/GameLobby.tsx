import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { GameLobbyItem, GameStatus } from "../types/game";
import { SERVER_URL } from "../config";

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
      const response = await fetch(`${SERVER_URL}/games`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/games/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ maxPlayers }),
      });

      if (response.ok) {
        const game = await response.json();
        setCreateDialogOpen(false);
        navigate(`/games/${game.id}`);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const handleJoinGame = async (gameId: number) => {
    try {
      const response = await fetch(`${SERVER_URL}/game/${gameId}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate(`s/${gameId}`);
      }
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="game-lobby">
      <header className="app-header">
        <div className="header-content">
          <h1>UNO Game Lobby</h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.username}!</span>
            <button
              className="icon-button"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              ↻
            </button>
            <button className="icon-button" onClick={handleLogout}>
              ⇥
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="lobby-container">
          <h2 className="lobby-title">Game Lobby</h2>

          <button
            className="create-game-button"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Game
          </button>

          <div className="games-list">
            {loading ? (
              <div className="list-item">
                <p>Loading games...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="list-item">
                <p>No games available. Create one!</p>
              </div>
            ) : (
              games.map((game) => (
                <div key={game.id} className="list-item">
                  <div className="game-info">
                    <h3>Host: {game.hostUsername}</h3>
                    <p>
                      Players: {game.playerCount}/{game.maxPlayers} | Status:{" "}
                      {game.status}
                    </p>
                  </div>
                  <button
                    className="join-button"
                    onClick={() => handleJoinGame(game.id)}
                    disabled={
                      game.status !== GameStatus.WAITING ||
                      game.playerCount >= game.maxPlayers
                    }
                  >
                    Join Game
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {createDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Create New Game</h2>
            <div className="dialog-content">
              <div className="form-group">
                <label htmlFor="maxPlayers">Max Players</label>
                <select
                  id="maxPlayers"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setCreateDialogOpen(false)}>Cancel</button>
              <button onClick={handleCreateGame} className="primary-button">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .game-lobby {
          min-height: 100vh;
          background-color: #121212;
          color: white;
        }

        .app-header {
          background-color: #1e1e1e;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #ff4400;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-text {
          color: #888;
        }

        .icon-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .icon-button:hover {
          color: #ff4400;
        }

        .main-content {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .lobby-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .lobby-title {
          color: #ff4400;
          font-size: 2rem;
          margin: 0;
        }

        .create-game-button {
          background-color: #ff4400;
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: 4px;
          cursor: pointer;
          min-width: 200px;
        }

        .create-game-button:hover {
          background-color: #ff5500;
        }

        .games-list {
          width: 100%;
          max-width: 800px;
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
        }

        .list-item {
          padding: 1rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .game-info h3 {
          margin: 0;
          color: white;
        }

        .game-info p {
          margin: 0.5rem 0 0;
          color: #888;
        }

        .join-button {
          background-color: #ff4400;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .join-button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dialog {
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
        }

        .dialog h2 {
          margin: 0 0 1.5rem;
          text-align: center;
          color: #ff4400;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #888;
        }

        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #333;
          border-radius: 4px;
          background-color: #2a2a2a;
          color: white;
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .dialog-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .dialog-actions button:not(.primary-button) {
          background-color: #333;
          color: white;
        }

        .primary-button {
          background-color: #ff4400;
          color: white;
        }
      `}</style>
    </div>
  );
}
