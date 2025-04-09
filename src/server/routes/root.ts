import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const title = "Test Title";
  const name = "test Name";

  res.render("root", { title, name });
});

export default router;
