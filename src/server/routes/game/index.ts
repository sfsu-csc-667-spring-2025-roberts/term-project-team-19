import { Router } from "express";
import createGameHandler from "./handlers/create";
import joinGameHandler from "./handlers/join";
import startGameHandler from "./handlers/start";
import { getGameHandler, getGamesHandler } from "./handlers/get";
import { leaveGameHandler } from "./handlers/leave";
import { endGameHandler } from "./handlers/end";
import { requireAuth } from "../../middleware/auth";
const gameRouter = Router();
const router = Router();

gameRouter.post("/create", requireAuth, createGameHandler);
gameRouter.post("/:game_id/join", requireAuth, joinGameHandler);
gameRouter.post("/:game_id/leave", requireAuth, leaveGameHandler);
gameRouter.post("/:game_id/end", requireAuth, endGameHandler);
gameRouter.post("/:game_id/start", requireAuth, startGameHandler);
gameRouter.get("/:game_id", requireAuth, getGameHandler);

gameRouter.get("/", getGamesHandler);

export default gameRouter;
