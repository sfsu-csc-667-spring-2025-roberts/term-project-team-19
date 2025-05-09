import type { Express, RequestHandler } from "express";

import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import sequelize from "../db/config";

let sessionMiddleware: RequestHandler;

const configureSession = (app: Express) => {
  const store = new (connectPgSimple(session))({
    conObject: {
      connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
    },
    createTableIfMissing: true,
  });
  sessionMiddleware = session({
    store,
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
  app.use(sessionMiddleware);
};

export default configureSession;
export { sessionMiddleware };
