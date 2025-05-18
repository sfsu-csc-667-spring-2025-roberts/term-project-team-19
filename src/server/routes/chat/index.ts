import express from "express";
import { Request, Response } from "express";
import { ChatMessage } from "../../types";
import { sendMessageHandler } from "./handlers/send";

const chatRouter = express.Router();

chatRouter.post("/:game_id/send", sendMessageHandler);

export default chatRouter;
