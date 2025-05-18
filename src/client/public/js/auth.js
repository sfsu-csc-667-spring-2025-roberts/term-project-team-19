// Authentication utilities
window.Auth = {
  instance: null,

  getInstance: function () {
    if (!this.instance) {
      this.instance = {
        setAuthData: (data) => {
          console.log("Setting auth data", data);
          localStorage.setItem("token", data.user.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              game_id: data.user.game_id,
            }),
          );
          console.log("Auth data set", localStorage.getItem("token"));
          console.log("Auth data set", localStorage.getItem("user"));
        },

        getAuthHeaders: function () {
          return {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          };
        },

        login: async (username, password) => {
          // post to login route
          const response = await fetch(`http://localhost:3000/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });
          console.log("response", response);
          const data = await response.json();

          console.log("data", data);

          if (response.ok) {
            // Store auth data using the auth utility
            auth.setAuthData(data);
            // Redirect to landing page
            window.location.href = "/landing";
          } else if (response.status === 401) {
            return 401;
          } else {
            return 500;
          }
        },

        register: async (username, email, password) => {
          const response = await fetch(`http://localhost:3000/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
          });
          if (response.ok) {
            window.location.href = "/login";
          } else {
            return await response.json();
          }
        },

        getToken: () => {
          return localStorage.getItem("token");
        },

        getUser: () => {
          const userStr = localStorage.getItem("user");
          return userStr ? JSON.parse(userStr) : null;
        },

        isAuthenticated: async () => {
          console.log("token", localStorage.getItem("token"));
          // Verify token with server
          const response = await fetch("http://localhost:3000/auth/check", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
          }).catch((error) => {
            console.error("Token verification failed:", error);
            return false;
          });
          if (response.ok) {
            console.log("Token is valid");
            return true;
          } else {
            console.log("Token is invalid");
            return false;
          }
        },

        logout: async () => {
          const response = await fetch("http://localhost:3000/auth/signout", {
            method: "POST",
            credentials: "include",
          });

          if (response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          } else {
            console.error("Failed to logout");
          }
        },
      };
    }
    return this.instance;
  },
};
