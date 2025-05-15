import { Router } from "express";
import signupRouter from "./signup";
import { signinHandler, signoutHandler } from "./signin";
import { requireAuth } from "../../middleware/auth";

const authRouter = Router();
const router = Router();

authRouter.get("/login", (req, res) => {
  res.render("auth/login", {
    error: (req.query.error as string) || null,
    email: (req.query.email as string) || "",
  });
});

authRouter.get("/signup", (req, res) => {
  res.render("auth/register", {
    error: (req.query.error as string) || null,
    username: (req.query.username as string) || "",
    email: (req.query.email as string) || ""
  });
});

authRouter.post("/signup", signupRouter);
authRouter.post("/signin", signinHandler);
authRouter.post("/signout", signoutHandler);
authRouter.post("/check", (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mount all auth routes
router.use("/", authRouter);

export default router;
