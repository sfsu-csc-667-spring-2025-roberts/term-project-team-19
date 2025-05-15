import { Response, Router } from "express";
import { User } from "../../db/schema";
import bcrypt from "bcrypt";
import {
  UserInstance,
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
  RequestHandler,
} from "../../types";

const signinHandler: RequestHandler = async (req, res) => {
  try {
    console.log("=== Signin Handler ===");
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("===================");

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    // Find user by email
    const user = (await User.findOne({
      where: { email },
    })) as UserInstance | null;

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      game_id: 0,
    };
    res.redirect("/lobby");

    // Return success response (excluding password hash)
    //const { password_hash, ...userWithoutPassword } = user.toJSON();
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const signoutHandler: AuthenticatedRequestHandler = (req, res) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      console.error("Signout error:", err);
      res.status(500).json({ error: "Error signing out" });
      return;
    }
    res.status(200).json({ message: "Signed out successfully" });
  });
};

export { signinHandler, signoutHandler };
