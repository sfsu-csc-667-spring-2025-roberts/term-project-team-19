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
import { SessionUser, UserInstance } from "./types";
import playRouter from "./routes/gamedriver";
import { Chatlog, User } from "./db/schema";

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
      console.log("joinGame");
      socket.join(`game_${gameId}`);
    });

    socket.on("joinLanding", () => {
      console.log("joinLanding");
      socket.join("landing");
    });

    socket.on(
      "playCard",
      async ({
        gameId,
        card,
        username,
      }: {
        gameId: string;
        card: any;
        username: string;
      }) => {
        console.log(`${username} played a ${card} card`);
        // io.to(`game_${gameId}`).emit("cardPlayed", { card, username });

        // send game move chat log
        await Chatlog.create({
          game_id: gameId,
          user_id: 3,
          message: `${username} played a ${card} card`,
          timestamp: Date.now(),
        });
        io.to(`game_${gameId}`).emit("chatMessage", {
          message: `${username.toUpperCase()} played a ${card.toUpperCase()} CARD`,
          username: "chatbot",
        });
      },
    );

    socket.on(
      "turnOver",
      async ({ gameId, username }: { gameId: string; username: string }) => {
        io.to(`game_${gameId}`).emit("nextTurn");
      },
    );

    socket.on(
      "drawCard",
      async ({
        gameId,
        username,
      }: {
        gameId: string;
        card: any;
        username: string;
      }) => {
        // io.to(`game_${gameId}`).emit("cardDrawn", { username });

        // send game move chat log
        await Chatlog.create({
          game_id: gameId,
          user_id: 3,
          message: `${username} drew a card`,
          timestamp: Date.now(),
        });
        io.to(`game_${gameId}`).emit("chatMessage", {
          message: `${username.toUpperCase()} drew a card`,
          username: "chatbot",
        });
      },
    );

    socket.on(
      "currentTurn",
      async ({ game_id, user_id }: { game_id: string; user_id: number }) => {
        console.log("currentTurn: ", game_id, user_id);
        const user = (await User.findByPk(user_id)) as UserInstance;
        // send game move chat log
        await Chatlog.create({
          game_id: game_id,
          user_id: 3,
          message: `It's ${user.username.toUpperCase()}'s turn`,
          timestamp: Date.now(),
        });
        io.to(`game_${game_id}`).emit("chatMessage", {
          message: `It's ${user.username.toUpperCase()}'s turn`,
          username: "chatbot",
        });
      },
    );

    socket.on(
      "callUno",
      async ({ gameId, username }: { gameId: string; username: string }) => {
        console.log("callUno: ", gameId, username);
        // send game move chat log
        await Chatlog.create({
          game_id: parseInt(gameId),
          user_id: 3,
          message: `${username.toUpperCase()} called UNO`,
          timestamp: Date.now(),
        });
        io.to(`game_${gameId}`).emit("chatMessage", {
          message: `${username.toUpperCase()} called UNO`,
          username: "chatbot",
        });
      },
    );

    socket.on(
      "gameEnded",
      async ({ gameId, username }: { gameId: string; username: string }) => {
        console.log("gameEnded: ", gameId, username);
        // send game move chat log
        await Chatlog.create({
          game_id: parseInt(gameId),
          user_id: 3,
          message: `${username.toUpperCase()} won the game`,
          timestamp: Date.now(),
        });
        io.to(`game_${gameId}`).emit("chatMessage", {
          message: `${username.toUpperCase()} won the game`,
          username: "chatbot",
        });
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
        if (game_id) {
          io.to(`game_${game_id}`).emit("chatMessage", { message, username });
        } else {
          io.to("landing").emit("chatMessage", { message, username });
        }
      },
    );

    socket.on("joinGame", (game_id: string, username: string) => {
      console.log("joinGame: ", game_id, username);
      socket.join(`game_${game_id}`);
      io.to(`game_${game_id}`).emit("playerJoined", { username: username });
    });

    socket.on("gameStart", (game_id: string) => {
      console.log("gameStart: ", game_id);
      io.to(`game_${game_id}`).emit("gameStarted", { game_id });
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
