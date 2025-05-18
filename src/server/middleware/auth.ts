import { Response, NextFunction } from "express";
import { AuthenticatedRequest, SessionUser } from "../types";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("=== Require Auth ===");
  console.log("Session:", JSON.stringify(req.session, null, 2));
  console.log(req.headers);
  // get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  // verify token
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(
    token,
    process.env.SESSION_SECRET!,
  ) as jwt.JwtPayload;

  console.log(decoded);
  console.log("================================================\n\n");
  if (!decoded || !decoded.iat || !decoded.exp) {
    res.status(401).json({ error: "Invalid token" });
    return;
  } else {
    if (decoded.iat > decoded.exp) {
      res.status(401).json({ error: "Token expired" });
      return;
    } else {
      req.session.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        game_id: decoded.game_id,
        token: token,
      } as SessionUser;
    }
  }

  next();
};
