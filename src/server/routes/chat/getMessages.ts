import { Router, Request, Response, NextFunction } from "express";
import { Chatlog } from "../../db/schema";
import { Op } from "sequelize";

const router = Router();

const getNewMessages = async (
  req: Request<
    { gameId: string },
    any,
    { userId: number; timeOfLastSentMessage: string }
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const gameId = Number(req.params.gameId);
  const { userId, timeOfLastSentMessage } = req.body;

  try {
    const newMessages = await Chatlog.findAll({
      where: {
        game_id: gameId,
        sent_at: { [Op.gt]: timeOfLastSentMessage },
      },
      order: [["sent_at", "ASC"]],
    });

    res.json({ success: true, messages: newMessages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

router.post("/chat/messages/:gameId", getNewMessages);

export default router;

/* - fix authentication for the game id,
     because right now anyone with game id can see 
     the chats by searching it.

  -  input validation needs to be fixed

  - should be GET not POST

  - Unbounded result set

  - No limit or pagination. If a client’s timeOfLastSentMessage is
    very old (or omitted), you could end up pulling back thousands of
    rows in one go, which can kill performance.
  - String‐based timestamp comparisons

  - Relying on Sequelize/your DB to coerce a JS string into the proper
   date type risks timezone or lexicographical‐vs‐chronological bugs.
   It’s safer to parse into a Date (or use a JS Date on the Sequelize side)
    so you know exactly what you’re comparing.
 - No explicit error for invalid gameId

If gameId is NaN, the where clause silently becomes game_id = NaN (which matches nothing) rather than returning a “400 Bad Request: invalid gameId.”
 */
