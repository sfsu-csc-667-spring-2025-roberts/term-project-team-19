// Socket manager implementation
window.SocketManager = {
  instance: null,

  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        gameId: null,
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
            // You can emit a custom event to notify your UI
            window.dispatchEvent(
              new CustomEvent(`game_${gameId}:playerJoined`, { detail: data }),
            );
          });
        },

        joinLanding: function () {
          if (!this.socket) {
            console.log("No socket connection");
            return;
          }
          this.socket.emit("joinLanding");
        },

        startGame: function (gameId) {
          if (!this.socket) {
            console.log("No socket connection");
            return;
          }
          this.socket.emit("gameStart", gameId.toString());
          window.dispatchEvent(
            new CustomEvent(`game_${gameId}:gameStarted`, { detail: data }),
          );
        },

        sendMessage: function (message, username, game_id) {
          if (!this.socket) {
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

        playCard: function (gameId, card) {
          if (!this.socket || !gameId || !card) return;
          const user = auth.getUser();
          console.log("playCard: ", gameId, card, user.username);

          this.socket.emit("playCard", {
            gameId,
            card,
            username: user.username,
          });
        },

        drawCard: function (gameId) {
          if (!this.socket || !gameId) return;
          const user = auth.getUser();
          console.log("drawCard: ", gameId, user.username);
          this.socket.emit("drawCard", { gameId, username: user.username });
        },

        endTurn: function (gameId) {
          if (!this.socket || !gameId) return;
          const user = auth.getUser();
          console.log("turnOver: ", gameId, user.username);
          this.socket.emit("turnOver", { gameId, username: user.username });
        },

        callUno: function (gameId) {
          if (!this.socket || !gameId) return;
          const user = auth.getUser();
          console.log("callUno: ", gameId, user.username);
          this.socket.emit("callUno", { gameId, username: user.username });
        },

        gameEnded: function (gameId) {
          if (!this.socket || !gameId) return;
          const user = auth.getUser();
          console.log("gameEnded: ", gameId, user.username);
          this.socket.emit("gameEnded", { gameId, username: user.username });
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
