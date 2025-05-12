// Server configuration
const SERVER_URL = "http://localhost:3000";

// Auth class implementation for client-side
class Auth {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    // Check for existing session
    this.checkSession();
  }

  async login(username, password) {
    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const res = await response.json();
        this.currentUser = res.user;
        // Store auth token in localStorage
        localStorage.setItem("authToken", res.user.token);
        localStorage.setItem("user", JSON.stringify(this.currentUser));
        this.notifyListeners();
        return res;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  async logout() {
    try {
      await fetch(`${SERVER_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      this.currentUser = null;
      // Clear auth data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  }

  async checkSession() {
    try {
      // First check localStorage
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("authToken");

      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
        return;
      }

      // If no stored user, check with server
      const response = await fetch(`${SERVER_URL}/auth/check`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const res = await response.json();
        this.currentUser = res.user;
        localStorage.setItem("authToken", res.user.token);
        localStorage.setItem("user", JSON.stringify(this.currentUser));
        this.notifyListeners();
      } else {
        // Clear any stale data
        this.currentUser = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      // Clear any stale data on error
      this.currentUser = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      this.notifyListeners();
    }
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return (
      this.currentUser !== null && localStorage.getItem("authToken") !== null
    );
  }

  addAuthListener(listener) {
    this.authListeners.push(listener);
  }

  removeAuthListener(listener) {
    this.authListeners = this.authListeners.filter((l) => l !== listener);
  }

  notifyListeners() {
    this.authListeners.forEach((listener) => listener(this.currentUser));
  }
}

// Initialize auth
const auth = new Auth();

// Add event listener to login form
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  try {
    // post to login route
    const response = await fetch(`http://localhost:3001/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      window.location.href = "/lobby";
    } else {
      errorMessage.textContent = "Invalid username or password";
    }
  } catch (error) {
    errorMessage.textContent = "An error occurred. Please try again.";
    console.error("Login error:", error);
  }
});
