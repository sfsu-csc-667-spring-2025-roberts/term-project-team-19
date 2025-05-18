import { Request, Response, NextFunction, response } from "express";
import { Auth } from "../middleware/auth";
import { GameManager } from "../middleware/game";
import { AuthenticatedRequest } from "../types";
import { SocketManager } from "../middleware/socket";
export class RequestHandler {
  private static instance: RequestHandler;
  public auth: Auth;
  public gameManager: GameManager;
  public socketManager: SocketManager;

  private constructor() {
    this.auth = Auth.getInstance();
    this.gameManager = GameManager.getInstance();
    this.socketManager = SocketManager.getInstance();
  }

  public static getInstance(): RequestHandler {
    if (!RequestHandler.instance) {
      RequestHandler.instance = new RequestHandler();
    }
    return RequestHandler.instance;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated = async (): Promise<boolean> => {
    return await this.auth.isAuthenticated();
  };

  public handleLogin = async (req: AuthenticatedRequest, res: Response) => {
    const { username, password } = req.body;
    // send authenticated request to server

    let response = await this.auth.login(username, password);
    // send authenticate
    if (response) {
      console.log(this.auth.getUser());
      console.log("Login successful");
      res.redirect("/landing");
    } else {
      res.status(500).json({ error: "Login failed" });
    }
  };

  public handleRegister = async (req: AuthenticatedRequest, res: Response) => {
    const { username, password, email } = req.body;
    const response = await this.auth.register(username, password, email);
    if (response.ok) {
      res.redirect("/login");
    } else {
      const responseBody = await response.json();
      console.log("responseBody: ", responseBody);
      res.status(response.status).json(responseBody);
    }
  };

  public handleLogout = async (req: AuthenticatedRequest, res: Response) => {
    await this.auth.logout();
    if (res.statusCode === 200) {
      res.redirect("/login");
    } else {
      res.status(500).json({ error: "Logout failed" });
    }
  };

  public requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      console.log("User is not authenticated");
      res.redirect("/login");
      return;
    }
    next();
  };

  public redirectIfAuthenticated = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const isAuth = await this.isAuthenticated();
    if (isAuth) {
      res.redirect("/landing");
      return;
    }
    next();
  };

  public handleJoinGame = async (req: AuthenticatedRequest, res: Response) => {
    const user = this.auth.getUser();
    const game_id = parseInt(req.params.id);
    if (!user) {
      res.status(500).json({ error: "User not found" });
      return;
    }
    const game_joined = await this.gameManager.joinGame(game_id, user.id);

    if (game_joined) {
      this.socketManager.joinGame(game_id);
      res.redirect(`/games/${req.params.id}/lobby`);
    } else {
      res.status(500).json({ error: "Failed to join game" });
    }
  };

  public handleCreateGame = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user = this.auth.getUser();
    if (!user) {
      res.status(500).json({ error: "User not found" });
      return;
    }
    const game_id = await this.gameManager.createGame(user.id);
    if (game_id) {
      this.socketManager.joinGame(game_id);
      res.redirect(`/games/${game_id}/lobby`);
    } else {
      res.status(500).json({ error: "Game creation failed" });
    }
  };
}
