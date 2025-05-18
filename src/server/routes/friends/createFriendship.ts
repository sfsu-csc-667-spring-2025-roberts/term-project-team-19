import { Request, Response, Router, RequestHandler } from "express";
import { FriendshipStatus } from "../../enum/enums";
import { Friendship } from "../../db/schema";
//Create friendship route
// /friendship/create
// Body: user_id friend_id
// request.user has the data
export const createFriendship: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { user_id, friend_id } = req.body;
  if (!user_id || !friend_id) {
    res.sendStatus(400);
    return;
  }
  const newFriendship1 = await Friendship.create({
    user_id,
    friend_id,
    status: FriendshipStatus.PENDING,
  });
  const newFriendship2 = await Friendship.create({
    user_id: friend_id,
    friend_id: user_id,
    status: FriendshipStatus.PENDING,
  });

  if (!newFriendship1) {
    res.sendStatus(500);
    return;
  }
  res.sendStatus(200);
  return;
};

//Accept friendship route
// /friendship/accept
// Body: user_id friend_id
// request.user has the data
export const acceptFriendship: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { user_id, friend_id } = req.body;
  if (!user_id || !friend_id) {
    res.sendStatus(400);
    return;
  }
  let friendship = await Friendship.findOne({
    where: { user_id: user_id, friend_id: friend_id },
  });
  if (!friendship) {
    res.sendStatus(400);
    return;
  }
  const update1 = await Friendship.update(
    {
      status: FriendshipStatus.ACCEPTED,
    },
    {
      where: {
        user_id,
        friend_id,
      },
    },
  );
  const update2 = await Friendship.update(
    {
      status: FriendshipStatus.ACCEPTED,
    },
    {
      where: {
        user_id: friend_id,
        friend_id: user_id,
      },
    },
  );
  if (!update1 || !update2) {
    res.sendStatus(500);
    return;
  }
  res.sendStatus(200);
};

export const deleteFriendship: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { user_id, friend_id } = req.body;
  if (!user_id || !friend_id) {
    res.sendStatus(400);
    return;
  }
  let friendship = await Friendship.findOne({
    where: { user_id: user_id, friend_id: friend_id },
  });
  if (!friendship) {
    res.sendStatus(400);
    return;
  }
  const update1 = await Friendship.update(
    {
      status: FriendshipStatus.REJECTED,
    },
    {
      where: {
        user_id,
        friend_id,
      },
    },
  );
  const update2 = await Friendship.update(
    {
      status: FriendshipStatus.REJECTED,
    },
    {
      where: {
        user_id: friend_id,
        friend_id: user_id,
      },
    },
  );
  if (!update1 || !update2) {
    res.sendStatus(500);
    return;
  }
  res.sendStatus(200);
};
