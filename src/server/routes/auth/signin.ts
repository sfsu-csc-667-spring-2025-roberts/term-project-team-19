import { Response, Router } from "express";
import { User } from "../../db/schema";
import bcrypt from "bcrypt";
import {
  UserInstance,
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
  RequestHandler,
} from "../../types";
import jwt from "jsonwebtoken";
import { getActiveGameForUser } from "../../db/utils";
const signinHandler: RequestHandler = async (req, res) => {
  try {
    console.log("=== Signin Handler ===");
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Session before:", req.session);
    console.log("===================");

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    // Find user by email
    const user = (await User.findOne({
      where: { username },
    })) as UserInstance | null;

    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        game_id: 0,
      },
      process.env.SESSION_SECRET!,
      { expiresIn: "24h" },
    );

    const game = await getActiveGameForUser(user.id);

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      game_id: game?.id || 0,
      token: token,
    };

    // Return success response
    res.status(200).json({
      message: "Sign in successful",
      user: req.session.user,
    });
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
