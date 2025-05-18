import { Session } from "express-session";
import { Request } from "express";
import { User as AuthUser } from "../middleware/auth";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  session: Session & {
    user?: AuthUser;
  };
}
