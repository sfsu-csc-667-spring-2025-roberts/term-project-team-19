import * as path from "path";
import * as http from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import type { RequestHandler } from "express-serve-static-core";
import httpErrors from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import authRoutes from "./routes/auth";
import gamesRoutes from "./routes/game";
import chatRouter from "./routes/chat";
import { timeMiddleware } from "./middleware/time";
import friendRoutes from "./routes/friends/index";

import * as config from "./config";
import { sessionMiddleware } from "./config/session";
import { User } from "client/src/types";
import { SessionUser } from "./types";
import playRouter from "./routes/gamedriver";

const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(cookieParser());

app.use(sessionMiddleware);

app.use(express.static(path.join(process.cwd(), "src", "client", "public")));
app.set("views", path.join(process.cwd(), "src", "server", "templates"));
app.set("view engine", "ejs");

// redirect to auth
app.use("/auth", authRoutes);
app.use("/games", gamesRoutes);
app.use("/chat", chatRouter);
app.use("/friendship", friendRoutes);
app.use("/play", playRouter);

app.use((_, __, next) => {
  next(httpErrors(404));
});

try {
  io.on("connection", (socket: any) => {
    console.log("A user connected:", socket.id);

    socket.on("joinGame", (gameId: string) => {
      socket.join(`game_${gameId}`);
    });

    socket.on(
      "playCard",
      ({
        gameId,
        card,
        playerId,
      }: {
        gameId: string;
        card: any;
        playerId: string;
      }) => {
        // TODO: Validate and update game state in DB
        io.to(`game_${gameId}`).emit("cardPlayed", { card, playerId });
      },
    );

    socket.on(
      "SendMessage",
      ({
        message,
        username,
        game_id,
      }: {
        game_id: string;
        message: string;
        username: string;
      }) => {
        console.log("SendMessage: ", message, username, game_id);
        io.to(`game_${game_id}`).emit("chatMessage", { message, username });
      },
    );

    socket.on("joinGame", (game_id: string, username: string) => {
      console.log("joinGame: ", game_id, username);
      socket.join(`game_${game_id}`);
      io.to(`game_${game_id}`).emit("playerJoined", { username: username });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
