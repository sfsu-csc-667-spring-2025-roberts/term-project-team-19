import { io, Socket } from "socket.io-client";

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private gameId: number | null = null;

  private constructor() {
    // Initialize socket connection
    this.socket = io("http://localhost:3000", {
      withCredentials: true,
    });

    // Set up basic event listeners
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public joinGame(gameId: number) {
    if (!this.socket) {
      console.log("No socket connection");
      return;
    }

    this.gameId = gameId;
    this.socket.emit("joinGame", gameId.toString());

    // Set up game-specific event listeners
    this.socket.on("playerJoined", (data) => {
      console.log(`Player ${data.username} joined the game`);
      // You can emit a custom event to notify your UI
      window.dispatchEvent(
        new CustomEvent("game:playerJoined", { detail: data }),
      );
    });
  }

  public leaveGame() {
    if (!this.socket || !this.gameId) return;

    this.socket.emit("leaveGame", this.gameId.toString());
    this.gameId = null;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}
