window.Chat = {
  instance: null,
  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        auth: Auth.getInstance(),
        socketManager: SocketManager.getInstance(),

        send: async function (message, gameId) {
          let url;
          if (!gameId) {
            console.log("send: no gameId");
            url = `http://localhost:3000/chat/`;
          } else {
            console.log("send: gameId", gameId);
            url = `http://localhost:3000/chat/${gameId}`;
          }
          try {
            console.log(message);
            const response = await fetch(url, {
              method: "POST",
              headers: {
                ...Auth.getInstance().getAuthHeaders(),
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                message,
                username: this.auth.getUser().username,
              }),
            });
            if (response.ok) {
              SocketManager.getInstance().sendMessage(
                message,
                this.auth.getUser().username,
                gameId,
              );
              return await response.json();
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Error creating chat:", error);
            return { error: "Failed to create chat" };
          }
        },

        getChats: async function (gameId) {
          let url;
          if (!gameId) {
            console.log("getChats: no gameId");
            url = `http://localhost:3000/chat/`;
          } else {
            console.log("getChats: gameId", gameId);
            url = `http://localhost:3000/chat/${gameId}`;
          }
          try {
            const response = await fetch(url, {
              method: "GET",
              headers: Auth.getInstance().getAuthHeaders(),
              credentials: "include",
            });
            if (response.ok) {
              return await response.json();
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Error getting chats:", error);
            return { error: "Failed to get chats" };
          }
        },
      };
    }
    return this.instance;
  },
};
