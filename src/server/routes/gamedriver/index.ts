import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getUserCardsHandler } from "./handlers/get";

const playRouter = Router();

playRouter.get("/:game_id/:user_id/cards", requireAuth, getUserCardsHandler);

export default playRouter;
