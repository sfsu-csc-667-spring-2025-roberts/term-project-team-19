import { Model } from 'sequelize';
import { Request, Response, RequestHandler as ExpressRequestHandler } from 'express';
import { ParsedQs } from 'qs';
import { Session } from 'express-session';
import { ParamsDictionary } from 'express-serve-static-core';
import { GameStatus } from '../enum/enums';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    game_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes { }

export interface GameAttributes {
    id: number;
    host_id: number;
    member_2_id: number;
    member_3_id: number;
    member_4_id: number;
    status: GameStatus;
    current_turn: number;
    turn_direction: number;
}

export interface GameInstance extends Model<GameAttributes>, GameAttributes { }

export interface SessionUser {
    id: number;
    username: string;
    email: string;
    game_id: number;
}

declare module 'express-session' {
    interface Session {
        user?: SessionUser;
    }
}

export interface AuthenticatedRequest extends Request {
    session: Session;
}

export type RequestHandler = ExpressRequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
export type AuthenticatedRequestHandler = (req: AuthenticatedRequest, res: Response) => void | Promise<void>; 