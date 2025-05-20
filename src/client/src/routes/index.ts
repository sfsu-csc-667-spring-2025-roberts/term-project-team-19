import { Router, Request, Response } from "express";
import { RequestHandler } from "./RequestHandler";
import { LoginView } from "../views/LoginView";
import { RegisterView } from "../views/RegisterView";
import { LandingView } from "../views/LandingView";
import { LobbyView } from "../views/LobbyView";
import { GameView } from "../views/GameView";
import { GameManager } from "../middleware/game";
import { Auth } from "../middleware/auth";
import { SocketManager } from "../middleware/socket";

const router = Router();
const requestHandler = RequestHandler.getInstance();
const gameManager = GameManager.getInstance();
const socketManager = SocketManager.getInstance();
const auth = Auth.getInstance();
// Root route - redirects based on auth status
router.get(
  "/",
  //requestHandler.requireAuth,
  async (req: Request, res: Response) => {
    await new LandingView(gameManager).render(res);
  },
);

// Protected routes
router.get(
  "/landing",
  //  requestHandler.requireAuth,
  async (req: Request, res: Response) => {
    await new LandingView(gameManager).render(res);
  },
);

router.get(
  "/game",
  //requestHandler.requireAuth,
  (req: Request, res: Response) => {
    new GameView().render(res);
  },
);

// Public routes
router.get(
  "/login",
  //requestHandler.redirectIfAuthenticated,
  (req: Request, res: Response) => {
    new LoginView().render(res);
  },
);

router.post(
  "/login",
  //requestHandler.handleLogin,
  (req: Request, res: Response) => {
    if (res.statusCode === 200) {
      res.redirect("/landing");
    }
  },
);

router.post(
  "/logout",
  //requestHandler.handleLogout,
  (req: Request, res: Response) => {},
);

router.post(
  "/register",
  //requestHandler.handleRegister,
  (req: Request, res: Response) => {
    if (res.statusCode === 200) {
      res.redirect("/login");
    }
  },
);

router.get(
  "/register",
  //requestHandler.redirectIfAuthenticated,
  (req: Request, res: Response) => {
    new RegisterView().render(res);
  },
);

// router.post(
//   "/games/:id/join",
//   //requestHandler.requireAuth,
//   requestHandler.handleJoinGame,
//   (req: Request, res: Response) => {
//     console.log("Game route");
//     new GameView().render(res);
//   },
// );

router.post(
  "/games/create",
  //requestHandler.requireAuth,
  requestHandler.handleCreateGame,
);

router.get(
  "/games/:game_id/play",
  //requestHandler.requireAuth,
  (req: Request, res: Response) => {
    new GameView().render(res);
  },
);

router.get(
  "/games/:id/lobby",
  //requestHandler.requireAuth,
  (req: Request, res: Response) => {
    // socketManager.joinGame(parseInt(req.params.id));
    // socketManager.getSocket()?.on("playerJoined", (data) => {
    //   console.log("Player joined: ", data);
    // });
    new LobbyView(gameManager, parseInt(req.params.id)).render(res);
  },
);

export default router;
