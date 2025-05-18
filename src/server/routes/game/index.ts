import { Router } from "express";
import createGameHandler from "./handlers/create";
import joinGameHandler from "./handlers/join";
import startGameHandler from "./handlers/start";
import { getGamesHandler } from "./handlers/get";
import { leaveGameHandler } from "./handlers/leave";
import { endGameHandler } from "./handlers/end";
const gameRouter = Router();
const router = Router();

gameRouter.post("/create", createGameHandler);
gameRouter.post("/:game_id/join", joinGameHandler);
gameRouter.post("/:game_id/leave", leaveGameHandler);
gameRouter.post("/:game_id/end", endGameHandler);
gameRouter.post("/:game_id/start", startGameHandler);

gameRouter.get("/", getGamesHandler);

router.use("/games", gameRouter);

export default router;
