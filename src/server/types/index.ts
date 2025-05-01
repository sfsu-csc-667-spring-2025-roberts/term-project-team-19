import { Model } from 'sequelize';
import { Request, Response, RequestHandler as ExpressRequestHandler } from 'express';
import { ParsedQs } from 'qs';
import { Session } from 'express-session';
import { ParamsDictionary } from 'express-serve-static-core';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes { }

export interface SessionUser {
    id: number;
    username: string;
    email: string;
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