import { Router, Request, Response, response } from "express";
const router = Router();
import { FriendshipStatus } from "../../enum/enums";
import {
  acceptFriendship,
  createFriendship,
  deleteFriendship,
} from "./createFriendship";

router.post("/create", createFriendship);
router.post("/accept", acceptFriendship);
router.post("/delete", deleteFriendship);

export default router;
