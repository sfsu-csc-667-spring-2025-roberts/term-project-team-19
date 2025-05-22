import { Request, Response, Router, RequestHandler } from "express";
import { FriendshipStatus } from "../../enum/enums";
import { Friendship } from "../../db/schema";

//Get Frienships
//Body: user_id
export const getFriendship: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { user_id } = req.body;
  console.log(req.body, user_id);
  if (!user_id) {
    res.sendStatus(400);
  }
  const friends = await Friendship.findAll({
    where: { user_id: user_id },
  });
  console.log({ friends });
  res.status(200).json({ friends });
  return;
};
