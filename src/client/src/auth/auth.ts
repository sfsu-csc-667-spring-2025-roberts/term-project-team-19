import { SERVER_URL } from "../config";
import { GameLobbyItem } from "../types/game";

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

export class Auth {
  private static instance: Auth;
  private currentUser: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // Check for existing session
    this.checkSession();
  }

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  public addAuthListener(listener: (user: User | null) => void): void {
    this.authListeners.push(listener);
  }

  public removeAuthListener(listener: (user: User | null) => void): void {
    this.authListeners = this.authListeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.authListeners.forEach((listener) => listener(this.currentUser));
  }

  private async checkSession(): Promise<void> {
    try {
      const response = await fetch(`${SERVER_URL}/auth/check`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
  }

  public async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const res = await response.json();
      this.currentUser = res.user;
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      // return 500 error
      return false;
    }
  }

  public async register(
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  }

  public async logout(): Promise<void> {
    try {
      await fetch(`${SERVER_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  public async getGames(): Promise<GameLobbyItem[]> {
    const response = await fetch(`${SERVER_URL}/games`, {
      credentials: "include",
    });
    console.log(response);
    return response.json();
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public async isAuthenticated(): Promise<boolean> {
    const user = this.getUser();
    if (!user || !user.token) {
      return false;
    }

    // make request to check if user is authenticated
    const response = await fetch(`${SERVER_URL}/auth/check`, {
      credentials: "include",
      method: "POST",
      headers: {
        Authorization: `Bearer ${user?.token || ""}`,
      },
    });
    if (response.ok) {
      return true;
    }
    return false;
  }
}
