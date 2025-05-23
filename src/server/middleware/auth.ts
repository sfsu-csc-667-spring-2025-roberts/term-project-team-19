import { Response, NextFunction } from "express";
import { AuthenticatedRequest, SessionUser } from "../types";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("=== Require Auth ===");

  // get authorization header
  const authHeader = req.headers.authorization;
  let token = null;
  if (!authHeader || authHeader === "Bearer") {
    token = req.session.user?.token;
    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    token = token.split(" ")[1];
  } else {
    token = authHeader.split(" ")[1];
  }
  // verify token
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
