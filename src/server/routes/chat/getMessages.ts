 // backend/routes/chat.js
import { Router } from 'express';
import pool from '../db.js'; // adjust path to match your db config file

const router = Router();

router.post('/chat/messages', async (req, res) => {
  try {
    const { gameId, userId, lastTime } = req.body;

    if (!gameId || !lastTime) {
      return res.status(400).json({ error: 'Missing gameId or lastTime in request body.' });
    }

    const result = await pool.query(
      `
      SELECT id, game_id, user_id, content, sent_at
      FROM chat_logs
      WHERE game_id = $1 AND sent_at > $2
      ORDER BY sent_at ASC
      `,
      [gameId, lastTime]
    );

    return res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


/*
 id | game_id | user_id |     content      |       sent_at        
----+---------+---------+------------------+------------------------
  1 |      10 |       2 | Let’s win this!  | 2025-05-01 11:02:15
  2 |      10 |       3 | Push mid now     | 2025-05-01 11:02:20
  3 |      11 |       1 | Hello team!      | 2025-05-01 11:05:01
  4 |      10 |       2 | Heal me!         | 2025-05-01 11:06:03


  front end will send request with the 
  timestamp of the last message, game_id, and user_id 
  to this route. whenever this route is called we will 
  return the recent messages in order with the time
*/ 
 