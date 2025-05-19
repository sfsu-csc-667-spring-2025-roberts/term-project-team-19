window.Game = {
  instance: null,
  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        auth: Auth.getInstance(),
        gameId: null,
        //socketManager: SocketManager.getInstance(),
        createGame: async () => {
          try {
            const response = await fetch(`http://localhost:3000/games/create`, {
              method: "POST",
              headers: auth.getAuthHeaders(),
              credentials: "include",
            });
            return response;
          } catch (error) {
            console.error("Failed to create game:", error);
            return null;
          }
        },
        joinGame: async (gameId) => {
          try {
            const response = await fetch(
              `http://localhost:3000/games/${gameId}/join`,
              {
                method: "POST",
                headers: auth.getAuthHeaders(),
                credentials: "include",
              },
            );
            console.log("response: ", response);

            if (response.ok) {
              const res = await response.json();
              auth.setAuthData(res);
              this.gameId = res.game_id;
              //window.SocketManager.getInstance().joinGame(gameId);
              window.location.href = `/games/${gameId}/lobby`;
            } else if (response.status === 400) {
              const res = await response.json();
              auth.setAuthData(res);
              alert(res.error);
              this.gameId = res.game_id;
              window.location.href = `/games/${res.game_id}/lobby`;
              return res;
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Failed to join game:", error);
            return null;
          }
        },
        leaveGame: async (gameId) => {
          console.log("leaveGame: ", gameId);
          try {
            const response = await fetch(
              `http://localhost:3000/games/${gameId}/leave`,
              {
                method: "POST",
                headers: auth.getAuthHeaders(),
                credentials: "include",
              },
            );
            console.log("response: ", response);
            if (response.ok) {
              return await response.json();
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Failed to leave game:", error);
            return null;
          }
        },
        fetchGame: async (gameId) => {
          try {
            console.log("fetchGame: ", gameId);
            console.log("auth.getAuthHeaders(): ", auth.getAuthHeaders());
            const response = await fetch(
              `http://localhost:3000/games/${gameId}`,
              {
                method: "GET",
                headers: auth.getAuthHeaders(),
                credentials: "include",
              },
            );

            if (response.ok) {
              return await response.json();
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Failed to fetch game:", error);
            return null;
          }
        },
        fetchGames: async () => {
          try {
            const response = await fetch(`http://localhost:3000/games`, {
              method: "GET",
              headers: {
                ...auth.getAuthHeaders(),
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
              credentials: "include",
            });

            if (response.ok) {
              return await response.json();
            } else {
              return await response.json();
            }
          } catch (error) {
            console.error("Failed to fetch games:", error);
            return null;
          }
        },
      };
    }
    return this.instance;
  },
};
