import express from "express";
import { Request, Response } from "express";
import { ChatMessage } from "../../types";
import { sendMessageHandler } from "./handlers/send";
import { getMessagesHandler, getMessagesHandlerGlobal } from "./handlers/get";
import { sendMessageHandlerGlobal } from "./handlers/send";
const chatRouter = express.Router();

chatRouter.post("/:game_id", sendMessageHandler);
chatRouter.post("/", sendMessageHandlerGlobal);
chatRouter.get("/:game_id", getMessagesHandler);
chatRouter.get("/", getMessagesHandlerGlobal);

export default chatRouter;
