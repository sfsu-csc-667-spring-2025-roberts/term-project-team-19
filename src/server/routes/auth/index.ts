import { Router } from "express";
import signupRouter from "./signup";
import { signinHandler, signoutHandler } from "./signin";
import { requireAuth } from "../../middleware/auth";

const authRouter = Router();
const router = Router();

authRouter.post("/signup", signupRouter);
authRouter.post("/signin", signinHandler);
authRouter.post("/signout", signoutHandler);
authRouter.post("/check", (req, res) => {
  try {
    const user = req.session.user;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "User not signed in" });
  }
});

// Mount all auth routes
router.use("/", authRouter);

export default router;
