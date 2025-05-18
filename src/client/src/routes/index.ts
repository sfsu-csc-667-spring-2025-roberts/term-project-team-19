import { Router, Request, Response } from "express";
import { RequestHandler } from "./RequestHandler";
import { LoginView } from "../views/LoginView";
import { RegisterView } from "../views/RegisterView";
import { LobbyView } from "../views/LandingView";
import { GameView } from "../views/GameView";
import { GameManager } from "../game/game";
import { Auth } from "../auth/auth";

const router = Router();
const requestHandler = RequestHandler.getInstance();
const gameManager = GameManager.getInstance();
const auth = Auth.getInstance();
// Root route - redirects based on auth status
router.get(
  "/",
  requestHandler.requireAuth,
  async (req: Request, res: Response) => {
    await new LobbyView(gameManager).render(res);
  },
);

// Protected routes
router.get(
  "/lobby",
  requestHandler.requireAuth,
  async (req: Request, res: Response) => {
    console.log("Lobby route");
    await new LobbyView(gameManager).render(res);
  },
);

router.get(
  "/game",
  requestHandler.requireAuth,
  (req: Request, res: Response) => {
    new GameView().render(res);
  },
);

// Public routes
router.get(
  "/login",
  requestHandler.redirectIfAuthenticated,
  (req: Request, res: Response) => {
    new LoginView().render(res);
  },
);

router.post(
  "/login",
  requestHandler.handleLogin,
  (req: Request, res: Response) => {
    if (res.statusCode === 200) {
      res.redirect("/lobby");
    }
  },
);

router.post(
  "/logout",
  requestHandler.handleLogout,
  (req: Request, res: Response) => {},
);

router.post(
  "/register",
  requestHandler.handleRegister,
  (req: Request, res: Response) => {
    if (res.statusCode === 200) {
      res.redirect("/login");
    }
  },
);

router.get(
  "/register",
  requestHandler.redirectIfAuthenticated,
  (req: Request, res: Response) => {
    new RegisterView().render(res);
  },
);

router.post(
  "/games/:id/join",
  requestHandler.requireAuth,
  requestHandler.handleJoinGame,
  (req: Request, res: Response) => {
    console.log("Game route");
    new GameView().render(res);
  },
);

export default router;
