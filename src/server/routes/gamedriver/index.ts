import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getUserCardsHandler } from "./handlers/get";
import { playCardHandler } from "./handlers/play";

const playRouter = Router();

playRouter.get("/:game_id/:user_id/cards", requireAuth, getUserCardsHandler);
playRouter.post("/:game_id/play", requireAuth, playCardHandler);

export default playRouter;
