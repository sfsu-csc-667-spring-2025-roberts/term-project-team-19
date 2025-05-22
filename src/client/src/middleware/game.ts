import { Game, GameStatus } from "../types/game.js";
import { Auth } from "./auth";

export interface GameLobbyItem {
  id: number;
  hostUsername: string;
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
}

export class GameManager {
  private static instance: GameManager;
  private games: GameLobbyItem[] = [];
  private mygames: GameLobbyItem[] = [];
  private gameListeners: ((games: GameLobbyItem[]) => void)[] = [];
  private auth: Auth;

  private constructor() {
    this.auth = Auth.getInstance();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public getUser() {
    return this.auth.getUser();
  }

  public addGameListener(listener: (games: GameLobbyItem[]) => void): void {
    this.gameListeners.push(listener);
  }

  public removeGameListener(listener: (games: GameLobbyItem[]) => void): void {
    this.gameListeners = this.gameListeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.gameListeners.forEach((listener) => listener(this.games));
  }

  private getAuthHeaders(): HeadersInit {
    const user = this.auth.getUser();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token || ""}`,
    };
  }

  public async fetchGame(gameId: number): Promise<GameLobbyItem | null> {
    const response = await fetch(`http://localhost:3000/games/${gameId}`, {
      credentials: "include",
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    console.log("response", response);
    if (response.ok) {
      const game = await response.json();
      return game;
    }
    return null;
  }

  public async fetchGames(): Promise<GameLobbyItem[]> {
    try {
      const response = await fetch(`http://localhost:3000/games/`, {
        credentials: "include",
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const games = await response.json();
        console.log("games", games);
        this.games = games;
        this.notifyListeners();
        return games;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch games:", error);
      return [];
    }
  }

  public async getMyGames(): Promise<GameLobbyItem[]> {
    console.log("In client/src/middleware/game.ts");
    console.log("Trying to getMyGames\nheaders: ", this.getAuthHeaders());
    try {
      const response = await fetch("http://localhost:3000/games/mygames", {
        credentials: "include",
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      console.log("Response:", response);
      if (response.ok) {
        const mygames = await response.json();
        console.log("mygames", mygames);
        this.mygames = mygames;
        this.notifyListeners();
        return mygames;
      } else {
        console.log("Response not ok", response);
      }
      return [];
    } catch (error) {
      console.error("Failed to getMyGames:", error);
      return [];
    }
  }

  public async createGame(maxPlayers: number): Promise<number | null> {
    try {
      const response = await fetch(`http://localhost:3000/games`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ maxPlayers }),
      });

      if (response.ok) {
        const game = await response.json();
        await this.fetchGames();
        return game.id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create game:", error);
      return null;
    }
  }

  public async joinGame(
    gameId: number,
    userId: number | null,
  ): Promise<boolean> {
    if (!userId) {
      console.error("No user ID provided");
      return false;
    }
    const request = new Request(`http://localhost:3000/games/${gameId}/join`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
    });
    try {
      const response = await fetch(request);
      console.log("response", response);

      if (response.ok) {
        console.log("joined game");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to join game:", error);
      return false;
    }
  }
}
