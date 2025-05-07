import { Router } from "express";
import signupRouter from "./signup";
import { signinHandler, signoutHandler } from "./signin";
import { requireAuth } from "../../middleware/auth";

const authRouter = Router();
const router = Router();

authRouter.post("/signup", signupRouter);
authRouter.post("/signin", signinHandler);
authRouter.post("/signout", signoutHandler);

// Mount all auth routes
router.use("/", authRouter);

export default router;
