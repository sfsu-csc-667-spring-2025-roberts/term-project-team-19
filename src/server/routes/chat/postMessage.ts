import { Router } from "express";
import { Chatlog } from "../../db/schema"; // adjust path as needed
import { NOW } from "sequelize";

const router = Router();

router.post("/chat/messages/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const { userId, message } = req.body;

  try {
    const newMessage = await Chatlog.create({
      game_id: gameId,
      user_id: userId,
      content: message,
      sent_at: new NOW(),
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).json({ success: false, error: "Failed to save message" });
  }
});

export default router;

//
