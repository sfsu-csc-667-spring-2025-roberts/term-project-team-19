import express from "express";
import { Request, Response } from "express";
import { ChatMessage } from "../../types";
import { sendMessageHandler } from "./handlers/send";
import { getMessagesHandler } from "./handlers/get";
const chatRouter = express.Router();

chatRouter.post("/:game_id", sendMessageHandler);
chatRouter.get("/:game_id", getMessagesHandler);

export default chatRouter;
