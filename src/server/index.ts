import * as path from "path";
import * as http from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import rootRoutes from "./routes/root";
import authRoutes from "./routes/auth";
import gamesRoutes from "./routes/games";
import testRoutes from "./routes/test";
import { timeMiddleware } from "./middleware/time";

import * as config from "./config";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

// CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session
config.session(app);

app.use(morgan("dev"));
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

app.use(express.static(path.join(process.cwd(), "src", "client", "public")));
app.set("views", path.join(process.cwd(), "src", "server", "templates"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
// redirect to auth
app.use("/auth", authRoutes);
app.use("/games", gamesRoutes);

// app.use((_, __, next) => {
//   next(httpErrors(404));
// });

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
      "sendChat",
      ({
        gameId,
        message,
        playerId,
      }: {
        gameId: string;
        message: string;
        playerId: string;
      }) => {
        io.to(`game_${gameId}`).emit("chatMessage", { message, playerId });
      },
    );

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
