import { SERVER_URL } from "../config.js";
export class Auth {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    // Check for existing session
    this.checkSession();
  }
  static getInstance() {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
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
  async checkSession() {
    try {
      const response = await fetch(`${SERVER_URL}/auth/check`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
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
        const user = await response.json();
        this.currentUser = user;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }
  async register(username, email, password) {
    try {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration failed:", error);
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
      this.notifyListeners();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  getUser() {
    return this.currentUser;
  }
  isAuthenticated() {
    return this.currentUser !== null;
  }
}
//# sourceMappingURL=auth.js.map
