// Socket manager implementation
window.SocketManager = {
  instance: null,
  socket: null,
  gameId: null,

  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        socket: null,
        init: function () {
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
        },
        joinGame: function (gameId) {
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
        },

        sendMessage: function (message, username, game_id) {
          if (!this.socket || !game_id) {
            console.log("No socket connection or game_id");
            return;
          }
          console.log("sendMessage: ", message, username, game_id);
          this.socket.emit("SendMessage", { message, username, game_id });
        },

        leaveGame: function (gameId) {
          if (!this.socket || !gameId) return;

          this.socket.emit("leaveGame", gameId.toString());
        },
        getSocket: function () {
          return this.socket;
        },
      };
      this.instance.init();
    }
    return this.instance;
  },
};
