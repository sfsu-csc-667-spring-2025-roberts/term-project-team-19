export class GameManager {
  constructor() {
    this.games = [];
    this.gameListeners = [];
  }
  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  addGameListener(listener) {
    this.gameListeners.push(listener);
  }
  removeGameListener(listener) {
    this.gameListeners = this.gameListeners.filter((l) => l !== listener);
  }
  notifyListeners() {
    this.gameListeners.forEach((listener) => listener(this.games));
  }
  async fetchGames() {
    try {
      const response = await fetch(`http://localhost:3000/games`, {
        credentials: "include",
        method: "GET",
      });
      if (response.ok) {
        this.games = await response.json();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    }
  }
  async createGame(maxPlayers) {
    try {
      const response = await fetch(`http://localhost:3000/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ maxPlayers }),
      });
      if (response.ok) {
        const game = await response.json();
        await this.fetchGames(); // Refresh the games list
        return game.id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create game:", error);
      return null;
    }
  }
  async joinGame(gameId) {
    try {
      const response = await fetch(
        `http://localhost:3000/games/${gameId}/join`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (response.ok) {
        await this.fetchGames(); // Refresh the games list
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to join game:", error);
      return false;
    }
  }
  getGames() {
    return this.games;
  }
}
//# sourceMappingURL=game.js.map
