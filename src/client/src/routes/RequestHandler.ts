import { Request, Response, NextFunction, response } from "express";
import { Auth } from "../auth/auth";
import { GameManager } from "../game/game";
import { AuthenticatedRequest } from "../types";

export class RequestHandler {
  private static instance: RequestHandler;
  public auth: Auth;

  private constructor() {
    this.auth = Auth.getInstance();
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
      res.redirect("/lobby");
    } else {
      res.status(500).json({ error: "Login failed" });
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
      res.redirect("/lobby");
      return;
    }
    next();
  };
}
