import express from "express";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", (req, res) => {
  const title = "Test Title";
  const name = "test Name";

  res.render("root", { title, name });
});

router.get('/test-auth', requireAuth, (req, res) => {
  res.send("Hello World");
});

export default router;
