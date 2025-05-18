import type { Express } from "express";
import type { Server } from "socket.io";
import { sessionMiddleware } from "./session";

const configureSockets = (io: Server, app: Express) => {
  app.set("io", io);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    // @ts-ignore
    const { id, user } = socket.request.session;

    console.log(
      `User [${user.id}] connected: ${user.email} with session id: ${id}`,
    );

    socket.join(user.id);

    // Handle game-related events
    socket.on("joinGame", (gameId: string) => {
      socket.join(`game_${gameId}`);
      console.log(`User [${user.id}] joined game room: game_${gameId}`);
    });

    socket.on("leaveGame", (gameId: string) => {
      socket.leave(`game_${gameId}`);
      console.log(`User [${user.id}] left game room: game_${gameId}`);
    });

    socket.on("disconnect", () => {
      console.log(
        `User [${user.id}] disconnected: ${user.email} with session id: ${id}`,
      );
    });
  });
};
export default configureSockets;
