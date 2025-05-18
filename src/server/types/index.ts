import { Model } from "sequelize";
import {
  Request,
  Response,
  RequestHandler as ExpressRequestHandler,
} from "express";
import { ParsedQs } from "qs";
import { Session } from "express-session";
import { ParamsDictionary } from "express-serve-static-core";
import { GameStatus } from "../enum/enums";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  game_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

export interface GameAttributes {
  id: number;
  host_id: number | null;
  member_2_id: number | null;
  member_3_id: number | null;
  member_4_id: number | null;
  status: GameStatus;
  current_turn: number;
  turn_direction: number;
}

export interface GameInstance extends Model<GameAttributes>, GameAttributes {}

export interface ChatlogAttributes {
  id: number;
  game_id: number;
  user_id: number;
  message: string;
  timestamp: number;
}

export interface CardDefinitionAttributes {
  id: number;
  name: string;
  color: string;
}

export interface CardDefinitionInstance
  extends Model<CardDefinitionAttributes>,
    CardDefinitionAttributes {}

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  game_id: number;
  token: string;
}

declare module "express-session" {
  interface Session {
    user?: SessionUser;
  }
}

export interface AuthenticatedRequest extends Request {
  session: Session;
}

export type RequestHandler = ExpressRequestHandler<
  ParamsDictionary,
  any,
  any,
  ParsedQs,
  Record<string, any>
>;
export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
) => void | Promise<void>;

export interface ChatMessage {
  message: string;
  sender: string;
  gravatar?: string;
  timestamp: number;
}
