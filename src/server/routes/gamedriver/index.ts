import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getUserCardsHandler } from "./handlers/get";
import { playCardHandler } from "./handlers/play";
import { drawCardHandler } from "./handlers/draw";

const playRouter = Router();

playRouter.get("/:game_id/:user_id/cards", requireAuth, getUserCardsHandler);
playRouter.post("/:game_id/play", requireAuth, playCardHandler);
playRouter.post("/:game_id/draw", requireAuth, drawCardHandler);
export default playRouter;
