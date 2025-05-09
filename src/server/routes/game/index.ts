import { Router } from "express";
import createGameHandler from "./handlers/create";
import joinGameHandler from "./handlers/join";
import startGameHandler from "./handlers/start";
import initializeGameCardsHandler from "./handlers/initialize_cards";
import { getGamesHandler } from "./handlers/get";

const gameRouter = Router();
const router = Router();

gameRouter.post("/create", createGameHandler);
gameRouter.post("/join", joinGameHandler);
gameRouter.post("/start", startGameHandler);
gameRouter.post("/initialize-cards", initializeGameCardsHandler);

gameRouter.get("/", getGamesHandler);

router.use("/games", gameRouter);

export default router;
