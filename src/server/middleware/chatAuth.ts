import type { RequestHandler } from "express";

// Chat-specific authentication guard
export const requireChatUser: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  res.status(401).json({ error: "Chat: authentication required" });
};
