import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect("/auth/login");   
  res.render("lobby", { user });
});

export default router;
