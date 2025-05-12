import { Router } from "express";
import signupRouter from "./signup";
import { signinHandler, signoutHandler } from "./signin";
import { requireAuth } from "../../middleware/auth";
import jwt from "jsonwebtoken";

const authRouter = Router();
const router = Router();

authRouter.post("/signup", signupRouter);
authRouter.post("/login", signinHandler);
authRouter.post("/signout", signoutHandler);
authRouter.post("/check", (req, res) => {
  try {
    console.log("=== Auth Check ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Session:", JSON.stringify(req.session.user, null, 2));

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    // verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET!,
    ) as jwt.JwtPayload;

    console.log(decoded);
    if (!decoded) {
      res.status(401).json({ error: "Invalid token" });
      return;
    } else {
      if (decoded.iat && decoded.exp && decoded.iat < decoded.exp) {
        res.status(200).json({
          message: "Authenticated",
          user: req.session.user,
        });
        return;
      } else {
        res.status(401).json({ error: "Token expired" });
        return;
      }
    }
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mount all auth routes
router.use("/", authRouter);

export default router;
