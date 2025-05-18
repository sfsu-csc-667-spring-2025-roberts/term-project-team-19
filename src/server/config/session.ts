import connectPgSimple from "connect-pg-simple";
import { RequestHandler } from "express";
import session from "express-session";

// Session store configuration
const PgStore = connectPgSimple(session as any);
const store = new PgStore({
  conObject: {
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
  },
  createTableIfMissing: true,
});

const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
  },
}) as unknown as RequestHandler;

export { sessionMiddleware };
