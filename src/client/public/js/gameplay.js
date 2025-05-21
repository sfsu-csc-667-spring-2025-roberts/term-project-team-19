window.Gameplay = {
  instance: null,
  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        auth: Auth.getInstance(),
        game: Game.getInstance(),
        socketManager: SocketManager.getInstance(),
        async playCard(game_id, card, change_color = false) {
          const user = this.auth.getUser();
          const req_body = {
            game_id: game_id,
            user_id: user.id,
            game_card_id: card.id,
            type: card.type,
            color: card.color,
            action: null,
            value: card.value,
            change_color: change_color,
          };
          const response = await fetch(
            `http://localhost:3000/play/${game_id}/play`,
            {
              method: "POST",
              headers: {
                ...this.auth.getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(req_body),
              credentials: "include",
            },
          );
          return response;
        },

        async playWildCard(game_id, card, color, change_color = true) {
          const user = this.auth.getUser();
          const req_body = {
            game_id: game_id,
            user_id: user.id,
            game_card_id: card.id,
            type: card.type,
            color: color,
            change_color: change_color,
            action: null,
            value: null,
          };
          const response = await fetch(
            `http://localhost:3000/play/${game_id}/play`,
            {
              method: "POST",
              headers: {
                ...this.auth.getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(req_body),
              credentials: "include",
            },
          );
          return response;
        },

        async playActionCard(game_id, card, change_color = false) {
          const user = this.auth.getUser();
          const req_body = {
            game_id: game_id,
            user_id: user.id,
            game_card_id: card.id,
            type: card.type,
            color: card.color,
            action: card.action,
            value: null,
            change_color: change_color,
          };
          const response = await fetch(
            `http://localhost:3000/play/${game_id}/play`,
            {
              method: "POST",
              headers: {
                ...this.auth.getAuthHeaders(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify(req_body),
              credentials: "include",
            },
          );
          return response;
        },
      };
    }
    return this.instance;
  },
};
